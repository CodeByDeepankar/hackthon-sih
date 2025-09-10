// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css'; // your global styles
import ThemeProvider from '@/components/ThemeProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

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
      </head>
      <body className="min-h-screen flex flex-col">
        <ClerkProvider>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <ConnectionStatus />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
