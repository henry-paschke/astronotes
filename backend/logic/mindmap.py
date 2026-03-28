import anthropic
import json
import time
import sys
import re
from pathlib import Path
import spacy
import numpy as np
import faiss
from typing import List
import uuid


TOPIC_COLORS = [
    "#FF9F5A",
    "#5DB8FF",
    "#6ED49A",
    "#C47EDB",
    "#F7C948",
    "#4ECDC4",
    "#FF7B7B",
    "#A8B8FF",
]

SYSTEM_PROMPT = """You are a knowledge extraction engine.

Your task is to extract ONLY meaningful academic or conceptual content from the input text and ignore ALL noise.

NOISE includes (but is not limited to):
- Filler words (e.g., "um", "uh", "like")
- Background chatter or student interruptions
- Comments about the lecturer, students, or classroom environment
- Jokes, side remarks, or off-topic tangents
- Incomplete or unclear thoughts that do not convey real information

If the input consists entirely or mostly of noise, RETURN AN EMPTY JSON ARRAY: []

From the remaining meaningful content, extract a structured mind-map hierarchy with EXACTLY three levels:

1. TOPIC — a broad subject (e.g. "Machine Learning", "Photosynthesis")
2. SUBTOPIC — a specific concept under each topic
3. DETAIL — one concrete, complete sentence under the subtopic

Rules:
- A topic may have multiple subtopics
- A subtopic may have multiple details
- Each detail must be ONE of:
    - "definition": explains what something is
    - "example": a concrete instance or application
    - "fact": a notable property or relationship
- Each detail must be a FULL, grammatically correct sentence (1–2 sentences max)
- Do NOT include fragments, keywords, or partial phrases
- Do NOT invent or assume information — only extract what is explicitly stated
- If multiple topics exist, extract all of them
- If structure is unclear, infer the most logical grouping based ONLY on meaningful content

Example output (ONLY JSON array):
[
  {
    "topic": "Machine Learning",
    "subtopic": "Supervised Learning",
    "detail": "Supervised learning uses labeled datasets to train models to make predictions.",
    "detail_type": "definition"
  }
]

Important:
Now respond ONLY with a JSON array like the example above.
Always produce a valid, fully closed JSON array.
Do not truncate, and do not include partial or incomplete strings.
If, after removing noise, there is no meaningful academic or conceptual information, RETURN: []
Do NOT output explanations, commentary, or text outside the JSON.
"""


def chunk_text(text: str, max_chars: int = 1200) -> list:
    sentences = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    chunks, current = [], ""
    for sent in sentences:
        if len(current) + len(sent) > max_chars and current:
            chunks.append(current.strip())
            current = sent
        else:
            current += (" " if current else "") + sent
    if current.strip():
        chunks.append(current.strip())
    return chunks


def extract_hierarchy(client, chunk: str) -> list:
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": chunk}],
        )
        print("Input tokens:", msg.usage.input_tokens)
        print("Output tokens:", msg.usage.output_tokens)
        raw = msg.content[0].text
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        print(raw)
        if not raw or raw.strip() == "[]":
            raise Exception("Claude returned empty")
        return json.loads(raw.strip())
    except Exception as e:
        print(f"  [warn] extraction failed: {e}", file=sys.stderr)
        return []


