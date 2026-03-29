import assemblyai as aai
from fastapi import APIRouter, File, UploadFile
from config import ASSEMBLYAI_API_KEY

aai.settings.api_key = ASSEMBLYAI_API_KEY

audio_router = APIRouter(prefix="/api")


@audio_router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    data = await file.read()

    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(
        data,
        config=aai.TranscriptionConfig(
            speech_models=["universal-3-pro"],
        ),
    )

    return {"text": transcript.text}
