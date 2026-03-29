import datetime

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select, update

from database.engine import get_session
from database.models import Summary, Transcript, User
from utilities.auth import get_current_user
from utilities.graph import get_user_transcript

summary_router = APIRouter(prefix="/api")


class SummaryOut(BaseModel):
    id: int
    transcript_id: int
    content: str
    generated_at: datetime.datetime


def _require_transcript(transcript_id: int, user: User, db: Session) -> Transcript:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    if transcript.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )
    return transcript


@summary_router.get("/summaries/{transcript_id}", response_model=SummaryOut)
def get_summary(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    row = db.exec(select(Summary).where(Summary.transcript_id == transcript_id)).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No summary yet"
        )
    return SummaryOut(
        id=row.id,
        transcript_id=row.transcript_id,
        content=row.content,
        generated_at=row.generated_at,
    )


@summary_router.post("/summaries/{transcript_id}/generate", response_model=SummaryOut)
def generate_summary(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    graph_data = get_user_transcript(transcript_id, current_user.id, db)

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a study assistant. Summarize the lecture graph data below into a brief, readable study summary.\n\n"
                    "Rules:\n"
                    "- Write in short paragraphs and occasional bullets. no tables, no graphs\n"
                    "- Use `#` headings mostly, and occasionally use `##` subheadings when topics are clearly distinct\n"
                    "- No top-level heading at all\n"
                    "- Do not bold anything\n"
                    "- Cover all major topics, invent nothing, repeat nothing\n"
                    "- Keep it brief.\n\n"
                    f"{graph_data}"
                ),
            }
        ],
    )
    content = message.content[0].text

    row = db.exec(select(Summary).where(Summary.transcript_id == transcript_id)).first()
    if row is None:
        row = Summary(transcript_id=transcript_id, content=content)
        db.add(row)
        db.commit()
        db.refresh(row)
    else:
        now = datetime.datetime.utcnow()
        db.exec(
            update(Summary)
            .where(Summary.id == row.id)
            .values(content=content, generated_at=now)
        )
        db.commit()
        row = db.get(Summary, row.id)

    return SummaryOut(
        id=row.id,
        transcript_id=row.transcript_id,
        content=row.content,
        generated_at=row.generated_at,
    )