class GraphState:
    def __init__(self):
        self.nodes = {}
        self.edges = []
        self.edge_keys = set()
        self.topic_colors = {}
        self._color_idx = 0
        self.subtopic_parent = {}
        self.cleaned = {}

    def __getstate__(self):
        state = self.__dict__.copy()
        del state["nlp"]  # ✅ exclude spaCy model — ~50MB gone
        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.nlp = spacy.load("en_core_web_md")  # reload on deserialize

    def _next_color(self):
        c = TOPIC_COLORS[self._color_idx % len(TOPIC_COLORS)]
        self._color_idx += 1
        return c

    def _add_edge(self, src, tgt):
        key = (src, tgt)
        if key not in self.edge_keys:
            self.edge_keys.add(key)
            self.edges.append({"source": src, "target": tgt})

    def upsert_topic(self, name):
        node_id = f"topic::{name.lower()}"
        if node_id not in self.topic_colors:
            self.topic_colors[node_id] = self._next_color()
        color = self.topic_colors[node_id]
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "label": name,
                "type": "topic",
                "color": color,
                "size": 1400,
            }
        else:
            self.nodes[node_id]["size"] = min(self.nodes[node_id]["size"] + 100, 2400)
        return node_id

    def upsert_subtopic(self, name, topic_id):
        subtopic_id = f"sub::{topic_id}::{name.lower()}"
        color = self.topic_colors.get(topic_id, TOPIC_COLORS[0])
        if subtopic_id not in self.nodes:
            self.nodes[subtopic_id] = {
                "id": subtopic_id,
                "label": name,
                "type": "subtopic",
                "color": color,
                "size": 700,
            }
        # Always ensure edge and parent tracking
        self._add_edge(topic_id, subtopic_id)
        self.subtopic_parent[subtopic_id] = topic_id
        return subtopic_id

    def add_detail(self, text, detail_type, subtopic_id):
        detail_id = f"detail::{uuid.uuid4()}"
        color_map = {"definition": "#E8F4FD", "example": "#FFF3E0", "fact": "#F1F8E9"}
        border_map = {"definition": "#90CAF9", "example": "#FFCC80", "fact": "#A5D6A7"}
        self.nodes[detail_id] = {
            "id": detail_id,
            "label": text,
            "type": "detail",
            "detail_type": detail_type,
            "color": color_map.get(detail_type, "#F5F5F5"),
            "border_color": border_map.get(detail_type, "#BDBDBD"),
            "size": 300,
        }
        self._add_edge(subtopic_id, detail_id)
        return detail_id

    def extract_data(self, data):
        for item in data:
            topic = item.get("topic", "").strip()
            subtop = item.get("subtopic", "").strip()
            detail = item.get("detail", "").strip()
            detail_type = item.get("detail_type", "").strip()
            if not topic or not subtop or not detail or not detail_type:
                continue
            tid = self.upsert_topic(topic)
            sid = self.upsert_subtopic(subtop, tid)
            self.add_detail(detail, detail_type, sid)

    def write(self, path="graph.json"):
        self.clean()
        with open(path, "w", encoding="utf-8") as f:
            json.dump(
                self.cleaned,
                f,
                indent=2,
                ensure_ascii=False,
            )

    def clean(self):
        self.cleaned = ({"nodes": list(self.nodes.values()), "links": self.edges},)


