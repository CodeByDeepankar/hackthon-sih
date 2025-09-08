"use client"
import { useEffect, useState } from 'react';
import { fetchStudents } from '../lib/couchdb';

export default function Home() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents()
      .then(setStudents)
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Students List</h1>
      <ul>
        {students.map(student => (
          <li key={student._id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}
