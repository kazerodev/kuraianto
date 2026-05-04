import { useState, useEffect, useRef } from "react";
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
  const { t, lang } = useLang();
  const serviceNames = t.services.items.map((s) => s.title);
  const extras = lang === "en"
    ? ["Free Demo", "From 490€", "No Contracts"]
    : ["Demo Gratis", "Desde 490€", "Sin Permanencias"];
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

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start gap-6 text-left py-5 bg-transparent border-0 p-0 cursor-pointer"
      >
        <span className="text-white font-medium text-sm leading-snug">{question}</span>
        <span
          className="text-neutral-500 text-xl leading-none mt-0.5 flex-shrink-0 inline-block transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div style={{ maxHeight: open ? "400px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <p className="pb-5 text-neutral-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

function ContactForm() {
  const { t, lang } = useLang();
  const f = t.contact.form;
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const parts = [lang === "en" ? `Hi, my name is ${nombre}.` : `Hola, me llamo ${nombre}.`];
    if (servicio) parts.push(lang === "en" ? `I'm interested in: ${servicio}.` : `Me interesa: ${servicio}.`);
    if (telefono) parts.push(lang === "en" ? `My phone is ${telefono}.` : `Mi teléfono es ${telefono}.`);
    if (mensaje) parts.push(mensaje);
    window.open(`${WA_BASE}?text=${encodeURIComponent(parts.join(" "))}`, "_blank");
  };

  const field = "w-full bg-neutral-900 text-sm text-white placeholder:text-neutral-600 px-4 py-3.5 rounded-xl outline-none transition-all focus:ring-2 focus:ring-orange-500 border border-neutral-800 focus:border-orange-500/50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="text" placeholder={f.name} value={nombre} onChange={(e) => setNombre(e.target.value)} required className={field} />
      <input type="tel" placeholder={f.phone} value={telefono} onChange={(e) => setTelefono(e.target.value)} className={field} />
      <select value={servicio} onChange={(e) => setServicio(e.target.value)} className={`${field} appearance-none cursor-pointer`}>
        <option value="">{f.service}</option>
        {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <textarea placeholder={f.msg_placeholder} value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} className={`${field} resize-none`} />
      <button
        type="submit"
        data-event="contact-submit"
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl text-sm transition-all hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20"
      >
        {f.submit}
      </button>
    </form>
  );
}

