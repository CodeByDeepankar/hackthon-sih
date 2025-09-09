"use client";
import { useRouter, usePathname } from "next/navigation";

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  const Item = ({ to, label }) => (
    <button
      onClick={() => router.push(to)}
      className={`px-2 py-1 rounded ${pathname?.startsWith(to) ? "font-semibold" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <nav className="flex gap-4 text-sm">
          <Item to="/student" label="Home" />
          <Item to="/subjects" label="Subjects" />
          <Item to="/achievements" label="Achievements" />
          <Item to="/progress" label="Progress" />
          <Item to="/settings" label="Settings" />
        </nav>
      </div>
    </footer>
  );
}
