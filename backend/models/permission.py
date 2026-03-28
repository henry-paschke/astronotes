from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from backend.models.transcript import Transcript


class Permission(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    role: str
    transcript_id: int = Field(foreign_key="transcript.id")
    transcript: Optional[Transcript] = Relationship(back_populates="permissions")
