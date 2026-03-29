import json
import os

from database.models import Transcript
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException, status
from utilities.serialize import deserialize
from config import MOCK_GRAPH_PATH


def get_user_transcript(
    transcript_id: int,
    user_id: int,
    database: Session,
):
    if MOCK_GRAPH_PATH:
        path = os.path.join(os.path.dirname(__file__), "..", MOCK_GRAPH_PATH)
        with open(os.path.normpath(path), "r") as f:
            return json.load(f)

    transcript = database.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    if transcript.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )
    graph = deserialize(transcript.data)
    graph.clean()
    return graph.cleaned
