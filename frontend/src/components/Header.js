"use client"; // if you use hooks or state

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import OnlineBadge from "@/components/OnlineBadge";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isWelcome = pathname === "/";
  const isStudentShell = [
    "/student",
    "/subjects",
    "/achievements",
    "/progress",
    "/settings",
  ].some((p) => pathname?.startsWith(p));

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* Use public asset with absolute path; fallback to initials if missing */}
        {(() => {
          const [ok] = [true];
          return ok ? (
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded" />
          ) : (
            <div className="w-8 h-8 rounded bg-white text-blue-600 flex items-center justify-center text-xs font-bold">SL</div>
          );
        })()}
        <h1 className="text-xl font-bold">Gamified STEM Learning</h1>
      </div>
      <nav>
        {isWelcome ? (
          <div className="flex items-center gap-3">
            <ul className="flex space-x-4">
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
            <ThemeToggle />
          </div>
        ) : isStudentShell ? (
          // Replace nav with language toggle + online badge + Clerk profile button on student pages
          <div className="flex items-center gap-3">
            <OnlineBadge />
            <LanguageToggle allowed={["en","or"]} />
            <ThemeToggle />
            <UserButton />
          </div>
        ) : (
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/student">Student</Link>
            </li>
            <li>
              <Link href="/teacher">Teacher</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <ThemeToggle />
            </li>
            <li>
              <UserButton />
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
