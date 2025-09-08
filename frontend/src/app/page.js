'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignedOut, SignedIn, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { fetchUserRole } from '@/lib/users';

export default function WelcomeOrRedirect() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    async function go() {
      if (!user) return; // stay on landing; SignedOut UI will show CTA
      const record = await fetchUserRole(user.id).catch(() => null);
      if (record?.role === 'student') router.replace('/student');
      else if (record?.role === 'teacher') router.replace('/teacher');
      else router.replace('/role-select');
    }
    go();
  }, [isLoaded, user, router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <SignedOut>
        <h2>Learn, Play, and Grow!</h2>
        <p>Join our platform to start learning in a fun way.</p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <SignInButton>
            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Get Started</button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <p>Checking your role...</p>
        <div style={{ marginTop: 16 }}>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
