import datetime
import json
import re
from typing import Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from database.models import (
    ExamQuestion,
    ExamSet,
    Flashcard,
    FlashcardSet,
    Presentation,
    PresentationSlide,
    Summary,
    Transcript,
    User,
)
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.auth import get_current_user
from utilities.serialize import serialize
from utilities.graph import get_user_transcript


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    if transcript.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )
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


@transcript_router.delete(
    "/transcripts/{transcript_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_transcript(
    transcript_id: int,
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transcript = database.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    if transcript.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )
    summary = database.exec(select(Summary).where(Summary.transcript_id == transcript_id)).first()
    if summary:
        database.delete(summary)

    flashcard_set = database.exec(select(FlashcardSet).where(FlashcardSet.transcript_id == transcript_id)).first()
    if flashcard_set:
        for card in database.exec(select(Flashcard).where(Flashcard.set_id == flashcard_set.id)).all():
            database.delete(card)
        database.delete(flashcard_set)

    presentation = database.exec(select(Presentation).where(Presentation.transcript_id == transcript_id)).first()
    if presentation:
        for slide in database.exec(select(PresentationSlide).where(PresentationSlide.presentation_id == presentation.id)).all():
            database.delete(slide)
        database.delete(presentation)

    exam_set = database.exec(select(ExamSet).where(ExamSet.transcript_id == transcript_id)).first()
    if exam_set:
        for question in database.exec(select(ExamQuestion).where(ExamQuestion.exam_id == exam_set.id)).all():
            database.delete(question)
        database.delete(exam_set)

    database.delete(transcript)
    database.commit()


class GeneratedDetails(BaseModel):
    name: str
    ai_summary: str


@transcript_router.post(
    "/transcripts/{transcript_id}/generate-details", response_model=GeneratedDetails
)
def generate_transcript_details(
    transcript_id: int,
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transcript = database.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    if transcript.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    graph_data = get_user_transcript(transcript_id, current_user.id, database)

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[
            {
                "role": "user",
                "content": (
                    "Based on the lecture data below, generate:\n"
                    "1. A concise, descriptive title (max 8 words, no quotes)\n"
                    "2. A 1 sentence short plain-text summary, max 50 words.\n\n"
                    'Return ONLY valid JSON in this exact shape: {"name": "...", "ai_summary": "..."}\n\n'
                    f"Lecture data:\n{json.dumps(graph_data)}"
                ),
            }
        ],
    )

    text = message.content[0].text.strip()
    text = re.sub(r"^```[a-z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text.strip())
    data = json.loads(text)
    return GeneratedDetails(name=data["name"], ai_summary=data["ai_summary"])


@transcript_router.get("/get-transcript")
def get_transcript(
    id: int,
    database: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return get_user_transcript(
        transcript_id=id, user_id=current_user.id, database=database
    )
