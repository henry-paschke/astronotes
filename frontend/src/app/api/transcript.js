const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

function authHeaders() {
  const token = localStorage.getItem("astronotes_token");
  return { Authorization: `Bearer ${token}` };
}

export async function createTranscript() {
  const res = await fetch(`${API}/api/create-transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create transcript");
  }
  return res.json();
}

export async function listTranscripts() {
  const res = await fetch(`${API}/api/transcripts`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load transcripts (${res.status})`);
  return res.json();
}

export async function listClasses() {
  const res = await fetch(`${API}/api/transcripts/classes`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load classes (${res.status})`);
  return res.json();
}

export async function getTranscript(id) {
  const res = await fetch(`${API}/api/get-transcript?id=${id}`, { headers: authHeaders() });
  if (res.status === 403) throw new Error("You do not have access to this transcript.");
  if (res.status === 404) throw new Error("Transcript not found.");
  if (!res.ok) throw new Error(`Unexpected error (${res.status})`);
  return res.json();
}

export async function generateTranscriptDetails(id) {
  const res = await fetch(`${API}/api/transcripts/${id}/generate-details`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || `Generation failed (${res.status})`);
  }
  return res.json(); // { name, ai_summary }
}

export async function deleteTranscript(id) {
  const res = await fetch(`${API}/api/transcripts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Delete failed.");
  }
}

export async function updateTranscript(id, body) {
  const res = await fetch(`${API}/api/transcripts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Save failed.");
  }
  return res.json();
}
