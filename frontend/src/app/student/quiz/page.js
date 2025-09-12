"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const QuizComponent = dynamic(() => import("@/student/components/quiz-component"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <QuizComponent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
