import datetime
from typing import List, Optional

from sqlmodel import Column, Field, LargeBinary, Relationship, SQLModel

from backend.models.permission import Permission
from backend.models.user import User


class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    data: bytes = Field(sa_column=Column(LargeBinary))
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="transcripts")
    permissions: List[Permission] = Relationship(back_populates="transcript")
