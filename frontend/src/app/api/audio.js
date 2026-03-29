const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

export async function transcribe(data) {
  return await fetch(`${API}/api/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
}
