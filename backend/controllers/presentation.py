import datetime
import json

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database.engine import get_session
from database.models import Presentation, PresentationSlide, Transcript, User
from utilities.auth import get_current_user
from utilities.graph import get_user_transcript

presentation_router = APIRouter(prefix="/api")


class SlideOut(BaseModel):
    id: int
    position: int
    title: str
    content: str


class PresentationOut(BaseModel):
    id: int
    transcript_id: int
    generated_at: datetime.datetime
    slides: list[SlideOut]


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


def _pres_to_out(pres: Presentation) -> PresentationOut:
    return PresentationOut(
        id=pres.id,
        transcript_id=pres.transcript_id,
        generated_at=pres.generated_at,
        slides=[
            SlideOut(id=s.id, position=s.position, title=s.title, content=s.content)
            for s in sorted(pres.slides, key=lambda s: s.position)
        ],
    )


@presentation_router.get(
    "/presentations/{transcript_id}", response_model=PresentationOut
)
def get_presentation(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    pres = db.exec(
        select(Presentation).where(Presentation.transcript_id == transcript_id)
    ).first()
    if pres is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No presentation yet"
        )
    return _pres_to_out(pres)


@presentation_router.post(
    "/presentations/{transcript_id}/generate", response_model=PresentationOut
)
def generate_presentation(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    graph_data = get_user_transcript(transcript_id, current_user.id, db)

    claude = anthropic.Anthropic()
    message = claude.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=3000,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a presentation designer. Given the lecture data below, "
                    "create a slide deck with detailed, hierarchical bullet points.\n\n"
                    "Return ONLY a JSON array — no markdown fences, no explanation.\n"
                    "Each element must have exactly two string fields:\n"
                    '  "title": slide title (at most 8 words)\n'
                    '  "content": slide body in markdown — use nested bullets with 2-space indentation, '
                    "3-5 top-level bullets per slide, each with 1-3 indented sub-bullets; "
                    "use **bold** for key terms; no paragraphs, no sub-headings\n\n"
                    "Example bullet format:\n"
                    "- Top level point\n"
                    "  - Supporting detail\n"
                    "  - Another detail\n\n"
                    "Slide 0: title slide — content is one sentence subtitle.\n"
                    "Last slide: key takeaways.\n\n"
                    f"{graph_data}"
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    slide_data = json.loads(raw)[:12]

    existing = db.exec(
        select(Presentation).where(Presentation.transcript_id == transcript_id)
    ).first()
    if existing is not None:
        for slide in existing.slides:
            db.delete(slide)
        db.delete(existing)
        db.commit()

    pres = Presentation(transcript_id=transcript_id)
    db.add(pres)
    db.commit()
    db.refresh(pres)

    for i, s in enumerate(slide_data):
        db.add(
            PresentationSlide(
                presentation_id=pres.id,
                position=i,
                title=s["title"],
                content=s["content"],
            )
        )
    db.commit()
    db.refresh(pres)

    return _pres_to_out(pres)
