"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const Leaderboard = dynamic(() => import("@/student/components/leaderboard"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <Leaderboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
