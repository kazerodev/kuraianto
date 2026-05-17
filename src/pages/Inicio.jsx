import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LangContext";

const WA_BASE = "https://wa.me/32485251110";
const wa = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "none" : "translateY(22px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Marquee() {
  const { t } = useLang();
  const serviceNames = t.services.items.map((s) => s.title);
  const extras = t.hero.trust;
  const doubled = [...serviceNames, ...extras, ...serviceNames, ...extras];
  return (
    <div className="overflow-hidden bg-orange-500 py-3.5 select-none" aria-hidden="true">
      <div
        style={{
          display: "inline-flex",
          animation: "marquee 40s linear infinite",
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-5 text-[11px] font-bold text-black/60 uppercase tracking-[0.18em]"
          >
            {item}
            <span className="w-1 h-1 rounded-full bg-black/25 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

function MobileCtaBar() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 380);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        transform: show ? "translateY(0)" : "translateY(100%)",
        opacity: show ? 1 : 0,
        transition: "transform 0.32s ease, opacity 0.32s ease",
      }}
    >
      <div className="px-3 pb-4 pt-3 bg-[#080808]/97 backdrop-blur-md border-t border-white/[0.08]">
        <a
          href={wa(t.hero.demo_msg)}
          target="_blank"
          rel="noopener noreferrer"
          data-event="mobile-cta-bar"
          className="flex items-center justify-center gap-2.5 w-full font-bold py-4 rounded-xl text-sm text-white"
          style={{ background: "#22c55e", boxShadow: "0 4px 20px rgba(34,197,94,0.40)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t.pricing.cta_wa}
        </a>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b last:border-0 transition-colors duration-300 ${open ? "border-orange-500/15" : "border-white/[0.07]"}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start gap-5 text-left py-5 bg-transparent border-0 p-0 cursor-pointer group"
      >
        <span className={`font-medium text-sm leading-snug transition-colors duration-200 ${open ? "text-white" : "text-neutral-300 group-hover:text-white"}`}>
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
            open
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-white/15 text-neutral-500 group-hover:border-orange-500/50 group-hover:text-orange-400"
          }`}
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? "500px" : "0", overflow: "hidden", transition: "max-height 0.38s ease" }}>
        <p className="pb-5 text-neutral-400 text-sm leading-relaxed pr-10">{answer}</p>
      </div>
    </div>
  );
}

function ContactForm() {
  const { t, lang } = useLang();
  const f = t.contact.form;
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [servicio, setServicio] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const intro = { es: `Hola, me llamo ${nombre}.`, en: `Hi, my name is ${nombre}.`, nl: `Hallo, mijn naam is ${nombre}.`, fr: `Bonjour, je m'appelle ${nombre}.` };
    const interestLine = { es: `Me interesa: ${servicio}.`, en: `I'm interested in: ${servicio}.`, nl: `Ik ben geïnteresseerd in: ${servicio}.`, fr: `Je suis intéressé par : ${servicio}.` };
    const contactoLine = { es: `Teléfono/email: ${contacto}.`, en: `Phone/email: ${contacto}.`, nl: `Telefoon/e-mail: ${contacto}.`, fr: `Téléphone/e-mail : ${contacto}.` };
    const parts = [intro[lang] || intro.en];
    if (servicio) parts.push(interestLine[lang] || interestLine.en);
    if (contacto) parts.push(contactoLine[lang] || contactoLine.en);
    if (mensaje) parts.push(mensaje);
    window.open(`${WA_BASE}?text=${encodeURIComponent(parts.join(" "))}`, "_blank");
  };

  const field = "w-full bg-[#0d0d0d] text-sm text-white placeholder:text-neutral-600 px-4 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-orange-500/50 border border-white/[0.08] focus:border-orange-500/40";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <input type="text" placeholder={f.name} value={nombre} onChange={(e) => setNombre(e.target.value)} required className={field} />
      <input type="text" placeholder={f.phone} value={contacto} onChange={(e) => setContacto(e.target.value)} className={field} />
      <select value={servicio} onChange={(e) => setServicio(e.target.value)} className={`${field} appearance-none cursor-pointer`}>
        <option value="">{f.service}</option>
        {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <textarea placeholder={f.msg_placeholder} value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={3} className={`${field} resize-none`} />
      <button
        type="submit"
        data-event="contact-submit"
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl text-sm transition-all hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 mt-0.5"
      >
        {f.submit}
      </button>
    </form>
  );
}

