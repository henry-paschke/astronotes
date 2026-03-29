const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

export async function updateGraph(id, data) {
  return await fetch(`${API}/api/update-graph`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data }),
  });
}
