"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUserRole } from "@/lib/users";

const classes = [6, 7, 8, 9, 10, 11, 12];

export default function RoleSelectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [klass, setKlass] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  const canContinue = useMemo(() => !!role, [role]);
  const canSubmit = useMemo(() => {
    if (!name || !schoolId) return false;
    if (role === "student") return !!klass;
    return true;
  }, [name, schoolId, klass, role]);

  async function submit() {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserRole({ userId: user.id, role, name, schoolId, class: role === "student" ? Number(klass) : undefined });
      router.replace(role === "student" ? "/student" : "/teacher");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "4rem auto", padding: 16 }}>
      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <h2>Choose your role</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <button aria-pressed={role === "student"} onClick={() => setRole("student")} style={{ padding: "0.75rem 1rem" }}>
              I am a Student
            </button>
            <button aria-pressed={role === "teacher"} onClick={() => setRole("teacher")} style={{ padding: "0.75rem 1rem" }}>
              I am a Teacher
            </button>
          </div>
          <div style={{ marginTop: 24 }}>
            <button disabled={!canContinue} onClick={() => setStep(2)} style={{ padding: "0.5rem 1rem" }}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Tell us about you</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </label>
            {role === "student" && (
              <label>
                <span>Class</span>
                <select value={klass} onChange={(e) => setKlass(e.target.value)}>
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span>School ID</span>
              <input value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="School ID" />
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep(1)} type="button">Back</button>
            <button disabled={!canSubmit || saving} onClick={submit} type="button">
              {saving ? "Saving..." : "Finish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
