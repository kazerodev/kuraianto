import { createContext, useContext, useState } from "react";
import { translations } from "../i18n";

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("es");
  const t = translations[lang];
  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
