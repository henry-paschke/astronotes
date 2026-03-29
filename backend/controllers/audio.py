# import os
# import tempfile
# import whisper

from fastapi import APIRouter, File, UploadFile

# model = whisper.load_model("base")


audio_router = APIRouter(prefix="/api")


# @audio_router.post("/transcribe")
# async def transcribe(file: UploadFile = File(...)):
#     data = await file.read()

#     # Write to temp file — whisper needs a file path
#     with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
#         tmp.write(data)
#         tmp_path = tmp.name

#     result = model.transcribe(tmp_path)
#     os.remove(tmp_path)

#     return {"text": result["text"]}
