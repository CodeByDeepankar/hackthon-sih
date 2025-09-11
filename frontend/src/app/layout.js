// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css'; // your global styles
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'Gamified Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ThemeProvider>
            <ConnectionStatus />
            <Header />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
