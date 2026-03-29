import redis.asyncio as redis
from config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD


async def get_redis():
    client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=False,
        username="default",
        password=REDIS_PASSWORD,
    )
    try:
        yield client
    finally:
        await client.aclose()
