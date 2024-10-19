export async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}
