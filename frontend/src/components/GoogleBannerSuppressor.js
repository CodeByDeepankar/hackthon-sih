"use client";
import { useEffect } from "react";

export default function GoogleBannerSuppressor({ intervalMs = 1500 }) {
  useEffect(() => {
    let mounted = true;
    const hide = () => {
      if (!mounted) return;
      try {
        const frame = document.querySelector('.goog-te-banner-frame.skiptranslate');
        if (frame) {
          frame.style.display = 'none';
          // Try removing entirely to avoid layout calculations
          try { frame.parentNode && frame.parentNode.removeChild(frame); } catch {}
        }
        const bar = document.querySelector('.goog-te-banner-frame');
        if (bar) {
          bar.style.display = 'none';
          try { bar.parentNode && bar.parentNode.removeChild(bar); } catch {}
        }
        // Tooltip / popup
        const tt = document.getElementById('goog-gt-tt');
        if (tt) { tt.style.display = 'none'; }
        // Reset any body top shift applied by Google script
        if (document.body && document.body.style.top && document.body.style.top !== '0px') {
          document.body.style.top = '0px';
        }
      } catch {}
    };
    hide();
    const id = setInterval(hide, intervalMs);
    return () => { mounted = false; clearInterval(id); };
  }, [intervalMs]);
  return null;
}
