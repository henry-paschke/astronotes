from fastapi import FastAPI, Depends
from sqlmodel import Session, select

from database.engine import get_session
from database.models import User, Transcript

from controllers.mindmap import mindmap_router

app = FastAPI()
app.include_router(mindmap_router)
