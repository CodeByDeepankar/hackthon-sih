"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const ChallengeArena = dynamic(() => import("@/student/components/challenge-arena"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <ChallengeArena />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
