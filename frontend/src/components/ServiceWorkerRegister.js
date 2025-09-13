"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Handle chunk load errors gracefully
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Loading chunk')) {
        console.warn('Chunk load error detected, attempting recovery');
        // Give user option to reload
        if (confirm('A resource failed to load. Would you like to refresh the page?')) {
          window.location.reload();
        }
        event.preventDefault();
      }
    });
    
    // Handle unhandled promise rejections from dynamic imports
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Loading chunk')) {
        console.warn('Dynamic import error:', event.reason);
        event.preventDefault();
      }
    });
    
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope);
            
            // Listen for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New SW version available');
                }
              });
            });

            // After activation, warm-cache critical routes and assets
            const warmList = [
              '/',
              '/student',
              '/student/challenges',
              '/student/achievements',
              '/student/courses',
              '/student/study-buddy',
              '/subjects',
              '/teacher',
              '/teacher/students',
              '/teacher/classes',
              '/teacher/reports',
              '/progress',
              '/fonts/KFOmCnqEu92Fr1Mu4mxK.woff2',
              '/logo.png',
              '/manifest.json',
              // PWA icons (standard + maskable)
              '/icons/icon-192.png',
              '/icons/icon-192-maskable.png',
              '/icons/icon-256.png',
              '/icons/icon-256-maskable.png',
              '/icons/icon-384.png',
              '/icons/icon-384-maskable.png',
              '/icons/icon-512.png',
              '/icons/icon-512-maskable.png'
            ];
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'warm-cache', urls: warmList });
            } else {
              // If no controller yet, wait briefly and try again
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'warm-cache', urls: warmList });
                }
              });
            }
          })
          .catch((err) => console.error('SW registration failed', err));
      };
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register);
    }

    // Listen for SW messages (queue flush/data updated)
    const onMessage = (event) => {
      const msg = event.data;
      if (!msg) return;
      if (msg.type === 'queue-flushed') {
        console.log(`Offline queue flushed: ${msg.flushed}`);
      }
      if (msg.type === 'data-updated') {
        console.log('Data updated from network:', msg.key);
      }
    };
    navigator.serviceWorker?.addEventListener?.('message', onMessage);

    // When coming online, ask SW to flush queue
    const onOnline = () => {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'flush-queue' });
      }
    };
    window.addEventListener('online', onOnline);

    return () => {
      navigator.serviceWorker?.removeEventListener?.('message', onMessage);
      window.removeEventListener('online', onOnline);
    };
  }, []);
  return null;
}
