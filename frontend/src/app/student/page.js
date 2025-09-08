"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function StudentDashboard() {
  return (
    <>
      <SignedIn>
        <div style={{ padding: 24 }}>
          <h2>Student Dashboard</h2>
          <p>Welcome! Your learning content will appear here.</p>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
