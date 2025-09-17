"use client";
import { useEffect } from "react";

export default function PreHeader({ included = "en,as,bn,gu,hi,kn,ml,mr,ne,or,pa,sa,sd,ta,te,ur,ks,mai,brx,sat,doi" }) {
  useEffect(() => {
    // Inject Google Translate script once
    if (document.getElementById("google-translate-script")) return;
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=__gr_loadGoogleTranslate";
    window.__gr_loadGoogleTranslate = function () {
      // global google from injected script
      // @ts-ignore
      new google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: included, autoDisplay: false }, "google_element");
    };
    document.body.appendChild(script);
  }, [included]);

  // Aggressively hide Google top banner if it appears after a language is selected
  useEffect(() => {
    const hideBanner = () => {
      const iframe = document.querySelector('iframe.goog-te-banner-frame');
      if (iframe) {
        iframe.style.display = 'none';
        try { iframe.parentNode && iframe.parentNode.removeChild(iframe); } catch {}
      }
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        banner.style.display = 'none';
        try { banner.parentNode && banner.parentNode.removeChild(banner); } catch {}
      }
      const tt = document.getElementById('goog-gt-tt');
      if (tt) {
        tt.style.display = 'none';
        try { tt.parentNode && tt.parentNode.removeChild(tt); } catch {}
      }
      document.documentElement.style.top = '0px';
      document.body.style.top = '0px';
    };
    hideBanner();
    const mo = new MutationObserver(() => hideBanner());
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="translateHost inline-flex items-center">
      <div id="google_element" className="text-sm" />
      <style jsx global>{`
        /* Keep banner hidden to avoid layout shift */
        iframe.goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
        .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
        body { top: 0 !important; }
        html { top: 0 !important; }

        .translateHost .goog-te-gadget { font-size: 0; line-height: 0; margin: 0; }
        .translateHost .goog-te-gadget > span { display: none; }
  .goog-te-spinner-pos, .goog-te-spinner-animation { display: none !important; }
        .translateHost .goog-te-combo {
          font-size: 13px !important;
          line-height: 1 !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          border: 1px solid var(--border, #d1d5db) !important;
          min-width: 160px;
          outline: none !important;
          background: var(--input-background, #f3f4f6);
          color: var(--foreground, #111827);
        }
        :root.dark .translateHost .goog-te-combo {
          background: #0b0b0b;
          color: #f8fafc;
          border-color: #262626 !important;
        }
      `}</style>
    </div>
  );
}
