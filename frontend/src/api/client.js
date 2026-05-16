// Choose backend URL based on environment
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080"       // local dev backend
    : "http://16.16.67.98:8080";    // production backend 

export async function fetchArticles() {
  try {
    const res = await fetch(`${BASE_URL}/articles`);
    if (!res.ok) throw new Error("Failed to fetch articles");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}