class GraphStateFAISSSpaCy(GraphState):
    def __init__(self, topic_thresh=0.85, subtopic_thresh=0.75):
        super().__init__()
        self.nlp = spacy.load("en_core_web_md")
        self.topic_thresh = topic_thresh
        self.subtopic_thresh = subtopic_thresh

        self.topic_ids: List[str] = []
        self.topic_embeddings: List[np.ndarray] = []
        self.subtopic_ids: List[str] = []
        self.subtopic_embeddings: List[np.ndarray] = []

        self.topic_faiss = None
        self.subtopic_faiss = None

    def _get_embedding(self, text: str) -> np.ndarray:
        vec = self.nlp(text).vector
        norm = np.linalg.norm(vec)
        return (vec / norm).astype("float32") if norm > 0 else vec.astype("float32")

    def _similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        v1 = a.reshape(1, -1).copy()
        v2 = b.reshape(1, -1).copy()
        faiss.normalize_L2(v1)
        faiss.normalize_L2(v2)
        index = faiss.IndexFlatIP(v1.shape[1])
        index.add(v2)
        score, _ = index.search(v1, k=1)
        return float(score[0][0])

    def _search(self, embedding, index, ids, threshold):
        if index is None or index.ntotal == 0:
            return None
        sim, idx = index.search(np.array([embedding]), 1)
        if sim[0][0] >= threshold:
            return ids[idx[0][0]]
        return None

    def _add_to_index(self, embedding, faiss_cache, ids, embeddings, node_id):
        if faiss_cache is None:
            faiss_cache = faiss.IndexFlatIP(embedding.shape[0])
        faiss_cache.add(np.array([embedding]))
        ids.append(node_id)
        embeddings.append(embedding)
        return faiss_cache

    def upsert_topic(self, name: str):
        embedding = self._get_embedding(name)

        # Reuse existing similar topic
        topic_id = self._search(
            embedding, self.topic_faiss, self.topic_ids, self.topic_thresh
        )
        if topic_id:
            self.nodes[topic_id]["size"] = min(self.nodes[topic_id]["size"] + 100, 2400)
            if len(name) > len(self.nodes[topic_id]["label"]):
                self.nodes[topic_id]["label"] = name
            return topic_id

        # Create new topic
        topic_id = super().upsert_topic(name)
        self.topic_faiss = self._add_to_index(
            embedding, self.topic_faiss, self.topic_ids, self.topic_embeddings, topic_id
        )

        # Check if any existing subtopic is more similar to this new topic
        # than it is to its current parent — if so, add a cross-link (visual only)
        if self.subtopic_faiss is not None:
            subtopic_id = self._search(
                embedding, self.subtopic_faiss, self.subtopic_ids, self.subtopic_thresh
            )
            if subtopic_id:
                current_parent_id = self.subtopic_parent[subtopic_id]
                current_score = self._similarity(
                    self._get_embedding(self.nodes[subtopic_id]["label"]),
                    self._get_embedding(self.nodes[current_parent_id]["label"]),
                )
                new_score = self._similarity(
                    self._get_embedding(self.nodes[subtopic_id]["label"]),
                    embedding,
                )
                if new_score > current_score + 0.05:
                    # Add a visual cross-link without changing the authoritative parent
                    self._add_edge(topic_id, subtopic_id)

        return topic_id

    def upsert_subtopic(self, name: str, topic_id: str):
        embedding = self._get_embedding(name)

        # Search only among siblings (subtopics with same parent)
        sibling_indices = [
            i
            for i, sid in enumerate(self.subtopic_ids)
            if self.subtopic_parent.get(sid) == topic_id
        ]

        if sibling_indices:
            sibling_embs = np.array(
                [self.subtopic_embeddings[i] for i in sibling_indices]
            )
            sibling_ids = [self.subtopic_ids[i] for i in sibling_indices]
            temp_index = faiss.IndexFlatIP(embedding.shape[0])
            temp_index.add(sibling_embs)
            match = self._search(
                embedding, temp_index, sibling_ids, self.subtopic_thresh
            )
            if match:
                # Reuse existing subtopic — ensure edge exists
                self._add_edge(topic_id, match)
                return match

        # Create new subtopic (parent tracking handled by super)
        subtopic_id = super().upsert_subtopic(name, topic_id)
        self.subtopic_faiss = self._add_to_index(
            embedding,
            self.subtopic_faiss,
            self.subtopic_ids,
            self.subtopic_embeddings,
            subtopic_id,
        )
        return subtopic_id


def fetch_graph(item, file):
    return deserialize(item, file)


def main():
    client = anthropic.Anthropic()
    graph = GraphStateFAISSSpaCy()

    input_file = sys.argv[1] if len(sys.argv) > 1 else "input.txt"
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 2
    output = sys.argv[3] if len(sys.argv) > 3 else "graph.json"

    text = Path(input_file).read_text(encoding="utf-8")
    chunks = chunk_text(text, max_chars=900)
    print(f"Processing {len(chunks)} chunk(s) from '{input_file}'…")

    for i, chunk in enumerate(chunks, 1):
        print(f"  Chunk {i}/{len(chunks)}…", end=" ", flush=True)
        data = extract_hierarchy(client, chunk)
        print(f"{len(data)} triple(s).")
        graph.extract_data(data)
        print(f"  → Written to {output}")
        time.sleep(delay)

    graph.write(output)
    print(f"\nDone — {len(graph.nodes)} nodes, {len(graph.edges)} edges → {output}")


if __name__ == "__main__":
    main()
