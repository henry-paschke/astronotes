from fastapi import APIRouter, Depends
from sqlmodel import Session
from database.models import Transcript
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.serialize import deserialize


transcript_router = APIRouter()


@transcript_router.post("/api/create-transcript")
async def create_transcript(database: Session = Depends(get_session)):
    database.add(GraphStateFAISSSpaCy())
    database.commit()
    database.refresh()


@transcript_router.get("/api/get-transcript")
async def create_transcript(id: int, database: Session = Depends(get_session)):
    transcript = database.get(Transcript, id)
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
