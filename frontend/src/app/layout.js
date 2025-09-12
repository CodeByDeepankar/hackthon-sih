// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css'; // your global styles
import '@/student/styles/globals.css'; // student UI theme variables (bg/foreground, card, etc.)
import ThemeProvider from '@/components/ThemeProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { ToastProvider } from '@/components/ToastHub';

export const metadata = {
  title: 'Gamified Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/logo.png" />
        {/* Preload local app fonts (match @font-face in globals.css) */}
        <link rel="preload" href="/fonts/dcf3e686284c5e7eeca4f8e200392c01.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/dcf3e686284c5e7eeca4f8e200392c01.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <ClerkProvider>
          <ThemeProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <ConnectionStatus />
              <Header />
              <main>{children}</main>
              <Footer />
            </ToastProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
