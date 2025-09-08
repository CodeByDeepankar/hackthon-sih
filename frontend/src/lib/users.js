export async function fetchUserRole(userId) {
  const res = await fetch(`http://localhost:4000/users/${encodeURIComponent(userId)}/role`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch role (${res.status})`);
  return res.json();
}

export async function saveUserRole({ userId, role, name, schoolId, class: klass }) {
  const res = await fetch("http://localhost:4000/users/role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, role, name, schoolId, class: klass }),
  });
  if (!res.ok) throw new Error(`Failed to save role (${res.status})`);
  return res.json();
}
