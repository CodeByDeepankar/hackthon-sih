"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BookOpen, BarChart3 } from "lucide-react";

const nav = [
  { href: "/teacher", label: "Dashboard", icon: Home },
  { href: "/teacher/classes", label: "Classes", icon: BookOpen },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/reports", label: "Reports", icon: BarChart3 },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-64 bg-[#0f1b2d] text-white flex flex-col px-4 py-5 sticky top-0">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center font-semibold">S</div>
        <div>
          <div className="font-semibold leading-tight">STEM Dashboard</div>
          <div className="text-xs text-white/70">Grades 6–12</div>
        </div>
      </div>
      <nav className="mt-2 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                active ? "bg-[#5b5bd6] text-white" : "hover:bg-white/10 text-white/85"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-[10px] text-white/50 px-2">©2025 • STEM analytics</div>
    </aside>
  );
}
