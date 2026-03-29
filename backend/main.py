from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGIN
from controllers.mindmap import mindmap_router
from controllers.user import user_router
from controllers.transcript import transcript_router
from controllers.dashboard import dashboard_router
from controllers.audio import audio_router
from controllers.summary import summary_router
from controllers.flashcards import flashcards_router
from controllers.presentation import presentation_router
from controllers.exam import exam_router
from controllers.chat import chat_router

app = FastAPI(title="AstroNotes API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mindmap_router)
app.include_router(user_router)
app.include_router(transcript_router)
app.include_router(dashboard_router)
app.include_router(audio_router)
app.include_router(summary_router)
app.include_router(flashcards_router)
app.include_router(presentation_router)
app.include_router(exam_router)
app.include_router(chat_router)
