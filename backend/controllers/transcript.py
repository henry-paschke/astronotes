from fastapi import APIRouter, Depends
from sqlmodel import Session
from database.models import Transcript
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.serialize import deserialize, serialize


transcript_router = APIRouter(prefix="/api")


@transcript_router.post("/create-transcript", response_model=Transcript)
def create_transcript(database: Session = Depends(get_session)):
    print("\n\nHERE\n\n")
    transcript: Transcript = Transcript()
    transcript.data = serialize(GraphStateFAISSSpaCy())

    database.add(transcript)
    print("\n\nADDED\n\n")
    database.commit()
    print("\n\nCOMMITTED\n\n")
    database.refresh(transcript)
    print("\n\nREFRESHED\n\n")
    return transcript


@transcript_router.get("/get-transcript")
async def create_transcript(id: int, database: Session = Depends(get_session)):
    transcript = database.get(Transcript, id)
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
