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
// ─────────────────────────────────────────────

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

// Dark-theme detail node colors
const DETAIL_THEME = {
  definition: { bg: "#071d35", border: "#4a7fcb", label: "#7ab8f5" },
  example:    { bg: "#1c1200", border: "#c4a35a", label: "#e8c878" },
  fact:       { bg: "#091a0e", border: "#5aab7a", label: "#6ed49a" },
};

function drawNode(node, ctx, gs) {
  const { type, x, y, label = node.id, color = "#c4a35a" } = node;
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
    pill(ctx, x, y, bw, bh, r, color, "rgba(255,255,255,0.12)", 1.2 / gs);
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
    // Dark fill with vibrant border
    pill(ctx, x, y, bw, bh, r, "#07142a", color, 1.5 / gs);
    // Subtle color tint overlay
    ctx.globalAlpha = alpha * 0.08;
    pill(ctx, x, y, bw, bh, r, color, "transparent", 0);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
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
    const dt = DETAIL_THEME[node.detail_type] || { bg: "#07152a", border: "#c4a35a", label: "#e8c878" };
    rect(ctx, x, y, bw, bh, r, dt.bg, dt.border, 1 / gs);
    if (node.detail_type) {
      ctx.font = `600 ${8 / gs}px sans-serif`;
      ctx.fillStyle = dt.border;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        node.detail_type[0].toUpperCase() + node.detail_type.slice(1),
        x - bw / 2 + pad,
        y - bh / 2 + pad * 0.8,
      );
    }
    ctx.fillStyle = dt.label;
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
        width: 300,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          borderRadius: results.length ? "4px 4px 0 0" : 4,
          background: "rgba(7,21,41,0.92)",
          border: "1px solid rgba(196,163,90,0.35)",
          borderBottom: results.length ? "1px solid rgba(196,163,90,0.15)" : undefined,
          overflow: "hidden",
          backdropFilter: "blur(6px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
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
            padding: "9px 14px",
            fontSize: 13,
            flex: 1,
            background: "transparent",
            color: "#f0e8d5",
          }}
        />
        <button
          onClick={() => results[0] && select(results[0])}
          style={{
            border: "none",
            borderLeft: "1px solid rgba(196,163,90,0.2)",
            background: "rgba(196,163,90,0.12)",
            color: "#c4a35a",
            padding: "9px 16px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,163,90,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(196,163,90,0.12)")}
        >
          GO
        </button>
      </div>
      {results.length > 0 && (
        <div
          style={{
            background: "rgba(7,21,41,0.96)",
            border: "1px solid rgba(196,163,90,0.35)",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            overflow: "hidden",
            backdropFilter: "blur(6px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {results.map((n, i) => (
            <div
              key={n.id}
              onClick={() => select(n)}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderTop: i > 0 ? "1px solid rgba(196,163,90,0.1)" : "none",
                background: "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(196,163,90,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 3,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  background:
                    n.type === "topic"
                      ? "rgba(74,127,203,0.2)"
                      : n.type === "subtopic"
                        ? "rgba(196,163,90,0.15)"
                        : "rgba(90,171,122,0.15)",
                  color:
                    n.type === "topic"
                      ? "#4a7fcb"
                      : n.type === "subtopic"
                        ? "#c4a35a"
                        : "#5aab7a",
                  border: `1px solid ${
                    n.type === "topic"
                      ? "rgba(74,127,203,0.3)"
                      : n.type === "subtopic"
                        ? "rgba(196,163,90,0.3)"
                        : "rgba(90,171,122,0.3)"
                  }`,
                }}
              >
                {n.type}
              </span>
              <span
                style={{
                  color: "#b8a98a",
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
        background: "#010810",
        backgroundImage:
          "linear-gradient(rgba(196,163,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,163,90,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        linkColor={() => "rgba(196,163,90,0.18)"}
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

      {/* Node count badge */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          fontFamily: "sans-serif",
          fontSize: 11,
          color: "#b8a98a",
          background: "rgba(7,21,41,0.85)",
          padding: "5px 14px",
          borderRadius: 20,
          border: "1px solid rgba(196,163,90,0.25)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          backdropFilter: "blur(4px)",
        }}
      >
        <span style={{ color: "#c4a35a", fontSize: 9 }}>◆</span>
        {graphData.nodes.length} nodes
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          fontFamily: "sans-serif",
          fontSize: 11,
          color: "#b8a98a",
          background: "rgba(7,21,41,0.85)",
          padding: "10px 14px",
          borderRadius: 6,
          border: "1px solid rgba(196,163,90,0.25)",
          lineHeight: 1,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          backdropFilter: "blur(4px)",
        }}
      >
        {[
          ["Definition", "#071d35", "#4a7fcb"],
          ["Example",    "#1c1200", "#c4a35a"],
          ["Fact",       "#091a0e", "#5aab7a"],
        ].map(([label, bg, border]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 7 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: bg,
                border: `1.5px solid ${border}`,
                flexShrink: 0,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