function Inicio() {
  const { lang, t } = useLang();

  const metaTitle = t.meta.home_title;
  const metaDesc = t.meta.home_desc;

  return (
    <div className="bg-neutral-950 overflow-x-hidden pb-20 md:pb-0">
      <Helmet>
        <html lang={lang} />
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href="https://kuraianto.com/" />
        <link rel="alternate" hreflang="es" href="https://kuraianto.com/" />
        <link rel="alternate" hreflang="en" href="https://kuraianto.com/" />
        <link rel="alternate" hreflang="nl" href="https://kuraianto.com/" />
        <link rel="alternate" hreflang="fr" href="https://kuraianto.com/" />
        <link rel="alternate" hreflang="x-default" href="https://kuraianto.com/" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content="https://kuraianto.com/" />
        <meta property="og:image" content="https://kuraianto.com/og-image.png" />
        <meta property="og:locale" content={lang === "es" ? "es_ES" : lang === "en" ? "en_GB" : lang === "nl" ? "nl_BE" : "fr_BE"} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": t.faq.items.map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          }))
        })}</script>
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-10%", width: "800px", height: "800px", background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-20%", left: "-10%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.5), transparent)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-10 py-16 sm:py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">

            {/* Left: headline */}
            <div className="lg:col-span-7">
              <div style={{ animation: "fadeIn 0.45s ease both" }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-px bg-orange-500" />
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-orange-400 text-xs font-semibold tracking-[0.18em] uppercase">{t.hero.badge}</span>
                  </span>
                </div>
              </div>

              <div style={{ animation: "fadeInUp 0.6s ease 0.1s both" }}>
                <h1 className="font-black text-white leading-[0.93] tracking-tight mb-6 text-[1.85rem] min-[420px]:text-[2.3rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {t.hero.h1a}<br />
                  {t.hero.h1b}<br />
                  <span className="text-orange-500">{t.hero.h1c}</span>
                </h1>
              </div>

              <div style={{ animation: "fadeInUp 0.6s ease 0.2s both" }}>
                <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">{t.hero.desc}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-10" style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}>
                <a
                  href="#planes"
                  data-event="hero-cta-plans"
                  className="group inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 w-full sm:w-auto"
                >
                  {t.hero.cta_demo}
                </a>
                <a
                  href={wa(t.hero.demo_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="hero-wa"
                  className="group inline-flex items-center justify-center gap-2 border border-white/15 text-white font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/5 hover:border-white/30 w-full sm:w-auto"
                >
                  {t.hero.cta_plans}
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </a>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-7 border-t border-white/5" style={{ animation: "fadeInUp 0.6s ease 0.4s both" }}>
                {t.hero.trust.map((txt) => (
                  <span key={txt} className="text-neutral-500 text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
                    {txt}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: plans panel — desktop only */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#0d0d0d" }}>
                <div className="px-6 py-4" style={{ background: "rgba(249,115,22,0.07)", borderBottom: "1px solid rgba(249,115,22,0.12)" }}>
                  <span className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.22em]">{t.hero.card_label}</span>
                </div>
                <div className="grid grid-cols-2" style={{ gap: "1px", background: "rgba(255,255,255,0.05)" }}>
                  {t.hero.card_items.map((item, i) => {
                    const [price, tag] = item.detail.split(" · ");
                    return (
                      <div key={item.title} className="flex flex-col p-6" style={{ background: "#0d0d0d" }}>
                        <span className="text-[11px] font-black tabular-nums mb-3" style={{ color: "rgba(249,115,22,0.5)" }}>0{i + 1}</span>
                        <p className="text-white font-bold text-[14px] leading-snug mb-2">{item.title}</p>
                        <p className="text-orange-400 text-xs font-bold">{price}</p>
                        {tag && <p className="text-neutral-600 text-[11px] mt-1.5 leading-snug">{tag}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="px-6 py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-neutral-500 text-xs mb-4">{t.hero.card_sub}</p>
                  <a
                    href="#planes"
                    data-event="hero-card-cta"
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-[13px] py-4 rounded-xl transition-colors duration-200"
                    style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.25)" }}
                  >
                    {t.hero.card_cta}
                  </a>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-neutral-600 text-[11px]">WhatsApp</span>
                    <span className="text-neutral-700 text-[11px]">·</span>
                    <span className="text-neutral-300 text-[11px] font-semibold">{t.hero.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile phone strip */}
            <div className="lg:hidden col-span-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e" className="flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-white font-semibold text-sm">{t.hero.phone}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-500 text-xs">Respuesta hoy</span>
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <Marquee />

      {/* ── ANTES / DESPUÉS ──────────────────────────────────── */}
      <section className="bg-neutral-950 py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-10 text-center">
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.antes_despues.label}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight">
              {t.antes_despues.title}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Reveal>
              <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6 sm:p-7 h-full">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-red-500/60 flex-shrink-0" />
                  <span className="text-red-400/80 text-xs font-bold uppercase tracking-widest">{t.antes_despues.bad_label}</span>
                </div>
                <ul className="space-y-3">
                  {t.antes_despues.bad_items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-neutral-500 text-sm">
                      <span className="text-red-500/50 flex-shrink-0 mt-0.5 font-bold">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-6 sm:p-7 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">{t.antes_despues.good_label}</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {t.antes_despues.good_items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-neutral-300 text-sm">
                      <span className="text-orange-500 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#planes"
                  data-event="antes-despues-cta"
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 w-full"
                >
                  {t.antes_despues.cta}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="planes" className="bg-neutral-950 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">

          <Reveal className="mb-4">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.pricing.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">{t.pricing.title}</h2>
            <p className="text-neutral-400 mt-4 text-sm leading-relaxed max-w-md">{t.pricing.desc}</p>
          </Reveal>

          <Reveal className="mb-12">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {t.pricing.trust_bar.split(" · ").map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-neutral-500 text-xs">
                  <span className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {t.pricing.plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 80} className="flex">
                <div
                  className="relative w-full rounded-2xl flex flex-col overflow-hidden"
                  style={plan.popular ? {
                    border: "1px solid rgba(249,115,22,0.32)",
                    background: "linear-gradient(160deg, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.02) 45%, #0d0d0d 100%)",
                    boxShadow: "0 0 48px rgba(249,115,22,0.07)",
                  } : {
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "#0d0d0d",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
                  )}

                  <div className="px-6 sm:px-7 pt-7 pb-5">
                    {plan.popular ? (
                      <div className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-orange-400 text-[11px] font-semibold tracking-wide">{t.pricing.popular}</span>
                      </div>
                    ) : (
                      <div className="h-7 mb-0" />
                    )}
                    <h3 className="font-bold text-white text-xl mb-2">{plan.name}</h3>
                    <p className="text-neutral-500 text-xs leading-relaxed mb-5 min-h-[2.8rem]">{plan.tagline}</p>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                    </div>
                    <p className="text-neutral-600 text-xs">{t.pricing.once}</p>
                  </div>

                  <div className="px-6 sm:px-7 pb-5 flex-1 border-t border-white/[0.06] pt-5">
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-neutral-400">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                            <circle cx="7" cy="7" r="5.5" stroke="rgba(249,115,22,0.35)" strokeWidth="1"/>
                            <path d="M4.5 7l2 2 3-3.5" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-6 sm:px-7 pb-7 pt-4">
                    <a
                      href={wa(plan.wa_msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event={`plan-wa-${plan.id}`}
                      className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-full text-sm transition-all duration-200 hover:-translate-y-0.5 ${plan.popular ? "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35" : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/40"}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t.pricing.cta_wa} — {plan.price}
                    </a>
                    <p className="text-center text-neutral-600 text-[11px] mt-2">{t.pricing.cta_wa_text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Guarantee strip */}
          <Reveal delay={160} className="mb-8">
            <div className="rounded-2xl border border-green-500/15 bg-green-500/[0.04] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest flex-shrink-0">{t.pricing.guarantee_title}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                {t.pricing.guarantee_items.map((item) => (
                  <span key={item} className="flex items-center gap-2 text-neutral-400 text-xs">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                      <circle cx="7" cy="7" r="5.5" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
                      <path d="M4.5 7l2 2 3-3.5" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 pt-10 border-t border-white/[0.06]">
              <div className="mb-10">
                <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase mb-3 block">{t.pricing.other_title}</span>
                <h3 className="text-white text-2xl md:text-3xl font-bold leading-snug mb-3">{t.pricing.other_section_title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{t.pricing.other_section_subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {t.pricing.other_categories.map((cat, ci) => (
                  <div key={ci} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.02]">
                      <div className="w-1 h-4 bg-orange-500 rounded-full flex-shrink-0" />
                      <span className="text-white text-sm font-bold tracking-wide">{cat.label}</span>
                    </div>
                    <div className="flex flex-col divide-y divide-white/[0.04] flex-1">
                      {cat.items.map((s) => (
                        <div key={s.name} className="px-6 py-5 group hover:bg-orange-500/[0.04] transition-colors duration-200 cursor-default">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <span className="text-white font-semibold text-sm leading-snug">{s.name}</span>
                            <span className="text-orange-400 text-xs font-bold whitespace-nowrap flex-shrink-0 mt-0.5 tabular-nums">{s.price}</span>
                          </div>
                          <p className="text-neutral-500 text-xs leading-relaxed">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-orange-500/[0.08] via-orange-500/[0.04] to-transparent border border-orange-500/20 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-white font-bold text-lg mb-1.5">{t.pricing.other_cta_question}</p>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-md">{t.pricing.other_cta_desc}</p>
                </div>
                <a
                  href={wa(t.pricing.other_wa_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="other-services-cta"
                  className="flex-shrink-0 inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-7 py-4 rounded-full transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 shadow-lg shadow-orange-500/20 w-full sm:w-auto justify-center"
                >
                  {t.pricing.other_cta_btn}
                  <span className="text-orange-200">→</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHATSAPP CTA BAR ─────────────────────────────────── */}
      <section className="relative bg-orange-500 py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(0,0,0,0.18) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at bottom left, rgba(234,88,12,0.5) 0%, transparent 55%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-black/15 rounded-full px-3 py-1 mb-4 text-xs font-bold text-black/70 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
                {t.demo_bar.badge}
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-black leading-tight max-w-xl">{t.demo_bar.title}</h3>
              <p className="text-black/60 text-sm mt-2 max-w-lg">{t.demo_bar.desc}</p>
              <p className="text-black/40 text-xs mt-3 font-medium">{t.demo_bar.subtext}</p>
            </div>
            <a
              href={wa(t.demo_bar.msg)}
              target="_blank"
              rel="noopener noreferrer"
              data-event="demobar-cta"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-neutral-900 transition-all hover:-translate-y-0.5 hover:shadow-2xl whitespace-nowrap w-full md:w-auto justify-center"
            >
              {t.demo_bar.cta} →
            </a>
          </div>
        </div>
      </section>

      {/* ── CLIENTS ──────────────────────────────────────────── */}
      <section id="clientes" className="bg-neutral-950 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">

          <Reveal className="mb-14">
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.clients.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">{t.clients.title}</h2>
            <p className="text-neutral-400 mt-3 text-sm max-w-lg">{t.clients.desc}</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.clients.items.map((client, i) => (
              <Reveal key={client.name} delay={i * 80}>
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event={`client-${client.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 flex flex-col h-full hover:border-orange-500/30 hover:bg-orange-500/[0.04] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-orange-400/70 text-[11px] font-mono tracking-tight leading-none truncate max-w-[160px]">
                      {client.url.replace("https://", "").replace(/\/$/, "")}
                    </span>
                    <span className="text-neutral-700 text-[11px] font-black tabular-nums flex-shrink-0 ml-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xl mb-3 leading-snug">{client.name}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1">{client.desc}</p>
                  <div className="mt-7 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 group-hover:text-orange-300 group-hover:gap-3 transition-all duration-200">
                      {t.clients.visit}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                        <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4.5M10.5 1.5V7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-600 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all duration-300 text-sm flex-shrink-0">
                      ↗
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-10">
            <div className="rounded-2xl border border-orange-500/20 p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.03) 60%, transparent 100%)" }}
            >
              <div>
                <p className="text-white font-bold text-lg mb-1.5">{t.clients.bottom_q}</p>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-md">{t.clients.bottom_desc}</p>
              </div>
              <a
                href={wa(t.cta_final.demo_msg)}
                target="_blank"
                rel="noopener noreferrer"
                data-event="clients-to-demo"
                className="flex-shrink-0 inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-7 py-4 rounded-full transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 shadow-lg shadow-orange-500/20 w-full sm:w-auto justify-center"
              >
                {t.clients.bottom_cta}
                <span>→</span>
              </a>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── CTA FINAL URGENCY ────────────────────────────────── */}
      <section className="relative bg-neutral-950 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(249,115,22,0.08) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-400 text-xs font-bold tracking-widest uppercase">{t.cta_final.badge}</span>
            </div>
            <p className="text-neutral-500 text-xs font-semibold tracking-widest uppercase mb-4">{t.cta_final.urgency}</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">{t.cta_final.title}</h2>
            <p className="text-neutral-400 text-sm leading-relaxed mb-10 max-w-lg mx-auto">{t.cta_final.desc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#planes"
                data-event="cta-final-plans"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 w-full sm:w-auto"
              >
                {t.pricing.cta_pay} →
              </a>
              <a
                href={wa(t.cta_final.demo_msg)}
                target="_blank"
                rel="noopener noreferrer"
                data-event="cta-final-wa"
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/[0.05] hover:border-white/30 w-full sm:w-auto"
              >
                {t.cta_final.cta_demo}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────── */}
      <section className="bg-neutral-900 py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">

            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.why.label}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">{t.why.title}</h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8">{t.why.desc}</p>
                <a
                  href={wa(t.why.cta_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="why-cta"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-3.5 rounded-full transition-colors duration-200 shadow-md shadow-orange-500/20 w-full sm:w-auto justify-center"
                >
                  {t.why.cta}
                  <span>→</span>
                </a>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-8" delay={100}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.why.items.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 hover:border-orange-500/25 hover:bg-orange-500/[0.04] transition-all duration-300 cursor-default"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[12px] font-black tabular-nums flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-[16px] mb-3 leading-snug">{item.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                    <div className="mt-6 h-px bg-white/[0.04] overflow-hidden rounded-full">
                      <div className="h-full bg-orange-500/40 w-0 group-hover:w-full transition-all duration-500 ease-out" />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section className="bg-neutral-950 py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-14">
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.process.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">{t.process.title}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.process.steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 flex flex-col h-full">
                  <div className="text-[4rem] font-black tabular-nums text-orange-500/50 leading-none mb-4">{step.num}</div>
                  <div className="w-10 h-0.5 bg-orange-500 mb-6" />
                  <h3 className="font-bold text-white text-lg mb-3 leading-snug">{step.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300} className="mt-12 text-center">
            <a
              href={wa(t.process.cta_msg)}
              target="_blank"
              rel="noopener noreferrer"
              data-event="process-cta"
              className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full text-sm transition-all duration-200 shadow-lg shadow-orange-500/25"
            >
              {t.process.cta}
              <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="bg-neutral-950 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">

            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8">
                  <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.faq.label}</span>
                  <h2 className="text-3xl font-bold text-white mt-3 mb-4 leading-tight">{t.faq.title}</h2>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-7">{t.faq.desc}</p>
                  <a
                    href={wa(t.faq.cta_msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="faq-ask-cta"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-3.5 rounded-full transition-colors duration-200 shadow-md shadow-orange-500/20 w-full justify-center"
                  >
                    {t.faq.cta}
                    <span>→</span>
                  </a>
                  <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/[0.06]">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.5"/>
                      <path d="M6.5 4v3L8 8.5" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8"/>
                    </svg>
                    <span className="text-neutral-500 text-xs">{t.faq.trust_note}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-8" delay={100}>
              <div className="rounded-2xl border border-white/[0.06] bg-neutral-900 px-7 py-2">
                {t.faq.items.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contacto" className="relative bg-neutral-900 py-24 overflow-hidden scroll-mt-20">
        <div className="absolute pointer-events-none bottom-0 right-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(ellipse at right bottom, rgba(249,115,22,0.05) 0%, transparent 65%)" }} />
        <div className="absolute pointer-events-none top-0 left-0 w-[400px] h-[400px]" style={{ background: "radial-gradient(ellipse at left top, rgba(249,115,22,0.03) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">

            <Reveal className="lg:col-span-5">
              <div>
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.contact.label}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4 leading-tight">{t.contact.title}</h2>
                <p className="text-neutral-400 leading-relaxed mb-10 text-sm">{t.contact.desc}</p>

                <div className="space-y-3.5 mb-10">
                  {t.contact.points.map((item) => (
                    <div key={item.t} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 3.5-4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-neutral-300 font-medium text-sm">{item.t}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/[0.06] space-y-3">
                  <p className="text-neutral-600 text-[11px] font-semibold tracking-widest uppercase mb-4">{t.contact.direct}</p>
                  <a
                    href="mailto:info@kuraianto.com"
                    data-event="contact-email"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center text-neutral-500 group-hover:border-orange-500/25 group-hover:text-orange-400 transition-all flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <span className="text-neutral-400 font-medium text-sm group-hover:text-white transition-colors">info@kuraianto.com</span>
                  </a>
                  <a
                    href={WA_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="contact-wa-direct"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center text-neutral-500 group-hover:border-green-500/30 group-hover:text-green-400 transition-all flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-neutral-400 font-medium text-sm group-hover:text-white transition-colors">{t.contact.wa_label}</span>
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={150}>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="absolute left-0 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-orange-500/40 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                <div className="p-7 sm:p-10">
                  <p className="text-white font-semibold text-sm mb-6 pl-4">{t.contact.form.header}</p>
                  <ContactForm />
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── FLOATING WA — desktop only ───────────────────────── */}
      <div className="hidden md:flex fixed bottom-6 right-5 z-50 flex-col items-end gap-2">
        <a
          href={WA_BASE}
          target="_blank"
          rel="noopener noreferrer"
          data-event="wa-float"
          aria-label="WhatsApp"
          className="relative inline-flex items-center gap-2 bg-green-500 text-white font-bold px-5 py-3 rounded-full shadow-2xl text-sm transition-all hover:bg-green-400 hover:-translate-y-0.5"
          style={{ boxShadow: "0 4px 24px rgba(34,197,94,0.45)" }}
        >
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20 pointer-events-none" />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* ── MOBILE STICKY CTA BAR ────────────────────────────── */}
      <MobileCtaBar />

    </div>
  );
}

export default Inicio;
