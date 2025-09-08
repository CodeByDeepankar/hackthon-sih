"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function TeacherDashboard() {
  return (
    <>
      <SignedIn>
        <div style={{ padding: 24 }}>
          <h2>Teacher Dashboard</h2>
          <p>Welcome! Manage classes and content here.</p>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
