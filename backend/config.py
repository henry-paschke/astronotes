import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
