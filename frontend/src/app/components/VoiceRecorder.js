"use client";

import { useRef, useState } from "react";
import { deinitializeRedis, initializeRedis } from "../api/dashboard";
import { updateGraph } from "../api/mindmap";

export default function VoiceRecorder({
  textStream,
  setTextStream,
  transcribeIntervalSeconds = 5,
  graphIntervalSeconds = 15,
  id,
  setTranscript,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const transcribeIntervalRef = useRef(null);
  const graphIntervalRef = useRef(null);
  const accumulatedTextRef = useRef("");
  const isSendingRef = useRef(false);

  const sendChunk = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    const response = await fetch("http://127.0.0.1:8000/api/transcribe", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!data?.text) return;

    accumulatedTextRef.current += " " + data.text;
    setTextStream((prev) => prev + " " + data.text);
  };

  const sendToGraph = async () => {
    if (isSendingRef.current) return;
    const text = accumulatedTextRef.current.trim();
    if (!text) return;

    isSendingRef.current = true;
    try {
      console.log("Sending to graph: " + text);
      const graphResponse = await updateGraph(id, text);
      const updatedNodes = await graphResponse.json();
      console.log(updatedNodes);
      setTranscript(updatedNodes);
    } finally {
      isSendingRef.current = false;
    }
  };

  const startRecording = async () => {
    await initializeRedis(id);
    console.log("graph initialized");

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

    // Process 1: audio -> text every n seconds
    transcribeIntervalRef.current = setInterval(() => {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.start();
    }, transcribeIntervalSeconds * 1000);

    // Process 2: text -> llm every n seconds
    graphIntervalRef.current = setInterval(() => {
      sendToGraph();
    }, graphIntervalSeconds * 1000);
  };

  const stopRecording = async () => {
    clearInterval(transcribeIntervalRef.current);
    clearInterval(graphIntervalRef.current);

    // capture final chunk then send everything
    await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const chunks = chunksRef.current;
        const blob = new Blob(chunks, { type: "audio/webm" });
        chunksRef.current = [];
        await sendChunk(blob);
        resolve();
      };
      mediaRecorderRef.current.stop();
    });

    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    await sendToGraph();
    accumulatedTextRef.current = "";
    setTextStream("");
    await deinitializeRedis(id);
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
