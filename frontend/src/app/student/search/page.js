"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const SearchPage = dynamic(() => import("@/student/components/search"), { ssr: false });

export default function Page() {
  return (
    <>
      <SignedIn>
        <SearchPage />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
