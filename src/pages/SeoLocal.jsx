import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const WA_BASE = "https://wa.me/32485251110";
const wa = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const DEMO_MSG = "Hola, me gustaría pedir una auditoría SEO gratuita para mi negocio.";
const INFO_MSG = "Hola, me gustaría saber más sobre el servicio de SEO local.";

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
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(22px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b last:border-0 transition-colors duration-300 ${open ? "border-orange-500/15" : "border-white/[0.07]"}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start gap-5 text-left py-5 bg-transparent border-0 cursor-pointer group"
      >
        <span className={`font-medium text-sm leading-snug transition-colors duration-200 ${open ? "text-white" : "text-neutral-300 group-hover:text-white"}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${open ? "bg-orange-500 border-orange-500 text-white" : "border-white/15 text-neutral-500 group-hover:border-orange-500/50 group-hover:text-orange-400"}`}
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? "600px" : "0", overflow: "hidden", transition: "max-height 0.38s ease" }}>
        <p className="pb-5 text-neutral-400 text-sm leading-relaxed pr-10">{answer}</p>
      </div>
    </div>
  );
}

const FEATURES = [
  { title: "Auditoría SEO inicial", desc: "Analizamos tu posición actual, la de tu competencia directa y los problemas técnicos que te frenan antes de tocar nada." },
  { title: "Google Business Profile", desc: "Optimización completa de tu ficha en Google Maps: categorías, descripción, fotos, horarios y gestión de reseñas." },
  { title: "Palabras clave locales", desc: "Estrategia basada en las búsquedas reales de personas de tu zona, no en keywords genéricas sin volumen ni intención." },
  { title: "Contenido optimizado", desc: "Textos y páginas estructurados para que Google los entienda y los posicione en las búsquedas que te importan." },
  { title: "SEO técnico", desc: "Velocidad, estructura de URLs, metaetiquetas, datos estructurados y accesibilidad para rastreadores de Google." },
  { title: "Informes mensuales", desc: "Datos reales de posicionamiento, clics orgánicos y visibilidad en Google Search Console. Sin estimaciones." },
];

const FAQS = [
  { q: "Cuánto tiempo tarda el SEO en dar resultados?", a: "En la mayoría de los casos, los primeros resultados visibles aparecen entre los 3 y 6 meses. El tiempo varía según la competencia en tu sector, la antigüedad del dominio y la consistencia del trabajo. No prometemos posición 1 en 30 días porque ese tipo de promesas no son reales." },
  { q: "En qué se diferencia el SEO local del SEO general?", a: "El SEO local se enfoca en búsquedas con intención geográfica: 'dentista en Bilbao', 'abogado cerca de mí', 'restaurante Madrid centro'. Incluye optimización de Google Business Profile y contenido orientado a tu zona. El SEO general va a por keywords sin localización específica." },
  { q: "Necesito una web nueva para trabajar el SEO?", a: "No necesariamente. Podemos trabajar con tu web actual si tiene buena estructura técnica. Si hay problemas graves de base —velocidad, arquitectura, URLs—, lo detectamos en la auditoría y te lo explicamos antes de empezar." },
  { q: "Cómo sé si el SEO está funcionando?", a: "Con datos verificables. Compartimos informes mensuales con posiciones reales, tráfico orgánico y clics, directamente de Google Search Console. No son proyecciones ni estimaciones, son datos reales de Google." },
  { q: "Cuál es la diferencia entre SEO y Google Ads?", a: "Google Ads te da visibilidad inmediata pero pagas por cada clic mientras la campaña esté activa. El SEO construye visibilidad orgánica que no tiene coste por clic y se mantiene a largo plazo. Son complementarios: los Ads funcionan mientras el SEO coge velocidad." },
];

