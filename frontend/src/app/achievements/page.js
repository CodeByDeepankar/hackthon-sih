"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import FooterNav from "@/components/FooterNav";

export default function AchievementsPage() {
  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Achievements</h2>
          <p>Badges and milestones will appear here.</p>
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
