"use client";

import { useRef, useState } from "react";

export default function VoiceRecorder({
  textStream,
  setTextStream,
  intervalSeconds = 5,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);

  const sendChunk = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    // const response = await fetch("http://127.0.0.1:8000/api/transcribe", {
    //   method: "POST",
    //   body: formData,
    // });
    // const data = await response.json();
    setTextStream((prev) => prev + " " + data.text);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks.length = 0;
      sendChunk(blob);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.start();
    }, intervalSeconds * 1000);
  };

  const stopRecording = () => {
    clearInterval(intervalRef.current);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop" : "Start"}
      </button>
      <p>{textStream}</p>
    </div>
  );
}
