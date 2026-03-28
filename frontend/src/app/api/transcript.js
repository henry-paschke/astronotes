export async function createTranscript() {
  const token = localStorage.getItem("astronotes_token");
  const response = await fetch("http://127.0.0.1:8000/api/create-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.log(err);
    throw new Error(err.detail || "Failed to create transcript");
  }
  return response.json();
}
