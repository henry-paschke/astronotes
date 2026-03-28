import datetime
from typing import List, Optional

from sqlmodel import Column, Field, LargeBinary, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    password: str
    transcripts: List["Transcript"] = Relationship(back_populates="user")


class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    data: bytes = Field(sa_column=Column(LargeBinary(length=2**31)))
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="transcripts")
    permissions: List["Permission"] = Relationship(back_populates="transcript")


class Permission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str
    transcript_id: int = Field(foreign_key="transcript.id")
    transcript: Optional["Transcript"] = Relationship(back_populates="permissions")
