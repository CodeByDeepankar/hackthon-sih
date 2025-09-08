// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css'; // your global styles

export const metadata = {
  title: 'Gamified Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
