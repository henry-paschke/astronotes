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
  const accumulatedTextRef = useRef("");
  const transcribeIntervalRef = useRef(null);
  const graphIntervalRef = useRef(null);

  const transcribeBlob = async (blob) => {
    if (blob.size === 0) return;
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    const res = await fetch("http://127.0.0.1:8000/api/transcribe", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data?.text) return;
    accumulatedTextRef.current += " " + data.text;
    setTextStream((prev) => prev + " " + data.text);
  };

  const flushRecorder = () =>
    new Promise((resolve) => {
      const chunks = [];
      const mr = mediaRecorderRef.current;
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
      mr.stop();
    });

  const sendToGraph = async () => {
    const text = accumulatedTextRef.current.trim();
    if (!text) return;
    console.log("sending to graph: " + text);
    const res = await updateGraph(id, text);
    const nodes = await res.json();
    setTranscript(nodes);
  };

  const startRecording = async () => {
    await initializeRedis(id);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const startFresh = () => {
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        await transcribeBlob(new Blob(chunks, { type: "audio/webm" }));
      };
      mr.start();
      mediaRecorderRef.current = mr;
    };

    startFresh();
    setIsRecording(true);

    transcribeIntervalRef.current = setInterval(() => {
      mediaRecorderRef.current.stop(); // triggers onstop -> transcribeBlob
      startFresh(); // immediately start new recorder
    }, transcribeIntervalSeconds * 1000);

    graphIntervalRef.current = setInterval(
      sendToGraph,
      graphIntervalSeconds * 1000,
    );
  };

  const stopRecording = async () => {
    clearInterval(transcribeIntervalRef.current);
    clearInterval(graphIntervalRef.current);
    const blob = await flushRecorder();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    await transcribeBlob(blob);
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
