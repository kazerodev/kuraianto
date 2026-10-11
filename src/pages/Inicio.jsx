import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LangContext";

const WA_BASE = "https://wa.me/32485251110";
const wa = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;
const VALORES = { starter: 349, pro: 649, marketing: 1099 };

function trackCheckout(plan) {
  if (window.fbq) window.fbq("track", "InitiateCheckout", { value: VALORES[plan.id] || 349, currency: "EUR", content_name: plan.name, content_ids: [plan.id] });
  if (window.dataLayer) window.dataLayer.push({ event: "initiate_checkout", plan: plan.id, value: VALORES[plan.id] });
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ transform: v ? "none" : "translateY(16px)", transition: `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function WaIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Check({ className = "text-orange-600" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`flex-shrink-0 ${className}`} aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Label({ children }) {
  return <span className="inline-block text-orange-600 text-xs font-bold tracking-[0.14em] uppercase">{children}</span>;
}

function Mockup({ m }) {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden" style={{ boxShadow: "0 30px 60px -20px rgba(28,25,23,0.25), 0 8px 20px -10px rgba(28,25,23,0.15)" }}>
        <div className="h-9 bg-stone-100 border-b border-stone-200 flex items-center gap-1.5 px-4">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          <span className="ml-3 h-4 flex-1 max-w-[180px] rounded bg-white border border-stone-200" />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="font-black text-stone-900 text-sm tracking-tight">{m.name}</span>
            <span className="text-[10px] font-bold text-white bg-teal-700 rounded-full px-3 py-1">{m.cta}</span>
          </div>
          <div className="grid grid-cols-5 gap-5 items-end">
            <div className="col-span-3">
              <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider mb-2">{m.city}</p>
              <p className="text-xl sm:text-2xl font-black text-stone-900 leading-[1.05] mb-3">{m.tag}</p>
              <div className="h-2 bg-stone-200 rounded w-11/12 mb-1.5" />
              <div className="h-2 bg-stone-200 rounded w-3/4 mb-4" />
              <div className="flex gap-2">
                <span className="text-[11px] font-bold bg-stone-900 text-white rounded-lg px-3 py-2">{m.cta}</span>
                <span className="text-[11px] font-bold bg-green-500 text-white rounded-lg px-3 py-2 inline-flex items-center gap-1"><WaIcon size={11} /> {m.wa}</span>
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 aspect-[4/5]" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {m.items.map((it) => (
              <div key={it} className="rounded-lg border border-stone-200 px-2.5 py-2">
                <div className="w-5 h-5 rounded bg-teal-100 mb-2" />
                <p className="text-[10px] font-semibold text-stone-800 leading-tight">{it}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-stone-500 mt-4">{m.hours}</p>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-3 sm:-right-6 bg-green-500 text-white rounded-full pl-3 pr-4 py-2.5 flex items-center gap-2 text-xs font-bold" style={{ boxShadow: "0 10px 25px -8px rgba(34,197,94,0.6)" }}>
        <WaIcon size={16} /> {m.wa}
      </div>
    </div>
  );
}

function MobileCtaBar({ text }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2" style={{ transform: show ? "translateY(0)" : "translateY(110%)", transition: "transform 0.3s ease" }}>
      <a href="#planes" data-event="mobile-cta-planes" className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-sm" style={{ boxShadow: "0 8px 24px -6px rgba(234,88,12,0.55)" }}>
        {text} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex justify-between items-start gap-5 text-left py-5 group">
        <span className="font-semibold text-stone-900 text-[15px] leading-snug">{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${open ? "bg-stone-900 border-stone-900 text-white rotate-45" : "border-stone-300 text-stone-500 group-hover:border-stone-900"}`}>
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? "600px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <p className="pb-5 text-stone-600 text-[15px] leading-relaxed pr-10">{a}</p>
      </div>
    </div>
  );
}

