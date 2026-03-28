from fastapi import APIRouter, Depends
from sqlmodel import Session
from database.models import Transcript, User
from database.engine import get_session
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.auth import get_current_user
from utilities.serialize import deserialize, serialize
from utilities.redis import get_redis
import redis.asyncio as redis


dashboard_router = APIRouter(prefix="/api")


@dashboard_router.post("/initialize")
def initialize(
    id: int,
    database: Session = Depends(get_session),
    redis_client: redis.Redis = Depends(get_redis),
):
    transcript = database.get(Transcript, id)
    graph: GraphStateFAISSSpaCy = deserialize(transcript.data)
    redis_client.set(id, graph)
