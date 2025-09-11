"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((msg, opts={}) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, msg, type: opts.type || 'info', ttl: opts.ttl || 4000 }]);
  }, []);

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(ts => ts.filter(x => x.id !== t.id));
    }, t.ttl));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed z-50 bottom-4 right-4 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded shadow text-sm text-white animate-fade-in-up bg-${t.type==='success'?'green':'blue'}-600`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// small CSS animation (tailwind custom layer could be used; inline keyframes for minimalism)
if (typeof document !== 'undefined' && !document.getElementById('toast-anim-style')) {
  const style = document.createElement('style');
  style.id = 'toast-anim-style';
  style.textContent = `@keyframes fade-in-up{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}.animate-fade-in-up{animation:fade-in-up .25s ease-out}`;
  document.head.appendChild(style);
}
