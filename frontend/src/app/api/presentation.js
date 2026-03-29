const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

function authHeaders() {
  const token = localStorage.getItem("astronotes_token");
  return { Authorization: `Bearer ${token}` };
}

export async function getPresentation(transcriptId) {
  const res = await fetch(`${API}/api/presentations/${transcriptId}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load presentation (${res.status})`);
  return res.json();
}

export async function generatePresentation(transcriptId) {
  const res = await fetch(`${API}/api/presentations/${transcriptId}/generate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || `Generation failed (${res.status})`);
  }
  return res.json();
}
