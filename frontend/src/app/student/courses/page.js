"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const CourseSelection = dynamic(() => import("@/student/components/course-selection"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <CourseSelection />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
