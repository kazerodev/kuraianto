import { createContext, useContext, useState } from "react";
import { translations } from "../i18n";

const LangCtx = createContext(null);
const VALID = ["es", "en", "nl", "fr"];

function detectInitialLang() {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path === "/en" || path.startsWith("/en/")) return "en";
    if (path === "/nl" || path.startsWith("/nl/")) return "nl";
    if (path === "/fr" || path.startsWith("/fr/")) return "fr";
  }
  try {
    const stored = localStorage.getItem("kurai-lang");
    return VALID.includes(stored) ? stored : "es";
  } catch {
    return "es";
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  function setLang(code) {
    if (!VALID.includes(code)) return;
    setLangState(code);
    try { localStorage.setItem("kurai-lang", code); } catch {}
  }

  const t = translations[lang];
  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
