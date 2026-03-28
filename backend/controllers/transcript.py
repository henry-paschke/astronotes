from fastapi import APIRouter, Depends
from sqlmodel import Session
from database.models import Transcript, User
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.auth import get_current_user
from utilities.serialize import deserialize, serialize


transcript_router = APIRouter(prefix="/api")


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

    return transcript.id


@transcript_router.get("/get-transcript")
def get_transcript(id: int, database: Session = Depends(get_session)):
    transcript = database.get(Transcript, id)
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
