export async function createTranscript() {
  const response = await fetch("http://127.0.0.1:8000/api/create-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const data = await response.json();
  console.log(data);
}
