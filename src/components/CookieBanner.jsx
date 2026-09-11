import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";
import {
  leerConsentimiento,
  guardarConsentimiento,
  cargarEtiquetas,
} from "../lib/consent";

export default function CookieBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const previo = leerConsentimiento();
    if (previo === "accepted") {
      cargarEtiquetas();
      return;
    }
    if (previo === "declined") return;
    const timer = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    guardarConsentimiento("accepted");
    setShow(false);
    cargarEtiquetas();
  };
  const decline = () => {
    guardarConsentimiento("declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-[4.5rem] sm:bottom-0 left-0 right-0 z-[90] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none"
      style={{ animation: "fadeInUp 0.4s ease both" }}
    >
      <div className="max-w-5xl mx-auto bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 shadow-2xl pointer-events-auto">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold mb-1">
            {t.cookie.title}
          </p>
          <p className="text-neutral-300 text-xs leading-relaxed">
            {t.cookie.desc}
            <a href="/politicas#cookies" className="text-orange-300 hover:text-orange-200 underline underline-offset-2 transition-colors">
              {t.cookie.policy}
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none">
          <button
            onClick={decline}
            className="border border-white/25 text-neutral-200 hover:border-white/50 hover:text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors"
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
