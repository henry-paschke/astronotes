from fastapi import FastAPI, Depends
from sqlmodel import Session, select

from models.engine import get_session
from models.models import User, Transcript

app = FastAPI()


@app.post("/users/")
def create_user(username: str, password: str, session: Session = Depends(get_session)):
    user = User(username=username, password=password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "username": user.username}


@app.get("/users/{user_id}/transcripts")
def get_transcripts(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        return {"error": "User not found"}
    return [{"id": t.id, "data": t.data} for t in user.transcripts]
