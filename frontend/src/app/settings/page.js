"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/student/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/student/components/ui/card";
import FooterNav from "@/components/FooterNav";

export default function SettingsPage() {
  const [studentClass, setStudentClass] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studentClass");
      if (saved) setStudentClass(saved);
    } catch {}
  }, []);

  function saveClass(cls) {
    setStudentClass(String(cls));
    try { localStorage.setItem("studentClass", String(cls)); } catch {}
  }

  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold mb-3">Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[6,7,8,9,10,11,12].map(c => (
                  <Button key={c} variant={String(c)===String(studentClass)?"":"outline"} onClick={()=>saveClass(c)}>
                    {c}
                  </Button>
                ))}
              </div>
              {studentClass && (
                <p className="text-sm text-gray-600 mt-3">Current class: {studentClass}</p>
              )}
            </CardContent>
          </Card>
  </div>
  <FooterNav />
  <div className="h-14" aria-hidden />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
