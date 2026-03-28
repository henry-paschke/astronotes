const API = "http://localhost:8000";

export async function patchMe(payload) {
  const token = localStorage.getItem("astronotes_token");
  const res = await fetch(`${API}/api/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Update failed.");
  return data;
}

export async function getToken(body) {
  return await fetch(`${API}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function createAccount(username, password) {
  return await fetch(`${API}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}
