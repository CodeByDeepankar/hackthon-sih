"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import DashboardV2 from "@/student/pages/DashboardV2";

export default function Page() {
  return (
    <>
      <SignedIn>
        <DashboardV2 />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