function Inicio() {
  const { lang, t } = useLang();

  return (
    <div className="bg-neutral-950 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "-5%", width: "900px", height: "900px", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 60%)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-15%", left: "-8%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 65%)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">

            {/* Left: headline */}
            <div className="lg:col-span-7">
              <div style={{ animation: "fadeIn 0.45s ease both" }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 mb-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-orange-400 text-xs font-semibold tracking-[0.15em] uppercase">{t.hero.badge}</span>
                </span>
              </div>

              <div style={{ animation: "fadeInUp 0.6s ease 0.1s both" }}>
                <h1 className="font-black text-white leading-[0.95] tracking-tight mb-7 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {t.hero.h1a}<br />
                  {t.hero.h1b}<br />
                  <span className="text-orange-500">{t.hero.h1c}</span>
                </h1>
              </div>

              <div style={{ animation: "fadeInUp 0.6s ease 0.2s both" }}>
                <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-xl">{t.hero.desc}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 mb-12" style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}>
                <a
                  href={wa(t.hero.demo_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="hero-demo"
                  className="group inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25"
                >
                  {t.hero.cta_demo}
                </a>
                <a
                  href="#planes"
                  data-event="hero-plans"
                  className="group inline-flex items-center justify-center gap-2 border border-white/15 text-white font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/5 hover:border-white/30"
                >
                  {t.hero.cta_plans}
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </a>
              </div>

              <div className="flex flex-wrap gap-x-7 gap-y-2.5 pt-8 border-t border-white/5" style={{ animation: "fadeInUp 0.6s ease 0.4s both" }}>
                {t.hero.trust.map((txt) => (
                  <span key={txt} className="text-neutral-500 text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
                    {txt}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: floating service card */}
            <div
              className="hidden lg:block lg:col-span-5"
              style={{ animation: "fadeInUp 0.7s ease 0.25s both" }}
            >
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8"
                style={{ animation: "floatCard 6s ease-in-out infinite" }}
              >
                <p className="text-orange-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6">{t.hero.card_label}</p>
                <div className="space-y-5">
                  {t.hero.card_items.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">{t.hero.card_sub}</p>
                    <a
                      href={wa(t.hero.demo_msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event="hero-demo-sidebar"
                      className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors"
                    >
                      {t.hero.card_cta}
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-xs mb-0.5">WhatsApp</p>
                    <p className="text-white text-sm font-semibold">{t.hero.phone}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <Marquee />

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section id="servicios" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.services.label}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mt-3 leading-tight max-w-lg">{t.services.title}</h2>
              </div>
              <a
                href={wa(t.services.cta_msg)}
                target="_blank"
                rel="noopener noreferrer"
                data-event="services-cta"
                className="group inline-flex items-center gap-2 text-neutral-500 font-medium text-sm border border-neutral-200 rounded-full px-5 py-2.5 hover:border-orange-300 hover:text-orange-500 transition-all whitespace-nowrap flex-shrink-0"
              >
                {t.services.cta}
                <span className="group-hover:translate-x-0.5 transition-transform duration-300 inline-block">→</span>
              </a>
            </div>
          </Reveal>

          <div className="border-t border-neutral-100">
            {t.services.items.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <div className="group relative py-8 lg:py-10 border-b border-neutral-100 flex gap-6 md:gap-10 items-start cursor-default hover:pl-3 transition-all duration-300">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  <span className="text-neutral-200 font-bold text-2xl leading-none tabular-nums flex-shrink-0 pt-0.5 group-hover:text-orange-200 transition-colors duration-300 w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-neutral-900 font-bold text-xl mb-2 leading-tight">{s.title}</h3>
                      <p className="text-neutral-500 text-sm leading-relaxed max-w-xl">{s.desc}</p>
                    </div>
                    <span className="text-neutral-300 text-2xl group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0 hidden sm:block">
                      →
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────── */}
      <section className="bg-neutral-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
            <Reveal className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.why.label}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">{t.why.title}</h2>
                <p className="text-neutral-400 mt-5 text-sm leading-relaxed max-w-xs">{t.why.desc}</p>
              </div>
            </Reveal>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.why.items.map((item, i) => (
                  <Reveal key={item.title} delay={i * 100}>
                    <div className="group border border-white/10 rounded-2xl p-7 hover:border-orange-500/25 hover:bg-white/[0.02] transition-all duration-300 h-full">
                      <div className="flex items-start justify-between mb-5">
                        <span className="text-white/10 font-black text-4xl leading-none tabular-nums select-none group-hover:text-orange-400/15 transition-colors duration-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 group-hover:bg-orange-400 transition-colors duration-300 mt-2 flex-shrink-0" />
                      </div>
                      <h3 className="text-white font-semibold mb-2 text-sm leading-snug">{item.title}</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ─────────────────────────────────────────── */}
      <section className="relative bg-orange-500 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-black/15 rounded-full px-3 py-1 mb-4 text-xs font-bold text-black/70 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
                {t.demo_bar.badge}
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-black leading-tight max-w-xl">{t.demo_bar.title}</h3>
              <p className="text-black/60 text-sm mt-2 max-w-lg">{t.demo_bar.desc}</p>
            </div>
            <a
              href={wa(t.demo_bar.msg)}
              target="_blank"
              rel="noopener noreferrer"
              data-event="demobar-cta"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-neutral-900 transition-all hover:-translate-y-0.5 hover:shadow-2xl whitespace-nowrap"
            >
              {t.demo_bar.cta} →
            </a>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-16">
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.process.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mt-3 leading-tight">{t.process.title}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {t.process.steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="relative">
                  <div className="text-[5.5rem] font-black text-orange-100 leading-none select-none mb-3 -ml-1 tabular-nums">{step.num}</div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute right-0 top-10 translate-x-full px-4 text-neutral-200 text-2xl items-center">→</div>
                  )}
                  <h3 className="font-bold text-neutral-900 text-lg mb-2 leading-snug">{step.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300} className="mt-16 text-center">
            <a
              href={wa(t.process.cta_msg)}
              target="_blank"
              rel="noopener noreferrer"
              data-event="process-cta"
              className="group inline-flex items-center gap-3 bg-neutral-900 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-neutral-900/20"
            >
              {t.process.cta}
              <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── CLIENTS ──────────────────────────────────────────── */}
      <section id="clientes" className="bg-neutral-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-14">
            <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.clients.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mt-3 leading-tight">{t.clients.title}</h2>
            <p className="text-neutral-500 mt-3 text-sm">{t.clients.desc}</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.clients.items.map((client, i) => (
              <Reveal key={client.name} delay={i * 80}>
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col h-full hover:border-neutral-300 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 relative overflow-hidden"
                >
                  <span className="absolute -bottom-4 -right-2 text-[100px] font-black text-neutral-50 leading-none select-none pointer-events-none group-hover:text-orange-50 transition-colors duration-500 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex justify-end mb-7">
                    <div className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 text-base group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all duration-300">
                      ↗
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <h3 className="font-bold text-neutral-900 text-xl mb-1">{client.name}</h3>
                    <p className="text-neutral-400 text-xs font-mono tracking-tight mb-4">{client.url.replace("https://", "")}</p>
                    <p className="text-neutral-500 text-sm leading-relaxed">{client.desc}</p>
                  </div>
                  <div className="relative mt-6 pt-5 border-t border-neutral-100">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 group-hover:gap-3 transition-all duration-300">
                      {t.clients.visit} →
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="planes" className="bg-neutral-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-16">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.pricing.label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">{t.pricing.title}</h2>
            <p className="text-neutral-400 mt-4 text-sm leading-relaxed max-w-md">{t.pricing.desc}</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {t.pricing.plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80} className="flex">
                <div
                  className={`relative w-full rounded-2xl p-8 flex flex-col transition-all duration-500 ${plan.popular ? "" : "border border-white/10 hover:border-white/20"}`}
                  style={plan.popular ? {
                    border: "1px solid rgba(249,115,22,0.4)",
                    background: "rgba(249,115,22,0.04)",
                    boxShadow: "0 0 60px rgba(249,115,22,0.1)",
                  } : {}}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-t-2xl" />
                  )}
                  <div className="mb-6">
                    {plan.popular ? (
                      <div className="inline-flex items-center gap-1.5 bg-orange-500/15 rounded-full px-3 py-1 mb-4 w-fit">
                        <span className="w-1 h-1 rounded-full bg-orange-400" />
                        <span className="text-orange-400 text-xs font-semibold tracking-wide">{t.pricing.popular}</span>
                      </div>
                    ) : (
                      <div className="h-7 mb-4" />
                    )}
                    <h3 className="font-bold text-white text-xl mb-4">{plan.name}</h3>
                    <div className="text-4xl font-black text-white mb-1">{plan.price}</div>
                    <p className="text-neutral-500 text-xs">{t.pricing.once}</p>
                  </div>
                  <ul className="space-y-3 flex-1 text-sm border-t border-white/10 pt-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 ${plan.popular ? "text-neutral-300" : "text-neutral-400"}`}>
                        <span className="text-orange-400 text-xs mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2.5 mt-8">
                    <a
                      href={plan.stripe}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event={`stripe-${plan.name.toLowerCase().replace("web ", "")}`}
                      className={`block text-center font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 ${plan.popular ? "bg-orange-500 text-white hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/25" : "bg-white text-neutral-900 hover:bg-neutral-100"}`}
                    >
                      {t.pricing.cta_reserve}
                    </a>
                    <a
                      href={wa(plan.demo_msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event={`demo-${plan.name.toLowerCase().replace("web ", "")}`}
                      className={`block text-center font-medium py-3 rounded-xl text-sm transition-all ${plan.popular ? "border border-orange-500/30 text-orange-400 hover:bg-orange-500/10" : "border border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                    >
                      {t.pricing.cta_demo}
                    </a>
                    <a
                      href={wa(plan.wa_msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event={`wa-${plan.name.toLowerCase().replace("web ", "")}`}
                      className="block text-center text-neutral-600 hover:text-neutral-400 font-medium py-2 text-sm transition-colors"
                    >
                      {t.pricing.cta_wa}
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-sm text-neutral-500 mb-5">
              <span className="text-white font-semibold">{t.pricing.deposit_label}: </span>
              {t.pricing.deposit_note}
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="rounded-xl border border-white/8 bg-white/[0.01] p-7">
              <h3 className="font-semibold text-white mb-5 text-sm tracking-wide">{t.pricing.other_title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {t.pricing.other.map((s) => (
                  <div key={s.name} className="border border-white/5 rounded-xl p-4 hover:border-orange-500/20 hover:bg-white/[0.02] transition-all duration-200 cursor-default">
                    <div className="font-semibold text-white text-sm leading-snug">{s.name}</div>
                    <div className="text-orange-400/70 text-xs mt-1.5 font-medium">{s.price}</div>
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 text-xs mt-5">{t.pricing.other_note}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="bg-neutral-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{t.faq.label}</span>
                <h2 className="text-4xl font-bold text-white mt-3 mb-5 leading-tight">{t.faq.title}</h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-7">{t.faq.desc}</p>
                <a
                  href={wa(t.faq.cta_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  {t.faq.cta}
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </a>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={100}>
              <div className="bg-neutral-950 rounded-2xl px-8 py-2 border border-white/5">
                {t.faq.items.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contacto" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
            <Reveal className="lg:col-span-5">
              <div>
                <span className="text-orange-500 text-xs font-semibold tracking-widest uppercase">{t.contact.label}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mt-3 mb-6 leading-tight">{t.contact.title}</h2>
                <p className="text-neutral-500 leading-relaxed mb-8 text-sm">{t.contact.desc}</p>
                <div className="space-y-5 mb-10">
                  {t.contact.points.map((item) => (
                    <div key={item.t} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-900 font-semibold text-sm leading-snug">{item.t}</p>
                        <p className="text-neutral-400 text-sm mt-0.5">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-8 border-t border-neutral-100">
                  <p className="text-neutral-400 text-sm mb-2">{t.contact.direct}</p>
                  <a
                    href={WA_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="contact-wa-direct"
                    className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:text-green-700 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t.contact.wa_label}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={150}>
              <div className="bg-neutral-950 rounded-2xl p-8 lg:p-10 border border-white/10">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative bg-neutral-950 py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(249,115,22,0.1) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
                  {lang === "es" ? "Siguiente paso" : "Next step"}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">{t.cta_final.title}</h2>
              <p className="text-neutral-400 text-base mb-12 max-w-md mx-auto leading-relaxed">{t.cta_final.desc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={wa(t.cta_final.demo_msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="final-demo"
                  className="inline-flex items-center justify-center bg-orange-500 text-white font-bold px-10 py-4 rounded-full text-sm hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 transition-all"
                >
                  {t.cta_final.cta_demo}
                </a>
                <a
                  href="#planes"
                  className="inline-flex items-center justify-center border border-white/20 text-white font-semibold px-10 py-4 rounded-full text-sm hover:bg-white/5 hover:border-white/30 transition-all"
                >
                  {t.cta_final.cta_plans}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FLOATING WA ──────────────────────────────────────── */}
      <a
        href={WA_BASE}
        target="_blank"
        rel="noopener noreferrer"
        data-event="wa-float"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-5 z-50 inline-flex items-center gap-2 bg-green-500 text-white font-bold px-5 py-3 rounded-full shadow-2xl text-sm transition-all hover:bg-green-400 hover:-translate-y-0.5 hover:shadow-green-500/40"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>

    </div>
  );
}

export default Inicio;
