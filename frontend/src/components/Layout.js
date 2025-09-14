import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">GYANARATNA</h1>
        <nav className="space-x-4 hidden md:block">
          <Link href="/student-dashboard">Student</Link>
          <Link href="/teacher-dashboard">Teacher</Link>
        </nav>
      </header>

      {/* Offline notice */}
      {isOffline && (
        <div className="bg-yellow-400 text-black p-2 text-center">
          You are offline. Some features may be unavailable.
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        &copy; {new Date().getFullYear()} GYANARATNA
      </footer>
    </div>
  );
}
