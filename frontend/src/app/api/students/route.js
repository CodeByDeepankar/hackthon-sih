import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Temporary storage for demo
let students = [];

// Get all students
export async function GET() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  return NextResponse.json(students);
}

// Add a new student
export async function POST(req) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const data = await req.json();
  const newStudent = { id: Date.now(), ...data };
  students.push(newStudent);
  return NextResponse.json(newStudent);
}