export default function SeoLocal() {
  return (
    <div className="bg-neutral-950 overflow-x-hidden">
      <Helmet>
        <title>SEO Local para Negocios | Posicionamiento en Google | Kuraianto</title>
        <meta name="description" content="Aparece en Google cuando alguien busca tu servicio cerca. Posicionamiento local medible, sin permanencias. Auditoría SEO gratuita." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://kuraianto.com/seo-local" />
        <meta property="og:title" content="SEO Local para Negocios | Posicionamiento en Google | Kuraianto" />
        <meta property="og:description" content="Aparece en Google cuando alguien busca tu servicio cerca. Posicionamiento local medible, sin permanencias. Auditoría SEO gratuita." />
        <meta property="og:url" content="https://kuraianto.com/seo-local" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.03) 45%, transparent 70%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-6 h-px bg-orange-500" />
                SEO Local
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                SEO local: aparece en Google cuando te buscan en tu ciudad
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-xl">
                Posicionamiento en Google orientado a negocios locales. Tráfico orgánico real, sin pagar por cada clic. Resultados medibles mes a mes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={wa(DEMO_MSG)} target="_blank" rel="noopener noreferrer" data-event="seo-hero-demo"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25">
                  Pedir auditoría gratuita
                </a>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="seo-hero-wa"
                  className="inline-flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/5">
                  Preguntar por WhatsApp
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-8">
                {["Auditoría gratuita", "Sin permanencias", "Informes mensuales reales"].map((item) => (
                  <span key={item} className="flex items-center gap-2 text-neutral-500 text-xs">
                    <span className="w-1 h-1 rounded-full bg-orange-500/70 flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT IS SEO LOCAL ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Qué es</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
                Qué significa aparecer en Google cuando alguien busca tu servicio
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Cuando alguien escribe "clínica dental Madrid" o "fontanero urgente Bilbao", Google muestra primero los resultados locales: el mapa con fichas de Google Maps y una lista de negocios de la zona. Ese espacio es el que ocupa el SEO local.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                No se trata de aparecer para cualquier búsqueda. Se trata de aparecer exactamente cuando alguien de tu zona está buscando lo que tú ofreces.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A diferencia de los anuncios de pago, el tráfico orgánico no tiene coste por clic. Una vez que estás bien posicionado, Google te envía visitas sin que pagues por cada una.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 space-y-6">
                {[
                  { step: "01", text: "Alguien en tu ciudad busca tu servicio en Google" },
                  { step: "02", text: "Google muestra negocios locales relevantes en el mapa y en los resultados" },
                  { step: "03", text: "Tu negocio aparece porque tiene una web optimizada y una ficha de Google bien trabajada" },
                  { step: "04", text: "El cliente visita tu web o te llama directamente desde Google Maps" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="text-[11px] font-black tabular-nums flex-shrink-0 pt-0.5" style={{ color: "rgba(249,115,22,0.5)" }}>{item.step}</span>
                    <p className="text-neutral-300 text-sm leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-12">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Qué incluye</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight max-w-xl">
              Un trabajo SEO completo, no acciones sueltas
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 h-full flex flex-col">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2 leading-snug">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Para quién es</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
                Para negocios que viven de clientes en su zona
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                El SEO local tiene más sentido cuando tu cliente ideal es alguien que vive o trabaja cerca de ti. Si vendes a toda España o solo online, el SEO local es parte de la estrategia pero no el único canal.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <ul className="space-y-3">
                {[
                  "Clínicas dentales, médicos y fisioterapeutas",
                  "Abogados, gestorías y asesorías fiscales",
                  "Restaurantes, cafeterías y hostelería",
                  "Talleres mecánicos y servicios a domicilio",
                  "Gimnasios, centros de estética y bienestar",
                  "Inmobiliarias y agencias locales",
                  "Tiendas físicas con presencia online",
                  "Cualquier profesional que atienda clientela local",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-300">
                    <div className="w-5 h-5 rounded-full border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5 3.5-4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HONEST TIMELINE ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl mx-auto rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-8 md:p-10">
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase block mb-4">Plazos reales</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
                El SEO tarda. Aquí te lo explicamos con honestidad.
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                El SEO orgánico no es inmediato. Los primeros resultados claros suelen aparecer entre los 3 y 6 meses. Factores como la competencia de tu sector en tu zona, la antigüedad y autoridad del dominio y la consistencia del trabajo mes a mes influyen directamente.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Cualquier agencia que te prometa posición 1 en Google en 30 días está mintiendo. El posicionamiento orgánico es un proceso, no un interruptor.
              </p>
              <p className="text-neutral-300 text-sm font-medium">
                Lo que sí te podemos garantizar: trabajo consistente, datos reales cada mes y comunicación directa si algo no está funcionando.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-12">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Proceso</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight max-w-xl">
              Cómo trabajamos el SEO mes a mes
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Auditoría inicial", desc: "Analizamos tu posición actual, la de tu competencia y los problemas técnicos que están frenando tu visibilidad." },
              { num: "02", title: "Estrategia", desc: "Definimos las palabras clave más relevantes para tu negocio y tu zona, y el plan de acción mensual." },
              { num: "03", title: "Implementación", desc: "Optimizamos tu web, tu ficha de Google Maps y los contenidos. El trabajo técnico y editorial que posiciona." },
              { num: "04", title: "Seguimiento mensual", desc: "Informe cada mes con datos reales de posicionamiento, tráfico orgánico y evolución. Ajustamos la estrategia si hace falta." },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 h-full flex flex-col">
                  <span className="text-[11px] font-black tabular-nums mb-4 block" style={{ color: "rgba(249,115,22,0.5)" }}>{step.num}</span>
                  <h3 className="text-white font-bold text-sm mb-3 leading-snug">{step.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">FAQ</span>
                <h2 className="text-3xl font-bold text-white mt-3 mb-4 leading-tight">Preguntas frecuentes sobre SEO local</h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-7">
                  Si tienes alguna duda que no aparece aquí, escríbenos por WhatsApp y te respondemos en menos de 24 horas.
                </p>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="seo-faq-wa"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-md shadow-orange-500/20">
                  Hacer una pregunta <span>→</span>
                </a>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-8" delay={100}>
              <div className="rounded-2xl border border-white/[0.06] bg-neutral-900 px-7 py-2">
                {FAQS.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ── */}
      <section className="bg-neutral-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-8">
            <p className="text-neutral-500 text-xs font-semibold tracking-widest uppercase">También puede interesarte</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Diseño web profesional", desc: "El SEO funciona mejor sobre una web bien estructurada. Si necesitas una web nueva o mejorar la que tienes, por aquí.", href: "/diseno-web", cta: "Ver diseño web" },
              { title: "Google Ads", desc: "Mientras el SEO coge velocidad, los anuncios en Google te dan visibilidad inmediata sin esperar meses.", href: "/google-ads", cta: "Ver Google Ads" },
            ].map((item) => (
              <Reveal key={item.title} delay={80}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 flex flex-col">
                  <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1 mb-5">{item.desc}</p>
                  <Link to={item.href} className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
                    {item.cta} →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative bg-neutral-950 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.09) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">Primer paso</span>
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Solicita una auditoría SEO gratuita
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Analizamos tu posición actual, la de tu competencia y te explicamos qué se puede mejorar. Sin compromiso y sin coste.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={wa(DEMO_MSG)} target="_blank" rel="noopener noreferrer" data-event="seo-bottom-demo"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25">
                Pedir auditoría gratuita
              </a>
              <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="seo-bottom-wa"
                className="inline-flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 font-semibold px-10 py-4 rounded-full text-sm transition-all hover:bg-white/5">
                Preguntar por WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
