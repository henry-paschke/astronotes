import datetime
import json

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database.engine import get_session
from database.models import Flashcard, FlashcardSet, Transcript, User
from utilities.auth import get_current_user
from utilities.graph import get_user_transcript

flashcards_router = APIRouter(prefix="/api")


class FlashcardOut(BaseModel):
    id: int
    question: str
    answer: str
    position: int


class FlashcardSetOut(BaseModel):
    set_id: int
    transcript_id: int
    generated_at: datetime.datetime
    cards: list[FlashcardOut]


def _require_transcript(transcript_id: int, user: User, db: Session) -> Transcript:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found")
    if transcript.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return transcript


def _set_to_out(fset: FlashcardSet) -> FlashcardSetOut:
    return FlashcardSetOut(
        set_id=fset.id,
        transcript_id=fset.transcript_id,
        generated_at=fset.generated_at,
        cards=[
            FlashcardOut(id=c.id, question=c.question, answer=c.answer, position=c.position)
            for c in sorted(fset.cards, key=lambda c: c.position)
        ],
    )


@flashcards_router.get("/flashcards/{transcript_id}", response_model=FlashcardSetOut)
def get_flashcards(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    fset = db.exec(select(FlashcardSet).where(FlashcardSet.transcript_id == transcript_id)).first()
    if fset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No flashcards yet")
    return _set_to_out(fset)


@flashcards_router.post("/flashcards/{transcript_id}/generate", response_model=FlashcardSetOut)
def generate_flashcards(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    graph_data = get_user_transcript(transcript_id, current_user.id, db)

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a study assistant. Given the following lecture graph data, "
                    "generate 10–15 flashcards covering the key concepts. "
                    "Respond with ONLY a JSON array, no markdown, no explanation. "
                    "Each element must have exactly two string fields: \"question\" and \"answer\". "
                    "Keep answers concise (1–3 sentences).\n\n"
                    f"{graph_data}"
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()
    # Strip accidental markdown code fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    pairs = json.loads(raw)

    # Delete existing set + cards if any
    fset = db.exec(select(FlashcardSet).where(FlashcardSet.transcript_id == transcript_id)).first()
    if fset is not None:
        for card in fset.cards:
            db.delete(card)
        db.delete(fset)
        db.commit()

    fset = FlashcardSet(transcript_id=transcript_id)
    db.add(fset)
    db.commit()
    db.refresh(fset)

    for i, pair in enumerate(pairs):
        db.add(Flashcard(
            set_id=fset.id,
            question=pair["question"],
            answer=pair["answer"],
            position=i,
        ))
    db.commit()
    db.refresh(fset)

    return _set_to_out(fset)
