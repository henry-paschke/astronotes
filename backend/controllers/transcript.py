from fastapi import APIRouter, Depends
from sqlmodel import Session
from database.models import Permission, Transcript, User
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
    print("\n\n0\n\n")
    transcript = Transcript(
        data=serialize(GraphStateFAISSSpaCy()),
        user_id=current_user.id,
    )
    print("\n\n1\n\n")
    database.add(transcript)
    print("\n\n2\n\n")
    database.commit()
    print("\n\n3\n\n")
    database.refresh(transcript)

    permission = Permission(role="owner", transcript_id=transcript.id)
    database.add(permission)
    database.commit()

    return transcript


@transcript_router.get("/get-transcript")
def get_transcript(id: int, database: Session = Depends(get_session)):
    transcript = database.get(Transcript, id)
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
