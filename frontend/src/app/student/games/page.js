"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const LearningGames = dynamic(() => import("@/student/components/learning-games"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <LearningGames />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
