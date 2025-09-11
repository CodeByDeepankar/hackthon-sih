"use client";
import Script from "next/script";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SignedOut, SignedIn, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { fetchUserRole } from '@/lib/users';
import { motion, AnimatePresence } from 'framer-motion';

const headingVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.28 } }
};

// Typewriter variants
const typeParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
};

const typeLetter = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } }
};

// Word-by-word paragraph animation
const wordsParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.28 } }
};

const wordChild = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

export default function WelcomeOrRedirect() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    async function go() {
      if (!user) return; // stay on landing; SignedOut UI will show CTA
      const record = await fetchUserRole(user.id).catch(() => null);
      if (!record || record.role === 'unassigned' || record.provisional) {
        router.replace('/role-select');
        return;
      }
      if (record.role === 'student') router.replace('/student');
      else if (record.role === 'teacher' || record.role === 'admin') router.replace('/teacher');
      else router.replace('/role-select');
    }
    go();
  }, [isLoaded, user, router]);

  // Preload the GIF so it appears instantly when the MP4 ends
  useEffect(() => {
    try {
      const img = new Image();
      img.src = '/home.gif';
    } catch (e) {
      // ignore
    }
  }, []);

  // local state to toggle from mp4 -> gif
  const [showGif, setShowGif] = useState(false);
  const videoRef = useRef(null);

  // Try to programmatically start playback for browsers that require a play() call
  useEffect(() => {
    if (showGif) return;
    const v = videoRef.current;
    if (!v) return;
    // attempt play; some browsers require user gesture — handle the promise
    const p = v.play();
    if (p && p.catch) {
      p.catch((err) => {
        // common: autoplay prevented. We'll mute and try again.
        try {
          v.muted = true;
          v.play().catch(()=>{});
        } catch (e) {}
      });
    }
  }, [showGif]);

  return (
    <>
    <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
        strategy="afterInteractive" // loads after hydration
        defer
      />
  <section className="relative text-center h-150 bg-[#fcfcfc] overflow-hidden flex items-center">
      {/* subtle decorative shapes to give a shopify-like white + blue/green feel */}
      <svg className="absolute left-0 top-0 -translate-x-1/4 -translate-y-1/4 opacity-30 pointer-events-none" width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="80" cy="80" r="120" fill="url(#g1)" />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-20 pointer-events-none" width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="40" y="40" width="300" height="300" rx="150" fill="url(#g2)" />
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 h-full">
          {/* Left column: heading, paragraph, CTA */}
          <div className="text-left flex flex-col justify-center h-full">
            <SignedOut>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
                className="p-2 md:p-0"
              >
                <motion.h2
                  variants={headingVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 text-transparent bg-clip-text tracking-tight leading-tight drop-shadow-md transform-gpu"
                >
                  <motion.span variants={wordsParent} initial="hidden" animate="visible" aria-hidden>
                    {['Learn,', 'Play,', 'and', 'Grow!'].map((word, idx) => (
                      <motion.span key={idx} variants={wordChild} className="inline-block mr-2">
                        {word}
                      </motion.span>
                    ))}
                  </motion.span>
                </motion.h2>

                <motion.p variants={paragraphVariants} className="text-lg md:text-xl lg:text-2xl text-slate-700 max-w-xl">
                  <motion.span variants={wordsParent} initial="hidden" animate="visible" aria-hidden>
                    {Array.from('Join our platform to start learning in a fun way.'.split(' ')).map((w, i) => (
                      <motion.span key={i} variants={wordChild} className="inline-block mr-1">
                        {w}
                      </motion.span>
                    ))}
                  </motion.span>
                  <span className="sr-only">Join our platform to start learning in a fun way.</span>
                </motion.p>

                {/* CTA: centered and using Shades-like button style */}
                <div className="mt-6 flex justify-center md:justify-start">
                  <SignInButton>
                    <button className="hidden md:inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:from-sky-700 hover:to-indigo-700 transform transition duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 cursor-pointer">
                      Get Started
                    </button>
                  </SignInButton>
                </div>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <p className="text-slate-600">Checking your role...</p>
              <div className="mt-4">
                <UserButton />
              </div>
            </SignedIn>
          </div>

          {/* Right column: mascot animation */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-4xl flex items-center justify-center px-4">
              {!showGif ? (
                <video
                  ref={videoRef}
                  src="/home.mp4"
                  preload="auto"
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setShowGif(true)}
                  className="w-full h-auto max-h-[72vh] mx-auto block object-contain rounded-md"
                />
              ) : (
                <img
                  src="/home.gif"
                  alt="Home animation"
                  className="w-full h-auto max-h-[72vh] mx-auto block object-contain rounded-md"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
