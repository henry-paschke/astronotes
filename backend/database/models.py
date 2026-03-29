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
    name: str = Field(
        default_factory=lambda: f"Unnamed Lecture {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    ai_summary: str = Field(default="No summary created yet")
    class_name: Optional[str] = Field()
    summary: Optional["Summary"] = Relationship(back_populates="transcript")


class Summary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    transcript_id: int = Field(foreign_key="transcript.id", unique=True)
    transcript: Optional["Transcript"] = Relationship(back_populates="summary")
    content: str
    generated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
