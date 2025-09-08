import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OfflineNotice from '@/components/OfflineNotice';

export const metadata = {
  title: 'Gamified STEM Learning',
  description: 'Offline-friendly learning app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <OfflineNotice />
        <main className="min-h-screen p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
