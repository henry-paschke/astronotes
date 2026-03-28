from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.mindmap import mindmap_router
from controllers.user import user_router
from controllers.transcript import transcript_router

app = FastAPI(title="AstroNotes API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mindmap_router)
app.include_router(user_router)
app.include_router(transcript_router)
