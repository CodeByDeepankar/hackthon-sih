// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css'; // your global styles
import '@/student/styles/globals.css'; // student UI theme variables (bg/foreground, card, etc.)
import ThemeProvider from '@/components/ThemeProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PageTransition from '@/components/PageTransition';

export const metadata = {
  title: 'GYANARATNA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <ConnectionStatus />
            <Header />
            <main>
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
