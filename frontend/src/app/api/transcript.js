export async function createTranscript() {
  console.log("sent");
  const response = await fetch("http://127.0.0.1:8000/api/create-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  console.log("received");
  const data = await response.json();
  console.log(data);
  return data;
}