function PlanCard({ plan, t, h, delay }) {
  const pop = plan.popular;
  return (
    <Reveal delay={delay} className="flex">
      <div className={`relative w-full rounded-2xl flex flex-col bg-white ${pop ? "border-2 border-stone-900" : "border border-stone-200"}`} style={pop ? { boxShadow: "0 30px 50px -25px rgba(28,25,23,0.35)" } : {}}>
        {pop && (
          <span className="absolute -top-3.5 left-6 bg-orange-600 text-white text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full">{t.pricing.popular}</span>
        )}
        <div className="px-6 sm:px-7 pt-8 pb-6">
          <h3 className="font-bold text-stone-900 text-lg mb-1">{plan.name}</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6 min-h-[2.6rem]">{plan.tagline}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-stone-900 tracking-tight">{plan.price}</span>
          </div>
          <p className="text-stone-500 text-xs mt-1">{h.per_once}</p>
        </div>
        <div className="px-6 sm:px-7 pb-6">
          <a
            href={plan.stripe}
            target="_blank"
            rel="noopener noreferrer"
            data-event={`stripe-${plan.id}`}
            onClick={() => trackCheckout(plan)}
            className={`block text-center font-bold py-4 rounded-xl text-[15px] transition-all hover:-translate-y-0.5 ${pop ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-stone-900 hover:bg-stone-800 text-white"}`}
            style={pop ? { boxShadow: "0 10px 24px -8px rgba(234,88,12,0.6)" } : {}}
          >
            {h.plan_cta} · {plan.price}
          </a>
          <a href={wa(plan.wa_msg)} target="_blank" rel="noopener noreferrer" data-event={`wa-${plan.id}`} className="block text-center text-stone-500 hover:text-stone-900 text-xs py-3 underline underline-offset-4 decoration-stone-300">
            {h.plan_doubt}
          </a>
        </div>
        <div className="px-6 sm:px-7 pb-8 flex-1 border-t border-stone-100 pt-6">
          <ul className="space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[14px] text-stone-700 leading-snug">
                <span className="mt-0.5"><Check /></span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

export default function Inicio() {
  const { t, lang } = useLang();
  const h = t.home;
  const metaTitle = t.meta.home_title;
  const metaDesc = t.meta.home_desc;
  const [form, setForm] = useState({ name: "", phone: "", service: "", msg: "" });

  const enviarWa = (e) => {
    e.preventDefault();
    const texto = `${t.contact.form.header}\n${t.contact.form.name}: ${form.name}\n${t.contact.form.phone}: ${form.phone}\n${t.contact.form.service} ${form.service}\n${form.msg}`;
    window.open(wa(texto), "_blank", "noopener");
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-900 overflow-x-hidden pb-20 md:pb-0">
      <Helmet>
        <html lang={lang} />
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`https://kuraianto.com${lang === "es" ? "/webs" : `/${lang}`}`} />
        <link rel="alternate" hreflang="es" href="https://kuraianto.com/webs" />
        <link rel="alternate" hreflang="en" href="https://kuraianto.com/en" />
        <link rel="alternate" hreflang="nl" href="https://kuraianto.com/nl" />
        <link rel="alternate" hreflang="fr" href="https://kuraianto.com/fr" />
        <link rel="alternate" hreflang="x-default" href="https://kuraianto.com/webs" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content="https://kuraianto.com/webs" />
        <meta property="og:image" content="https://kuraianto.com/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Kuraianto" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content="https://kuraianto.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": t.faq.items.map((item) => ({ "@type": "Question", "name": item.q, "acceptedAnswer": { "@type": "Answer", "text": item.a } })),
        })}</script>
      </Helmet>

      {/* HERO */}
      <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <Label>{h.kicker}</Label>
              <h1 className="mt-5 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] font-black tracking-tight text-stone-900 max-w-[13ch]">
                {h.h1}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-xl">{h.sub}</p>
              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
                <a href="#planes" data-event="hero-cta-planes" className="inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5" style={{ boxShadow: "0 12px 28px -8px rgba(234,88,12,0.55)" }}>
                  {h.cta} <span className="text-orange-200 font-semibold text-sm">{h.cta_sub}</span>
                </a>
                <a href={wa(h.wa_msg)} target="_blank" rel="noopener noreferrer" data-event="hero-cta-wa" className="inline-flex items-center justify-center gap-2 text-stone-700 hover:text-stone-900 font-semibold px-2 py-3 text-[15px]">
                  <span className="text-green-600"><WaIcon size={18} /></span> {h.cta_wa}
                </a>
              </div>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5">
                {h.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-stone-600"><Check className="text-green-600" /> {b}</li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5 lg:pl-4">
              <Mockup m={h.mock} />
            </div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{h.proof_label}</span>
            {t.clients.items.map((c) => (
              <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="text-stone-800 font-black text-lg tracking-tight hover:text-orange-600 transition-colors">{c.name}</a>
            ))}
          </div>
          <div className="lg:ml-auto flex flex-wrap gap-x-10 gap-y-3">
            {h.proof_stats.map(([n, l]) => (
              <div key={n}><span className="block font-black text-stone-900 text-xl leading-none">{n}</span><span className="text-xs text-stone-500">{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Reveal className="lg:col-span-5">
              <Label>{h.problem_label}</Label>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.problem_title}</h2>
              <p className="mt-6 text-stone-600 text-lg leading-relaxed max-w-md">{h.problem_close}</p>
              <a href="#planes" className="mt-7 inline-flex items-center gap-2 font-bold text-stone-900 border-b-2 border-orange-600 pb-0.5">{h.cta} →</a>
            </Reveal>
            <div className="lg:col-span-7 lg:pl-8 space-y-4">
              {h.problems.map((p, i) => (
                <Reveal key={p.t} delay={i * 100}>
                  <div className="flex gap-5 rounded-2xl bg-white border border-stone-200 p-6">
                    <span className="font-black text-orange-600 text-2xl tabular-nums leading-none mt-0.5">0{i + 1}</span>
                    <div>
                      <h3 className="font-bold text-stone-900 text-lg">{p.t}</h3>
                      <p className="text-stone-600 mt-1.5 leading-relaxed">{p.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="planes" className="py-20 sm:py-28 bg-stone-100 border-y border-stone-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="max-w-2xl mb-12">
            <Label>{h.plans_label}</Label>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.plans_title}</h2>
            <p className="mt-5 text-stone-600 text-lg leading-relaxed">{h.plans_sub}</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 pt-3">
            {t.pricing.plans.map((plan, i) => <PlanCard key={plan.id} plan={plan} t={t} h={h} delay={i * 90} />)}
          </div>
          <Reveal delay={150} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-2xl bg-white border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {h.guarantee.map((g) => (
                <span key={g} className="flex items-center gap-2.5 text-sm font-semibold text-stone-800"><Check className="text-green-600" /> {g}</span>
              ))}
            </div>
            <div className="lg:col-span-5 rounded-2xl border border-dashed border-stone-300 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500 mb-2">{h.not_included_title}</p>
              <p className="text-sm text-stone-600 leading-relaxed">{h.not_included}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW */}
      <section id="como-funciona" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="max-w-2xl mb-14">
            <Label>{h.how_label}</Label>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.how_title}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {t.process.steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="relative pt-6 border-t-2 border-stone-900">
                  <span className="absolute -top-[13px] left-0 bg-[#FAF9F6] pr-3 font-black text-orange-600 text-xl tabular-nums">{s.num}</span>
                  <h3 className="font-bold text-stone-900 text-lg mt-2">{s.title}</h3>
                  <p className="text-stone-600 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDES */}
      <section className="py-20 sm:py-28 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="max-w-2xl mb-14">
            <span className="inline-block text-orange-400 text-xs font-bold tracking-[0.14em] uppercase">{h.includes_label}</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.includes_title}</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {h.includes.map((it, i) => (
              <Reveal key={it.t} delay={i * 70}>
                <div className="flex gap-4">
                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Check className="text-orange-400" /></span>
                  <div>
                    <h3 className="font-bold text-white text-lg">{it.t}</h3>
                    <p className="text-stone-300 mt-1.5 leading-relaxed">{it.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-14">
            <a href="#planes" className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5">{h.cta} <span className="text-orange-200 text-sm font-semibold">{h.cta_sub}</span></a>
          </Reveal>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="clientes" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <Label>{h.projects_label}</Label>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.projects_title}</h2>
            </div>
            <p className="text-stone-600 md:max-w-xs">{h.projects_sub}</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.clients.items.map((c, i) => (
              <Reveal key={c.url} delay={i * 90}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl bg-white border border-stone-200 p-7 h-full hover:border-stone-900 transition-colors">
                  <p className="text-xs font-semibold text-stone-400 mb-8">{c.url.replace("https://", "")}</p>
                  <h3 className="font-black text-stone-900 text-2xl tracking-tight">{c.name}</h3>
                  <p className="text-stone-600 mt-2 leading-relaxed">{c.desc}</p>
                  <span className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors">{h.visit} →</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section className="py-20 sm:py-24 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Reveal className="lg:col-span-4">
              <Label>{h.other_label}</Label>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">{h.other_title}</h2>
              <p className="mt-5 text-stone-600 leading-relaxed">{h.other_sub}</p>
              <a href={wa(t.pricing.other_wa_msg)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-colors">{h.other_cta}</a>
            </Reveal>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-8">
              {t.pricing.other_categories.map((cat, ci) => (
                <Reveal key={cat.label} delay={ci * 90}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-4">{cat.label}</p>
                  <ul className="divide-y divide-stone-200">
                    {cat.items.map((s) => (
                      <li key={s.name} className="py-3.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-bold text-stone-900 text-[15px]">{s.name}</span>
                          <span className="text-orange-600 text-xs font-bold whitespace-nowrap">{s.price}</span>
                        </div>
                        <p className="text-stone-500 text-sm mt-1 leading-snug">{s.desc}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Reveal className="lg:col-span-4">
              <Label>{h.faq_label}</Label>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">{h.faq_title}</h2>
              <a href={wa(t.faq.cta_msg)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 text-stone-800 font-semibold text-sm"><span className="text-green-600"><WaIcon /></span> {h.faq_more}</a>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-8">
              <div className="border-t border-stone-200">
                {t.faq.items.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 lg:px-10 pb-20 sm:pb-28">
        <Reveal>
          <div className="max-w-7xl mx-auto rounded-3xl bg-orange-600 text-white px-7 py-14 sm:px-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{h.final_title}</h2>
              <p className="mt-5 text-orange-100 text-lg max-w-xl">{h.final_sub}</p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <a href="#planes" className="inline-flex items-center justify-center gap-2 bg-white text-stone-900 font-bold px-8 py-4 rounded-xl text-base hover:-translate-y-0.5 transition-transform">{h.final_cta} →</a>
              <a href={wa(h.wa_msg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-white font-semibold px-4 py-3 text-sm"><WaIcon /> {h.cta_wa}</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="py-20 sm:py-24 bg-white border-t border-stone-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Reveal className="lg:col-span-5">
            <Label>{h.contact_label}</Label>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">{h.contact_title}</h2>
            <p className="mt-5 text-stone-600 leading-relaxed">{h.contact_sub}</p>
            <div className="mt-8 space-y-2 text-[15px]">
              <a href={WA_BASE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-stone-900"><span className="text-green-600"><WaIcon /></span> +32 485 25 11 10</a>
              <a href="mailto:info@kuraianto.com" className="block text-stone-600 hover:text-stone-900">info@kuraianto.com</a>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <form onSubmit={enviarWa} className="rounded-2xl border border-stone-200 bg-[#FAF9F6] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.contact.form.name} className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-stone-900" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.contact.form.phone} className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-stone-900" />
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="sm:col-span-2 w-full bg-white border border-stone-300 rounded-xl px-4 py-3.5 text-[15px] text-stone-700 focus:outline-none focus:border-stone-900">
                <option value="">{t.contact.form.service}</option>
                {t.contact.form.opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <textarea rows={4} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder={t.contact.form.msg_placeholder} className="sm:col-span-2 w-full bg-white border border-stone-300 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-stone-900" />
              <button type="submit" className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-[15px] transition-colors"><WaIcon /> {t.contact.form.submit}</button>
            </form>
          </Reveal>
        </div>
      </section>

      <MobileCtaBar text={h.mobile_cta} />
    </div>
  );
}
