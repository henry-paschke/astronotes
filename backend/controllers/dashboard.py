from fastapi import APIRouter, Body, Depends
from sqlmodel import Session
from database.models import Transcript
from database.engine import get_session
from utilities.redis import get_redis
import redis.asyncio as redis


dashboard_router = APIRouter(prefix="/api")


@dashboard_router.post("/initialize-redis")
async def initialize_redis(
    id: int = Body(..., embed=True),
    database: Session = Depends(get_session),
    redis_client: redis.Redis = Depends(get_redis),
):
    transcript = database.get(Transcript, id)
    await redis_client.set(id, transcript.data)
