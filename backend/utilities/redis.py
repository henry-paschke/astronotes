import redis.asyncio as redis

REDIS_HOST = "redis-13790.crce197.us-east-2-1.ec2.cloud.redislabs.com"
REDIS_PORT = 13790
REDIS_PASSWORD = "5DNhlNp0iH9nCHbXsNpc4buT3mMCsuyM"


async def get_redis():
    client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
        username="default",
        password=REDIS_PASSWORD,
    )
    try:
        yield client
    finally:
        await client.aclose()
