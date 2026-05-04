import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../context/LangContext";

const WA_BASE = "https://wa.me/32485251110";

function Logo() {
  return (
    <span className="font-black text-xl tracking-tight select-none">
      <span className="text-white">Kurai</span><span className="text-orange-500">anto</span>
    </span>
  );
}

function Navbar() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const links = [
    { href: isHome ? "#servicios" : "/#servicios", label: t.nav.services },
    { href: isHome ? "#planes" : "/#planes", label: t.nav.plans },
    { href: isHome ? "#clientes" : "/#clientes", label: t.nav.clients },
    { href: isHome ? "#faq" : "/#faq", label: t.nav.faq },
    { href: isHome ? "#contacto" : "/#contacto", label: t.nav.contact },
  ];

  return (
    <nav className="relative bg-neutral-950/95 backdrop-blur-sm border-b border-white/5 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-neutral-400 hover:text-white text-sm font-medium transition-colors">
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-xs font-semibold text-neutral-500 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded px-2.5 py-1 transition-all"
          >
            {t.nav.lang}
          </button>
          <a
            href={WA_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-green-400 transition-colors"
          >
            {t.nav.whatsapp}
          </a>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-xs font-semibold text-neutral-500 border border-neutral-700 rounded px-2 py-1"
          >
            {t.nav.lang}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-white p-1.5 rounded"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-neutral-950 border-t border-white/10 px-6 py-5 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white font-medium text-base py-3 border-b border-white/5 last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href={WA_BASE}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-3 bg-green-500 text-white text-sm font-semibold py-3 rounded-full text-center hover:bg-green-400 transition-colors"
          >
            {t.nav.whatsapp}
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
