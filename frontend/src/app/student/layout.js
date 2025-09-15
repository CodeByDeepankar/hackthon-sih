"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/student/components/ui/button";
import { Card } from "@/student/components/ui/card";
import { cn } from "@/student/components/ui/utils";
import { BookOpen, Trophy, Star, Search, Gamepad2, Crown, Award, Home } from "lucide-react";
import { Input } from "@/student/components/ui/input";
import { useI18n } from "@/i18n/useI18n";
import { HamburgerMenu } from "@/student/components/hamburger-menu";
import { useUser } from "@clerk/nextjs";
import { useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const makeNavItems = (t) => [
  { href: "/student", label: t.nav.dashboard(), icon: Home },
  { href: "/student/courses", label: t.nav.courses(), icon: BookOpen },
  { href: "/student/achievements", label: t.nav.achievements(), icon: Star },
  { href: "/student/leaderboard", label: t.nav.leaderboard(), icon: Trophy },
  { href: "/student/search", label: t.nav.search(), icon: Search },
  { href: "/student/games", label: t.nav.games(), icon: Gamepad2 },
  { href: "/student/challenges", label: t.nav.challenges(), icon: Crown },
  { href: "/student/adventures", label: t.nav.adventures(), icon: Award },
];

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const searchRef = useRef(null);
  const { theme } = useTheme();
  const { t } = useI18n();
  const isLight = theme === "light";

  const navItems = makeNavItems(t);
  const menuItems = navItems.map((n) => ({ id: n.href.replace("/student", "") || "dashboard", label: n.label, icon: n.icon, href: n.href }));
  const currentSection = (pathname?.startsWith("/student/") ? pathname.split("/")[2] : "") || "dashboard";
  const studentUser = { name: user?.fullName || user?.firstName || user?.username || "Student", avatar: (user?.firstName?.[0] || user?.username?.[0] || "S").toUpperCase() };
  const teacherUser = { name: "Teacher", avatar: "T", school: "" };
  const onNavigate = (id) => {
    const target = menuItems.find((m) => m.id === id)?.href || "/student";
    router.push(target);
  };
  return (
    <>
      <SignedIn>
        <div
          className="min-h-screen"
          style={{ backgroundColor: isLight ? "#ffffff" : "#0b0b0f", color: isLight ? "#000000" : "#f8fafc" }}
        >
          {/* Header */}
          <header
            className="sticky top-0 z-40 border-b backdrop-blur"
            style={{
              backgroundColor: isLight ? "#ffffff" : "#000000",
              color: isLight ? "#000000" : "#f8fafc",
              borderColor: isLight ? "#e5e7eb" : "#1f2430",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
              {/* Hamburger menu on the left */}
              <HamburgerMenu
                userRole="student"
                currentSection={currentSection}
                studentUser={studentUser}
                teacherUser={teacherUser}
                menuItems={menuItems}
                onNavigate={onNavigate}
                onRoleSwitch={() => {}}
              />

              {/* Inline search (uses existing Input/Button components) */}
              <div className="flex-1 max-w-xl hidden sm:flex items-center gap-2">
                <Input
                  ref={searchRef}
                  placeholder={t.search.placeholder()}
                  className={isLight ? "placeholder-black/70 text-black" : "placeholder-slate-400 text-slate-100"}
                  style={{
                    backgroundColor: isLight ? "#d4ffd4" : "#12141a",
                    borderColor: isLight ? "#bfeebf" : "#1f2430",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = e.currentTarget.value.trim();
                      router.push(q ? `/student/search?q=${encodeURIComponent(q)}` : "/student/search");
                    }
                  }}
                />
                <Button
                  size="sm"
                  className={isLight ? "text-black" : undefined}
                  onClick={() => {
                    const q = searchRef.current?.value?.trim();
                    router.push(q ? `/student/search?q=${encodeURIComponent(q)}` : "/student/search");
                  }}
                > 
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Desktop nav removed to avoid duplication with hamburger menu */}
              <div className="flex items-center gap-2">
                <Link href="/student">
                  <Button
                    variant={pathname === "/student" ? "default" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isLight && "text-black", pathname === "/student" && "shadow-sm")}
                  >
                    <Home className="w-4 h-4" />
                    {t.nav.dashboard()}
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="max-w-7xl mx-auto px-4 py-4">
            {children}
          </main>

          {/* Mobile bottom nav */}
          <div
            className="md:hidden fixed bottom-0 inset-x-0 border-t backdrop-blur"
            style={{
              backgroundColor: isLight ? "#ffffff" : "#000000",
              color: isLight ? "#000000" : "#f8fafc",
              borderColor: isLight ? "#e5e7eb" : "#1f2430",
            }}
          >
            <div className="grid grid-cols-4">
              {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center py-2 text-xs",
                      isLight
                        ? active
                          ? "text-black"
                          : "text-black/70"
                        : active
                        ? "text-white"
                        : "text-slate-300"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
