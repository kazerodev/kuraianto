import { createContext, useContext, useState } from "react";
import { translations } from "../i18n";

const LangCtx = createContext(null);
const VALID = ["es", "en", "nl", "fr"];

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem("kurai-lang");
      return VALID.includes(stored) ? stored : "es";
    } catch {
      return "es";
    }
  });

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
