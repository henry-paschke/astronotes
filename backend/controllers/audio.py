import asyncio
import logging

import assemblyai as aai
from config import ASSEMBLYAI_API_KEY
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

aai.settings.api_key = ASSEMBLYAI_API_KEY

audio_router = APIRouter(prefix="/api")


@audio_router.websocket("/transcribe-ws")
async def transcribe_ws(websocket: WebSocket):
    """
    WebSocket endpoint for real-time transcription via AssemblyAI.

    Protocol:
      Client → Server : raw PCM / WebM audio chunks (binary frames)
      Server → Client : JSON text frames
                        { "type": "partial", "text": "..." }   (interim)
                        { "type": "final",   "text": "..." }   (finalised)
                        { "type": "error",   "message": "..." }
                        { "type": "closed" }
    """
    await websocket.accept()

    loop = asyncio.get_event_loop()
    # Queue that the AAI callbacks post results into so we can send them
    # back to the WebSocket from the async context.
    result_queue: asyncio.Queue = asyncio.Queue()

    # ── AssemblyAI real-time callbacks ────────────────────────────────────────
    def on_open(session_opened: aai.RealtimeSessionOpened):
        logger.info("AAI session opened: %s", session_opened.session_id)

    def on_data(transcript: aai.RealtimeTranscript):
        if not transcript.text:
            return
        if isinstance(transcript, aai.RealtimeFinalTranscript):
            msg = {"type": "final", "text": transcript.text}
        else:
            msg = {"type": "partial", "text": transcript.text}
        # Post into the async queue from the sync callback thread
        loop.call_soon_threadsafe(result_queue.put_nowait, msg)

    def on_error(error: aai.RealtimeError):
        logger.error("AAI error: %s", error)
        loop.call_soon_threadsafe(
            result_queue.put_nowait, {"type": "error", "message": str(error)}
        )

    def on_close():
        logger.info("AAI session closed")
        loop.call_soon_threadsafe(result_queue.put_nowait, {"type": "closed"})

    # ── Start the AAI real-time transcriber in a thread ───────────────────────
    transcriber = aai.RealtimeTranscriber(
        sample_rate=16_000,  # must match what the browser sends
        on_data=on_data,
        on_error=on_error,
        on_open=on_open,
        on_close=on_close,
        encoding=aai.AudioEncoding.pcm_s16le,
        # Disable punctuation for low-latency partial results; enable if preferred:
        # word_boost=[],
        # format_text=True,
    )

    connect_task = asyncio.get_event_loop().run_in_executor(None, transcriber.connect)
    try:
        await connect_task
    except Exception as exc:
        await websocket.send_json(
            {"type": "error", "message": f"AAI connect failed: {exc}"}
        )
        await websocket.close()
        return

    # ── Forward results to client while receiving audio ───────────────────────
    async def forward_results():
        """Drain result_queue and send JSON to the WebSocket."""
        while True:
            msg = await result_queue.get()
            try:
                await websocket.send_json(msg)
            except Exception:
                break
            if msg["type"] in ("closed", "error"):
                break

    forward_task = asyncio.create_task(forward_results())

    try:
        while True:
            # Receive raw audio bytes from the browser
            chunk = await websocket.receive_bytes()
            # Stream to AAI in a thread (SDK call is synchronous)
            await loop.run_in_executor(None, transcriber.stream, chunk)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected by client")
    except Exception as exc:
        logger.error("WebSocket error: %s", exc)
        try:
            await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception:
            pass
    finally:
        # Graceful shutdown
        await loop.run_in_executor(None, transcriber.close)
        forward_task.cancel()
        try:
            await websocket.close()
        except Exception:
            pass
