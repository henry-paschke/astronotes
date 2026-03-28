import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from database.models import Transcript, User
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.auth import get_current_user
from utilities.serialize import deserialize, serialize


transcript_router = APIRouter(prefix="/api")


class TranscriptMeta(BaseModel):
    id: int
    name: str
    ai_summary: str
    class_name: Optional[str] = None
    created_at: datetime.datetime


class TranscriptUpdate(BaseModel):
    name: str
    ai_summary: str
    class_name: Optional[str] = None


@transcript_router.post("/create-transcript")
def create_transcript(
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transcript = Transcript(
        data=serialize(GraphStateFAISSSpaCy()),
        user_id=current_user.id,
    )
    database.add(transcript)
    database.commit()
    database.refresh(transcript)

    return {"id": transcript.id}


@transcript_router.get("/transcripts/classes", response_model=list[str])
def list_classes(
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    rows = database.exec(
        select(Transcript.class_name)
        .where(Transcript.user_id == current_user.id)
        .where(Transcript.class_name.is_not(None))
        .distinct()
    ).all()
    return sorted(r for r in rows if r)


@transcript_router.get("/transcripts", response_model=list[TranscriptMeta])
def list_transcripts(
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    rows = database.exec(
        select(Transcript)
        .where(Transcript.user_id == current_user.id)
        .order_by(Transcript.created_at.desc())
    ).all()
    return [
        TranscriptMeta(
            id=t.id,
            name=t.name,
            ai_summary=t.ai_summary,
            class_name=t.class_name,
            created_at=t.created_at,
        )
        for t in rows
    ]


@transcript_router.patch("/transcripts/{transcript_id}", response_model=TranscriptMeta)
def update_transcript(
    transcript_id: int,
    body: TranscriptUpdate,
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transcript = database.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found")
    if transcript.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    transcript.name = body.name
    transcript.ai_summary = body.ai_summary
    transcript.class_name = body.class_name or None
    database.add(transcript)
    database.commit()
    database.refresh(transcript)
    return TranscriptMeta(
        id=transcript.id,
        name=transcript.name,
        ai_summary=transcript.ai_summary,
        class_name=transcript.class_name,
        created_at=transcript.created_at,
    )


@transcript_router.get("/get-transcript")
def get_transcript(
    id: int,
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transcript = database.get(Transcript, id)
    if transcript is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found")
    if transcript.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
