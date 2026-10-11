import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";

const WA_BASE = "https://wa.me/32485251110";

const LANGS = [
  { code: "es", short: "ES", label: "Español" },
  { code: "en", short: "EN", label: "English" },
  { code: "nl", short: "NL", label: "Nederlands" },
  { code: "fr", short: "FR", label: "Français" },
];

/* ── Language dropdown ─────────────────────────────────── */
function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 border border-transparent hover:border-stone-200 hover:bg-stone-100 transition-all duration-200"
      >
        <span className="text-stone-900 font-bold">{current.short}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={`text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7L1.5 3.5h7L5 7z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xl shadow-stone-900/10 z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                l.code === lang
                  ? "bg-orange-50 text-orange-700"
                  : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span className={`text-xs font-bold w-6 ${l.code === lang ? "text-orange-600" : "text-stone-400"}`}>
                {l.short}
              </span>
              <span className="font-medium">{l.label}</span>
              {l.code === lang && (
                <svg className="ml-auto w-3.5 h-3.5 text-orange-600 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile lang grid ──────────────────────────────────── */
function MobileLangGrid({ lang, setLang, langLabel }) {
  return (
    <div className="pt-5 border-t border-stone-200">
      <p className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-3">
        {langLabel}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 ${
              l.code === lang
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Navbar ────────────────────────────────────────────── */
const LANG_PATHS = { es: "/webs", en: "/en", nl: "/nl", fr: "/fr" };

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/webs" || location.pathname === "/en" || location.pathname === "/nl" || location.pathname === "/fr";

  function handleSetLang(code) {
    setLang(code);
    navigate(LANG_PATHS[code] || "/webs");
  }

  const homeBase = LANG_PATHS[lang] || "/webs";
  const links = [
    { href: isHome ? "#planes" : `${homeBase}#planes`, label: t.nav.plans },
    { href: isHome ? "#como-funciona" : `${homeBase}#como-funciona`, label: t.nav.how },
    { href: isHome ? "#clientes" : `${homeBase}#clientes`, label: t.nav.clients },
    { href: isHome ? "#faq" : `${homeBase}#faq`, label: t.nav.faq },
    { href: isHome ? "#contacto" : `${homeBase}#contacto`, label: t.nav.contact },
  ];
  const planesHref = isHome ? "#planes" : `${homeBase}#planes`;

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF9F6]/92 backdrop-blur-md border-b border-stone-200">

      {/* ── Desktop bar ─────────────────── */}
      <div className="hidden md:grid max-w-7xl mx-auto px-8 h-[72px]"
        style={{ gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "2rem" }}
      >
        {/* Left — logo */}
        <Link to={homeBase} className="flex-shrink-0">
          <span className="text-[1.45rem] font-black tracking-tight leading-none select-none">
            <span className="text-stone-900">Kuraianto</span>
          </span>
        </Link>

        {/* Center — nav links */}
        <div className="flex items-center justify-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative group px-4 py-2 text-[14px] font-semibold text-stone-600 hover:text-stone-900 transition-colors duration-200 rounded-md"
            >
              {l.label}
              <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-orange-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-250 ease-out" />
            </a>
          ))}
        </div>

        {/* Right — lang + CTA */}
        <div className="flex items-center gap-3">
          <LangDropdown lang={lang} setLang={handleSetLang} />
          <div className="w-px h-4 bg-stone-300" />
          <a
            href={planesHref}
            data-event="nav-cta-planes"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-[14px] font-bold px-5 py-2.5 rounded-xl transition-colors duration-200 whitespace-nowrap"
          >
            {t.nav.cta_demo}
          </a>
        </div>
      </div>

      {/* ── Mobile bar ──────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 h-[64px]">
        {/* Logo */}
        <Link to={homeBase} onClick={() => setMobileOpen(false)}>
          <span className="text-[1.35rem] font-black tracking-tight leading-none select-none">
            <span className="text-stone-900">Kuraianto</span>
          </span>
        </Link>

        {/* Right: lang switcher + hamburger */}
        <div className="flex items-center gap-1">
          <LangDropdown lang={lang} setLang={handleSetLang} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.nav.menu_close : t.nav.menu_open}
            className="w-10 h-10 flex items-center justify-center text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-all duration-200 ml-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ───────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white shadow-xl shadow-stone-900/10">
          <div className="px-5 py-2">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between py-4 text-[15px] font-semibold text-stone-800 hover:text-stone-900 transition-colors duration-150 ${
                  i < links.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <span>{l.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
          <div className="px-5 pb-6 space-y-4">
            <a
              href={planesHref}
              onClick={() => setMobileOpen(false)}
              data-event="nav-mobile-cta-planes"
              className="flex items-center justify-center w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-[14px] py-4 rounded-xl transition-colors duration-200"
            >
              {t.nav.cta_demo}
            </a>
            <MobileLangGrid lang={lang} setLang={handleSetLang} langLabel={t.nav.lang_label} />
          </div>
        </div>
      )}
    </nav>
  );
}
