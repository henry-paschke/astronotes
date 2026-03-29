from fastapi import APIRouter, Body, Depends
from sqlmodel import Session
from database.models import Transcript
from database.engine import get_session
from utilities.redis import get_redis
import redis.asyncio as redis


audio_router = APIRouter(prefix="/api")


@audio_router.post("/transcribe")
async def transcribe(
    data: bytes = Body(..., embed=True),
):
    print("\n\n", data, "\n\n")
    return {"text": "hello"}
