// lib/couchdb.js
export const fetchStudents = async () => {
  const res = await fetch('http://127.0.0.1:5984/students/_all_docs?include_docs=true', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch students');
  }

  const data = await res.json();
  return data.rows.map(row => row.doc); // extract documents
};
