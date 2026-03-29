import datetime
import json

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database.engine import get_session
from database.models import ExamQuestion, ExamSet, Transcript, User
from utilities.auth import get_current_user
from utilities.graph import get_user_transcript

exam_router = APIRouter(prefix="/api")


class QuestionOut(BaseModel):
    id: int
    position: int
    type: str
    question: str
    options: list[str] | None   # None for true_false
    correct_answer: str         # "0"/"1"/"2"/"3", "True"/"False", or '["0","1"]'
    explanation: str


class ExamSetOut(BaseModel):
    id: int
    transcript_id: int
    generated_at: datetime.datetime
    questions: list[QuestionOut]


def _require_transcript(transcript_id: int, user: User, db: Session) -> Transcript:
    t = db.get(Transcript, transcript_id)
    if t is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found")
    if t.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return t


def _exam_to_out(exam: ExamSet) -> ExamSetOut:
    return ExamSetOut(
        id=exam.id,
        transcript_id=exam.transcript_id,
        generated_at=exam.generated_at,
        questions=[
            QuestionOut(
                id=q.id,
                position=q.position,
                type=q.type,
                question=q.question,
                options=json.loads(q.options) if q.options else None,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
            )
            for q in sorted(exam.questions, key=lambda q: q.position)
        ],
    )


@exam_router.get("/exams/{transcript_id}", response_model=ExamSetOut)
def get_exam(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    exam = db.exec(select(ExamSet).where(ExamSet.transcript_id == transcript_id)).first()
    if exam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No exam yet")
    return _exam_to_out(exam)


@exam_router.post("/exams/{transcript_id}/generate", response_model=ExamSetOut)
def generate_exam(
    transcript_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_transcript(transcript_id, current_user, db)
    graph_data = get_user_transcript(transcript_id, current_user.id, db)

    claude = anthropic.Anthropic()
    message = claude.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are an exam writer. Given the lecture data below, generate 15–20 exam questions.\n\n"
                    "Return ONLY a JSON array — no markdown fences, no explanation.\n"
                    "Use a mix of these three types:\n"
                    "  multiple_choice — 4 options, exactly one correct (aim for ~10 questions)\n"
                    "  true_false      — True or False (aim for ~5 questions)\n"
                    "  multi_select    — 4–5 options, two or more correct (aim for ~3 questions)\n\n"
                    "Each element must have exactly these fields:\n"
                    '  "type": "multiple_choice" | "true_false" | "multi_select"\n'
                    '  "question": string\n'
                    '  "options": array of option strings (omit entirely for true_false)\n'
                    '  "correct_answer": "0"/"1"/"2"/"3" for multiple_choice, '
                    '"True"/"False" for true_false, \'["0","2"]\' (JSON string) for multi_select\n'
                    '  "explanation": one sentence explaining the correct answer\n\n'
                    "Option indices are 0-based. Do NOT include letters like A/B/C in the option text.\n\n"
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
    questions = json.loads(raw)[:20]

    # Delete existing exam if any
    existing = db.exec(select(ExamSet).where(ExamSet.transcript_id == transcript_id)).first()
    if existing is not None:
        for q in existing.questions:
            db.delete(q)
        db.delete(existing)
        db.commit()

    exam = ExamSet(transcript_id=transcript_id)
    db.add(exam)
    db.commit()
    db.refresh(exam)

    for i, q in enumerate(questions):
        options = q.get("options")
        db.add(ExamQuestion(
            exam_id=exam.id,
            position=i,
            type=q["type"],
            question=q["question"],
            options=json.dumps(options) if options else None,
            correct_answer=q["correct_answer"] if isinstance(q["correct_answer"], str)
                           else json.dumps(q["correct_answer"]),
            explanation=q["explanation"],
        ))
    db.commit()
    db.refresh(exam)

    return _exam_to_out(exam)
