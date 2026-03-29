const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/[/]$/, "");

export async function initializeRedis(id) {
  return await fetch(`${API}/api/initialize-redis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}
