"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const StudyAdventures = dynamic(() => import("@/student/components/study-adventures"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <StudyAdventures />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
