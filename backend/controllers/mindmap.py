from fastapi import APIRouter, Body, Depends
import redis.asyncio as redis
from database.models import Transcript
from utilities.redis import get_redis
from logic.mindmap import GraphStateFAISSSpaCy
from utilities.serialize import deserialize, serialize
from logic.mindmap import extract_hierarchy


mindmap_router = APIRouter(prefix="/api")


@mindmap_router.post("/update-graph")
async def update_graph(
    id: int = Body(..., embed=True),
    data: str = Body(..., embed=True),
    redis_client: redis.Redis = Depends(get_redis),
):
    pickledGraph = await redis_client.get(id)

    if pickledGraph is None:
        return {"nodes": [], "links": []}

    graph: GraphStateFAISSSpaCy = deserialize(pickledGraph)
    cleaned_data = extract_hierarchy(data, graph)
    graph.extract_data(cleaned_data)
    print(data)
    print("Notes: ", len(graph.cleaned["nodes"]))
    await redis_client.set(id, serialize(graph))
    graph.clean()
    return graph.cleaned
