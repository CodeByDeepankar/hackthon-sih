"use client"; // if you use hooks or state

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import OnlineBadge from "@/components/OnlineBadge";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isWelcome = pathname === "/";
  const isStudentShell = [
    "/student",
    "/subjects",
    "/achievements",
    "/progress",
    "/settings",
  ].some((p) => pathname?.startsWith(p));
  const isTeacherShell = pathname?.startsWith("/teacher");
  const isRoleSelect = pathname === "/role-select";

  return (
    <header
      className="p-4 w-[80vw] m-auto flex justify-between items-center"
      style={isLight ? { backgroundColor: "#ffffff", color: "#000000" } : { backgroundColor: "#000000", color: "#f8fafc" }}
    >
      <div className="flex items-center gap-2">
        {/* Use public asset with absolute path; ensure visibility and clarity */}
        <Image
          src="/logo.webp"
          alt="GYANARATNA logo"
          width={56}
          height={56}
          priority
          className="object-contain"
        />
        <h1 className="text-xl font-bold">GYANARATNA</h1>
      </div>
      <nav>
        {isWelcome ? (
          <div className="flex items-center gap-3">
            {/* Contact removed on welcome page */}
            <ThemeToggle />
          </div>
        ) : isStudentShell ? (
          // Replace nav with language toggle + online badge + Clerk profile button on student pages
          <div className="flex items-center gap-3">
            <OnlineBadge />
            <LanguageToggle allowed={["en","or","hi"]} />
            <ThemeToggle />
            <UserButton />
          </div>
        ) : isTeacherShell ? (
          // On teacher routes, remove the default nav links (Home/Student/Teacher/Contact)
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton />
          </div>
        ) : (
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/">Home</Link>
            </li>
            {!isRoleSelect && (
              <>
                <li>
                  <Link href="/student">Student</Link>
                </li>
                <li>
                  <Link href="/teacher">Teacher</Link>
                </li>
              </>
            )}
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
