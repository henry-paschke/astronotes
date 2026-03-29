import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
MOCK_GRAPH_PATH = os.getenv("MOCK_GRAPH_PATH")
REDIS_HOST = os.environ["REDIS_HOST"]
REDIS_PORT = int(os.environ["REDIS_PORT"])
REDIS_PASSWORD = os.environ["REDIS_PASSWORD"]
ASSEMBLYAI_API_KEY = os.environ["ASSEMBLYAI_API_KEY"]
