const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

function authHeaders() {
  const token = localStorage.getItem("astronotes_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendMessage(transcriptId, messages) {
  const res = await fetch(`${API}/api/chat/${transcriptId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || `Chat failed (${res.status})`);
  }
  return res.json(); // { reply: string }
}
