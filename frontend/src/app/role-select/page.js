"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveUserRole } from "@/lib/users";
import styles from "./role-select.module.css";

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
    <div className={styles.wrapper}>
      <div className={styles["role-selection-container"]}>
        {step === 1 && (
          <div>
            <h1 className={styles.heading}>Choose your role</h1>
            <div className={styles.roleOptions}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={role === "student"}
                onClick={() => setRole("student")}
                onKeyDown={(e) => (e.key === "Enter" ? setRole("student") : null)}
                className={`${styles.roleCard} ${role === "student" ? styles.selected : ""}`}
              >
                I am a Student
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={role === "teacher"}
                onClick={() => setRole("teacher")}
                onKeyDown={(e) => (e.key === "Enter" ? setRole("teacher") : null)}
                className={`${styles.roleCard} ${role === "teacher" ? styles.selected : ""}`}
              >
                I am a Teacher
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.continueBtn} disabled={!canContinue} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className={styles.formHeading}>Tell us about you</h3>
            <div className={styles.formGrid}>
              <div className={styles.leftContent}>
                <label className={styles.formLabel}>Name<span className={styles.requiredStar}>*</span></label>
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              {role === "student" && (
                <div>
                  <label className={styles.formLabel}>Class<span className={styles.requiredStar}>*</span></label>
                  <select className={styles.select} value={klass} onChange={(e) => setKlass(e.target.value)}>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={styles.formLabel}>School ID<span className={styles.requiredStar}>*</span></label>
                <input className={styles.input} value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="School ID" />
              </div>
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.backBtn} onClick={() => setStep(1)} type="button">Back</button>
              <button className={styles.finishBtn} disabled={!canSubmit || saving} onClick={submit} type="button">
                {saving ? "Saving..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
