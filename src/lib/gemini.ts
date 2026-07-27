export async function getStyleAdvice(prompt: string) {
  const response = await fetch("/api/style-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch style advice");
  }
  
  const data = await response.json();
  return data.advice;
}
