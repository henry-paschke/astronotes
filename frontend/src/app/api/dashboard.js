const API = "http://localhost:8000";

export async function initializeRedis(id) {
  console.log(id);
  return await fetch(`${API}/api/initialize-redis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}
