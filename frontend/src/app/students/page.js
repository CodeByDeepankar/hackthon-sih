"use client";

import { useState, useEffect } from "react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");

  // Fetch students from API
  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add new student
  const addStudent = async () => {
    if (!name || !className) return;

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, class: className }),
    });

    const newStudent = await res.json();
    setStudents([...students, newStudent]);
    setName("");
    setClassName("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Students</h1>

      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <button onClick={addStudent}>Add Student</button>
      </div>

      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.name} - Class {s.class}
          </li>
        ))}
      </ul>
    </div>
  );
}
