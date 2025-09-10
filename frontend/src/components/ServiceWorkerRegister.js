"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return; // avoid SW in dev to prevent stale chunk errors
  if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch((err) => console.error('SW registration failed', err));
      };
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register);
    }
  }, []);
  return null;
}
