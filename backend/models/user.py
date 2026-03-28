from typing import List

from sqlmodel import SQLModel, Field, Relationship

from backend.models.transcript import Transcript


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str
    password: str
    transcripts: List[Transcript] = Relationship(back_populates="user")
