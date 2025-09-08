"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 shadow-md bg-white">
      <h1 className="font-bold text-xl">STEM Learning</h1>
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/lessons">Lessons</Link>
        <Link href="/games">Games</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}
