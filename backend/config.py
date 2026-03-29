import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
MOCK_GRAPH_PATH = os.getenv("MOCK_GRAPH_PATH")
REDIS_HOST = os.environ["REDIS_HOST"]
REDIS_PORT = int(os.environ["REDIS_PORT"])
REDIS_PASSWORD = os.environ["REDIS_PASSWORD"]
