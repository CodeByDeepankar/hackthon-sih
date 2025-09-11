"use client";
import Script from "next/script";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignedOut, SignedIn, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { fetchUserRole } from '@/lib/users';
import { motion, AnimatePresence } from 'framer-motion';

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
    <>
    <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
        strategy="afterInteractive" // loads after hydration
        defer
      />
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
       {/* Card-like mascot using shadcn/card style (no new UI package required) */}
       <AnimatePresence>
        <motion.aside
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ rotate: 6, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="mascot mt-6 mx-auto max-w-xs"
          aria-hidden="true"
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-xs text-gray-500">Welcome!</div>
              <div className="inline-block transform-gpu">
                <lottie-player
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto block"
                  src="https://assets9.lottiefiles.com/packages/lf20_qp1q7mct.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                  aria-label="Animated student character"
                />
              </div>
            </div>
          </div>
        </motion.aside>
       </AnimatePresence>
    </div>
    </>
  );
}
