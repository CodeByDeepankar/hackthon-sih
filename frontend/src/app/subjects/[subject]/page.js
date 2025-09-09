"use client";

import { useParams, useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import FooterNav from "@/components/FooterNav";

export default function SubjectDetailPage() {
  const params = useParams();
  const subject = params?.subject || "subject";
  const router = useRouter();
  const chapters = [
    { id: 1, title: "Chapter 1" },
    { id: 2, title: "Chapter 2" },
  ];

  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">{String(subject).toUpperCase()}</h2>
          <div className="grid gap-2">
            {chapters.map((c) => (
              <button key={c.id} className="border rounded p-3 text-left hover:shadow">
                {c.title}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={() => router.back()} className="px-3 py-1 border rounded">Back</button>
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
