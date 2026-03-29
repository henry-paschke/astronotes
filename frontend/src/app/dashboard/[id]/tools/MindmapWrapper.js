"use client";

import dynamic from "next/dynamic";

const MindMap = dynamic(() => import("./MindMap"), { ssr: false });

export default function MindMapWrapper({ graph }) {
  return <MindMap graph={graph} />;
}
