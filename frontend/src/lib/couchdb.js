// Client-side helper to fetch students from the backend CouchDB proxy

export async function fetchStudents() {
  const res = await fetch("http://localhost:4000/progress", {
    // Ensure no caching while developing
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch students: ${res.status} ${text}`);
  }

  return res.json();
}
