"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const Achievements = dynamic(() => import("@/student/components/achievements"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <Achievements />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
