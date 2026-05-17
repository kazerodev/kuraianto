import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";

const STORAGE_KEY = "kurai_cookie_consent";

export default function CookieBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setShow(true), 1400);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
    if (window.fbq) { window.fbq("track", "PageView"); }
  };
  const decline = () => { localStorage.setItem(STORAGE_KEY, "declined"); setShow(false); };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-24 sm:bottom-0 left-0 right-0 z-[90] px-4 pb-4 sm:p-6 pointer-events-none"
      style={{ animation: "fadeInUp 0.4s ease both" }}
    >
      <div className="max-w-3xl mx-auto bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-2xl pointer-events-auto">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold mb-1">
            {t.cookie.title}
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            {t.cookie.desc}
            <a href="/politicas#cookies" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">
              {t.cookie.policy}
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-neutral-500 hover:text-neutral-300 text-xs font-medium transition-colors px-2 py-1.5"
          >
            {t.cookie.decline}
          </button>
          <button
            onClick={accept}
            className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors"
          >
            {t.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
