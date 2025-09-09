"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import FooterNav from "@/components/FooterNav";

export default function ProgressPage() {
  const weekly = [20, 35, 40, 55, 38, 60, 68];
  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Progress</h2>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600 mb-2">Weekly performance</div>
            <svg className="w-full h-24" viewBox="0 0 120 60" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={weekly
                  .map((v, i) => `${(i / (weekly.length - 1)) * 120},${60 - (v / 100) * 60}`)
                  .join(" ")}
              />
            </svg>
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
