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
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-200"
      >
        <span className="text-orange-400 font-semibold">{current.short}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7L1.5 3.5h7L5 7z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/70 z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                l.code === lang
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`text-xs font-bold w-6 ${l.code === lang ? "text-orange-400" : "text-neutral-500"}`}>
                {l.short}
              </span>
              <span className="font-medium">{l.label}</span>
              {l.code === lang && (
                <svg className="ml-auto w-3.5 h-3.5 text-orange-500 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="pt-5 border-t border-white/[0.06]">
      <p className="text-neutral-600 text-xs font-semibold tracking-widest uppercase mb-3">
        {langLabel}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 ${
              l.code === lang
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
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
const LANG_PATHS = { es: "/", en: "/en", nl: "/nl", fr: "/fr" };

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/" || location.pathname === "/en" || location.pathname === "/nl" || location.pathname === "/fr";

  function handleSetLang(code) {
    setLang(code);
    navigate(LANG_PATHS[code] || "/");
  }

  const homeBase = LANG_PATHS[lang] || "/";
  const links = [
    { href: isHome ? "#planes"   : `${homeBase}#planes`,   label: t.nav.plans   },
    { href: isHome ? "#clientes" : `${homeBase}#clientes`, label: t.nav.clients },
    { href: isHome ? "#faq"      : `${homeBase}#faq`,      label: t.nav.faq     },
    { href: isHome ? "#contacto" : `${homeBase}#contacto`, label: t.nav.contact },
  ];

  const stripeStarter = t.pricing?.plans?.[0]?.stripe || "https://buy.stripe.com/9B69AM04B4kQ9aca4Nc7u09";
  const trackStripeClick = () => {
    if (window.fbq) window.fbq("track", "InitiateCheckout", { value: 349, currency: "EUR", content_name: "Web Starter", content_ids: ["starter"] });
    if (window.dataLayer) window.dataLayer.push({ event: "initiate_checkout", plan: "starter", value: 349 });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-white/[0.06]">

      {/* ── Desktop bar ─────────────────── */}
      <div className="hidden md:grid max-w-7xl mx-auto px-8 h-[72px]"
        style={{ gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "2rem" }}
      >
        {/* Left — logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-[1.45rem] font-black tracking-tight leading-none select-none">
            <span className="text-white">Kurai</span><span className="text-orange-500">anto</span>
          </span>
        </Link>

        {/* Center — nav links */}
        <div className="flex items-center justify-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative group px-4 py-2 text-[13.5px] font-medium text-neutral-400 hover:text-white transition-colors duration-200 rounded-md"
            >
              {l.label}
              <span className="absolute bottom-1 left-4 right-4 h-px bg-orange-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-250 ease-out" />
            </a>
          ))}
        </div>

        {/* Right — lang + CTA */}
        <div className="flex items-center gap-3">
          <LangDropdown lang={lang} setLang={handleSetLang} />
          <div className="w-px h-4 bg-white/[0.1]" />
          <a
            href={stripeStarter}
            target="_blank"
            rel="noopener noreferrer"
            data-event="nav-stripe-cta"
            onClick={trackStripeClick}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white text-[13.5px] font-bold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-md shadow-orange-500/20 whitespace-nowrap"
          >
            {t.nav.cta_demo}
          </a>
        </div>
      </div>

      {/* ── Mobile bar ──────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 h-[64px]">
        {/* Logo */}
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <span className="text-[1.35rem] font-black tracking-tight leading-none select-none">
            <span className="text-white">Kurai</span><span className="text-orange-500">anto</span>
          </span>
        </Link>

        {/* Right: lang switcher + hamburger */}
        <div className="flex items-center gap-1">
          <LangDropdown lang={lang} setLang={handleSetLang} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.nav.menu_close : t.nav.menu_open}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200 ml-1"
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
        <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0a] shadow-2xl shadow-black/60">
          <div className="px-5 py-2">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between py-4 text-[15px] font-medium text-neutral-300 hover:text-white transition-colors duration-150 ${
                  i < links.length - 1 ? "border-b border-white/[0.05]" : ""
                }`}
              >
                <span>{l.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
          <div className="px-5 pb-6 space-y-4">
            <a
              href={stripeStarter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { setMobileOpen(false); trackStripeClick(); }}
              data-event="nav-mobile-stripe-cta"
              className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-[14px] py-4 rounded-xl transition-colors duration-200 shadow-lg shadow-orange-500/20"
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
