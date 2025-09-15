"use client";
import TeacherSidebar from "@/teacher/components/TeacherSidebar";

export default function TeacherLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600">
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
