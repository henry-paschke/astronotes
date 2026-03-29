"use client";

import ForceGraph2D from "react-force-graph-2d";
import { useEffect, useRef, useCallback, useState } from "react";

// ── Tune these ────────────────────────────────
const CHARGE = { topic: -800, subtopic: -300, detail: -150 };
const LINK_DIST = {
  "topic-subtopic": 120,
  "subtopic-detail": 80,
  default: 100,
};
const LINK_STR = {
  "topic-subtopic": 0.9,
  "subtopic-detail": 1.0,
  default: 0.3,
};
const COLLIDE_R = { topic: 70, subtopic: 55, detail: 80 };
const SUB_ZOOM = 0.2; // zoom level subtopics appear
const DETAIL_ZOOM = 0.5; // zoom level details appear
const FADE_RANGE = 0.15;
const POLL_MS = 800;
// ─────────────────────────────────────────────

function darken(hex, t) {
  return `rgb(${[1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * t)).join(",")})`;
}

function wrapText(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawNode(node, ctx, gs) {
  const { type, x, y, label = node.id, color = "#999" } = node;
  let alpha = 1;
  if (type === "subtopic") alpha = Math.min(1, (gs - SUB_ZOOM) / FADE_RANGE);
  if (type === "detail") alpha = Math.min(1, (gs - DETAIL_ZOOM) / FADE_RANGE);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (type === "topic") {
    const fs = 15 / gs,
      pad = 12 / gs;
    ctx.font = `700 ${fs}px sans-serif`;
    const bw = ctx.measureText(label).width + pad * 2,
      bh = fs + pad * 1.6,
      r = bh / 2;
    pill(ctx, x, y, bw, bh, r, color, "rgba(0,0,0,0.15)", 1.2 / gs);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
  } else if (type === "subtopic") {
    const fs = 12 / gs,
      pad = 9 / gs;
    ctx.font = `600 ${fs}px sans-serif`;
    const bw = ctx.measureText(label).width + pad * 2,
      bh = fs + pad * 1.4,
      r = bh / 2;
    pill(ctx, x, y, bw, bh, r, "#fff", color, 1.5 / gs);
    ctx.globalAlpha = alpha * 0.15;
    pill(ctx, x, y, bw, bh, r, color, "transparent", 0);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = darken(color, 0.5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
  } else {
    const fs = 10 / gs,
      pad = 7 / gs,
      maxW = 160 / gs;
    ctx.font = `400 ${fs}px sans-serif`;
    const lines = wrapText(ctx, label, maxW);
    const lh = fs * 1.4,
      bw = maxW + pad * 2,
      bh = lines.length * lh + pad * 1.6,
      r = 4 / gs;
    const bg = node.color || "#F5F5F5",
      border = node.border_color || "#BDBDBD";
    rect(ctx, x, y, bw, bh, r, bg, border, 1 / gs);
    if (node.detail_type) {
      ctx.font = `600 ${8 / gs}px sans-serif`;
      ctx.fillStyle = border;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        node.detail_type[0].toUpperCase() + node.detail_type.slice(1),
        x - bw / 2 + pad,
        y - bh / 2 + pad * 0.8,
      );
    }
    ctx.fillStyle = "#333";
    ctx.font = `400 ${fs}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const startY =
      y -
      (lines.length * lh) / 2 +
      lh * 0.1 +
      (node.detail_type ? fs * 0.6 : 0);
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lh));
  }
  ctx.restore();
}

function pill(ctx, cx, cy, bw, bh, r, fill, stroke, lw) {
  ctx.beginPath();
  ctx.moveTo(cx - bw / 2 + r, cy - bh / 2);
  ctx.lineTo(cx + bw / 2 - r, cy - bh / 2);
  ctx.arcTo(cx + bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2, r);
  ctx.lineTo(cx + bw / 2, cy + bh / 2 - r);
  ctx.arcTo(cx + bw / 2, cy + bh / 2, cx - bw / 2, cy + bh / 2, r);
  ctx.lineTo(cx - bw / 2 + r, cy + bh / 2);
  ctx.arcTo(cx - bw / 2, cy + bh / 2, cx - bw / 2, cy - bh / 2, r);
  ctx.lineTo(cx - bw / 2, cy - bh / 2 + r);
  ctx.arcTo(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy - bh / 2, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke && lw > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function rect(ctx, cx, cy, bw, bh, r, fill, stroke, lw) {
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke && lw > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function SearchBar({ getNodes, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = useCallback(
    (q) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const matches = getNodes()
        .filter((n) => (n.label || n.id).toLowerCase().includes(lower))
        .sort((a, b) => {
          const al = (a.label || a.id).toLowerCase();
          const bl = (b.label || b.id).toLowerCase();
          return (
            (al.startsWith(lower) ? 0 : 1) - (bl.startsWith(lower) ? 0 : 1) ||
            al.length - bl.length
          );
        })
        .slice(0, 5);
      setResults(matches);
    },
    [getNodes],
  );

  const select = useCallback(
    (node) => {
      setQuery(node.label || node.id);
      setResults([]);
      onSelect(node);
    },
    [onSelect],
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        width: 280,
      }}
    >
      <div
        style={{
          display: "flex",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: results.length ? "16px 16px 0 0" : 24,
          background: "#fff",
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          borderBottom: results.length ? "1px solid #f0f0f0" : undefined,
        }}
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) select(results[0]);
          }}
          placeholder="Search nodes…"
          style={{
            border: "none",
            outline: "none",
            padding: "8px 16px",
            fontSize: 13,
            flex: 1,
            background: "transparent",
            color: "#333",
          }}
        />
        <button
          onClick={() => results[0] && select(results[0])}
          style={{
            border: "none",
            background: "#4a90e2",
            color: "#fff",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Go
        </button>
      </div>
      {results.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {results.map((n, i) => (
            <div
              key={n.id}
              onClick={() => select(n)}
              style={{
                padding: "7px 16px",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
                background: "#fff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f8ff")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 4,
                  fontWeight: 600,
                  background:
                    n.type === "topic"
                      ? "#e8f0fe"
                      : n.type === "subtopic"
                        ? "#f0faf0"
                        : "#fef9e7",
                  color:
                    n.type === "topic"
                      ? "#4a90e2"
                      : n.type === "subtopic"
                        ? "#4caf50"
                        : "#f5a623",
                }}
              >
                {n.type}
              </span>
              <span
                style={{
                  color: "#333",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.label || n.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindMap({ graph }) {
  const fgRef = useRef(null);
  const seenNodes = useRef(new Set());
  const seenEdges = useRef(new Set());
  const nodeMap = useRef(new Map());
  const zoomRef = useRef(1);
  const dataRef = useRef({ nodes: [], links: [] });

  const getNodes = useCallback(() => dataRef.current.nodes, []);

  const handleSelect = useCallback((node) => {
    if (!fgRef.current) return;
    fgRef.current.centerAt(node.x, node.y, 600);
    fgRef.current.zoom(2.5, 600);
  }, []);

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [status, setStatus] = useState({
    live: false,
    label: "Waiting…",
    count: 0,
  });
  const [dims, setDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () =>
      setDims({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Merge incoming nodes/links without duplicates
  const merge = (incoming) => {
    const cur = dataRef.current;
    let changed = false;
    const nodes = [...cur.nodes],
      links = [...cur.links];

    for (const n of incoming.nodes) {
      if (!seenNodes.current.has(n.id)) {
        seenNodes.current.add(n.id);
        const node = { ...n };
        nodeMap.current.set(n.id, node);
        nodes.push(node);
        changed = true;
      }
    }
    for (const l of incoming.links) {
      const src = nodeMap.current.get(l.source?.id ?? l.source);
      const tgt = nodeMap.current.get(l.target?.id ?? l.target);
      if (!src || !tgt) continue;
      const k = `${src.id}→${tgt.id}`;
      if (!seenEdges.current.has(k)) {
        seenEdges.current.add(k);
        links.push({ ...l, source: src, target: tgt });
        changed = true;
      }
    }
    if (changed) {
      dataRef.current = { nodes, links };
      setGraphData({ nodes, links });
    }
    return changed;
  };

  // Set up d3 forces
  useEffect(() => {
    const t = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;

      fg.d3Force("charge").strength((n) => CHARGE[n.type] ?? -150);
      fg.d3Force("link")
        .distance(
          (l) =>
            LINK_DIST[`${l.source?.type}-${l.target?.type}`] ??
            LINK_DIST.default,
        )
        .strength(
          (l) =>
            LINK_STR[`${l.source?.type}-${l.target?.type}`] ?? LINK_STR.default,
        );

      // Collision
      fg.d3Force("collide", (alpha) => {
        const nodes = dataRef.current.nodes;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i],
              b = nodes[j];
            const minD = (COLLIDE_R[a.type] ?? 70) + (COLLIDE_R[b.type] ?? 70);
            const dx = (b.x ?? 0) - (a.x ?? 0),
              dy = (b.y ?? 0) - (a.y ?? 0);
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < minD) {
              const f = ((minD - d) / d) * alpha * 0.5;
              if (a.fx == null) {
                a.vx = (a.vx ?? 0) - dx * f;
                a.vy = (a.vy ?? 0) - dy * f;
              }
              if (b.fx == null) {
                b.vx = (b.vx ?? 0) + dx * f;
                b.vy = (b.vy ?? 0) + dy * f;
              }
            }
          }
        }
      });

      fg.d3ReheatSimulation();
    }, 50);
    return () => clearTimeout(t);
  }, []);

  // Run when graph changes
  useEffect(() => {
    if (!graph?.nodes?.length) return;
    merge(graph);
    fgRef.current?.d3ReheatSimulation();
  }, [graph.nodes.length, graph.links.length]);

  const linkVisible = useCallback((link) => {
    const k = zoomRef.current;
    const s = link.source?.type,
      t = link.target?.type;
    // Only hide detail links — always show topic and topic→subtopic links
    if (t === "detail" && k < DETAIL_ZOOM) return false;
    if (s === "detail" && k < DETAIL_ZOOM) return false;
    return true;
  }, []);

  const hitArea = useCallback((node, color, ctx, gs) => {
    if (node.type === "subtopic" && gs < SUB_ZOOM) return;
    if (node.type === "detail" && gs < DETAIL_ZOOM) return;
    const w = node.type === "detail" ? 180 / gs : 100 / gs;
    const h = node.type === "detail" ? 80 / gs : 28 / gs;
    ctx.fillStyle = color;
    ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#f8f8f6",
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#f8f8f6"
        linkColor={() => "rgba(0,0,0,0.10)"}
        linkWidth={1}
        linkVisibility={linkVisible}
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={hitArea}
        onZoom={({ k }) => {
          zoomRef.current = k;
        }}
        onNodeDragEnd={(n) => {
          n.fx = n.x;
          n.fy = n.y;
        }}
        width={dims.width}
        height={dims.height}
        cooldownTicks={300}
        cooldownTime={8000}
      />

      <SearchBar getNodes={getNodes} onSelect={handleSelect} />
      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          fontSize: 12,
          color: "#888",
          background: "rgba(255,255,255,0.9)",
          padding: "4px 12px",
          borderRadius: 20,
          border: "1px solid #e0e0e0",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ color: status.live ? "#4caf50" : "#bbb", fontSize: 10 }}>
          {status.live ? "●" : "◎"}
        </span>
        {status.live ? `Live — ${status.count} nodes` : status.label}
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          fontSize: 11,
          color: "#666",
          background: "rgba(255,255,255,0.9)",
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid #e0e0e0",
          lineHeight: 2,
          pointerEvents: "none",
        }}
      >
        {[
          ["Definition", "#E8F4FD", "#90CAF9"],
          ["Example", "#FFF3E0", "#FFCC80"],
          ["Fact", "#F1F8E9", "#A5D6A7"],
        ].map(([label, bg, border]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 3,
                background: bg,
                border: `1.5px solid ${border}`,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
