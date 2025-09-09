"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import FooterNav from "@/components/FooterNav";

export default function SettingsPage() {
  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Settings</h2>
          <p>Manage preferences here.</p>
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
