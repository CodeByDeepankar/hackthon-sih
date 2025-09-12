"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const LessonViewer = dynamic(() => import("@/student/components/lesson-viewer"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <LessonViewer />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
