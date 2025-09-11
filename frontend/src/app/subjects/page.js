"use client";

import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import FooterNav from "@/components/FooterNav";
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function SubjectsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) return;
      setLoading(true); setError(null);
      try {
        const role = await apiClient.getUserRole(user.id).catch(()=>null);
        const classFilter = role?.class;
        const schoolId = role?.schoolId;
        const subs = await apiClient.getSubjects({ class: classFilter, schoolId });
        const filtered = subs.filter(s => !schoolId || !s.schoolId || s.schoolId === schoolId);
        if (active) setSubjects(filtered);
      } catch(e) {
        if (active) setError(e.message);
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  return (
    <>
      <SignedIn>
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Subjects</h2>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && subjects.length === 0 && <div className="text-sm text-gray-500">No subjects yet.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {subjects.map((s) => (
              <button
                key={s.id || s.key}
                onClick={() => router.push(`/subjects/${s.id || s.key}`)}
                className="border rounded p-3 text-left hover:shadow"
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">Class {s.class || '—'}</div>
              </button>
            ))}
          </div>
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
