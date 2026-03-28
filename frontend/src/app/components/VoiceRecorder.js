import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";

export default function VoiceRecorder({ transcript, setTranscript }) {
  const [transcript, setTranscript] = useState("");

  const handleRecordingComplete = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    const response = await fetch("http://127.0.0.1:8000/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setTranscript(data.text);
  };

  return (
    <div>
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      <p>{transcript}</p>
    </div>
  );
}
