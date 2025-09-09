"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import FooterNav from "@/components/FooterNav";

export default function SubjectsPage() {
  const router = useRouter();
  const subjects = [
    { key: "math", name: "Math" },
    { key: "science", name: "Science" },
  ];

  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <button
                key={s.key}
                onClick={() => router.push(`/subjects/${s.key}`)}
                className="border rounded p-3 text-left hover:shadow"
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-600">Tap to view chapters</div>
              </button>
            ))}
          </div>
  </div>
  <FooterNav />
  <div className="h-14" aria-hidden />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
