// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css'; // your global styles
import '@/student/styles/globals.css'; // student UI theme variables (bg/foreground, card, etc.)
import ThemeProvider from '@/components/ThemeProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PageTransition from '@/components/PageTransition';
import GoogleBannerSuppressor from '@/components/GoogleBannerSuppressor';

export const metadata = {
  title: 'GYANARATNA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
  <link rel="icon" href="/icons/icon-192.png" />
        {/* Hide Google Translate top banner/balloon early to avoid flicker */}
        <style>{`
          .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
          iframe.goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
          .goog-te-balloon-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
        `}</style>
        <Script id="gt-hide-banner" strategy="afterInteractive">
          {`
            (function(){
              var hide = function(){
                try {
                  var iframe = document.querySelector('iframe.goog-te-banner-frame');
                  if (iframe) { iframe.style.display='none'; iframe.parentNode && iframe.parentNode.removeChild(iframe); }
                  var bar = document.querySelector('.goog-te-banner-frame');
                  if (bar) { bar.style.display='none'; bar.parentNode && bar.parentNode.removeChild(bar); }
                  var tt = document.getElementById('goog-gt-tt');
                  if (tt) { tt.style.display='none'; tt.parentNode && tt.parentNode.removeChild(tt); }
                } catch(e){}
              };
              hide();
              var mo = new MutationObserver(hide);
              mo.observe(document.documentElement, {childList:true, subtree:true});
            })();
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <ClerkProvider {...(publishableKey ? { publishableKey } : {})}>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <GoogleBannerSuppressor />
            <ConnectionStatus />
            <Header />
            <main className="flex-grow">
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
