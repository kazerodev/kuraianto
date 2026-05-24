import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const WA_BASE = "https://wa.me/32485251110";
const wa = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const DEMO_MSG = "Hola, me gustaría recibir un presupuesto gratuito para Google Ads para mi negocio.";
const INFO_MSG = "Hola, me gustaría saber más sobre el servicio de Google Ads.";

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
  { title: "Configuración de campaña desde cero", desc: "Estructura de grupos de anuncios, palabras clave negativas y concordancias ajustadas a tu sector y zona desde el primer día." },
  { title: "Textos de anuncio optimizados", desc: "Escribimos los copies de cada anuncio pensando en quién los ve y qué acción queremos que tome. Sin textos genéricos." },
  { title: "Segmentación geográfica", desc: "Tus anuncios solo aparecen en la zona donde atiendes clientes. No gastas presupuesto en clics de lugares donde no puedes servir." },
  { title: "Seguimiento de conversiones", desc: "Configuramos el seguimiento para saber qué clics generan llamadas, formularios enviados o visitas reales, no solo impresiones." },
  { title: "Optimización mensual", desc: "Revisamos el rendimiento de cada keyword, ajustamos pujas y eliminamos términos que gastan sin convertir. Cada mes." },
  { title: "Informes claros y comprensibles", desc: "Un informe mensual con los datos que importan: clics, coste por conversión, impresiones y evolución del presupuesto." },
];

const FAQS = [
  { q: "Cuánto presupuesto necesito para empezar con Google Ads?", a: "Para negocios locales, un punto de partida razonable está entre 300€ y 700€ al mes en inversión publicitaria. Con menos de eso, los datos son insuficientes para optimizar bien. El presupuesto exacto depende del volumen de búsquedas en tu zona y la competencia en tu sector. Te lo calculamos antes de empezar." },
  { q: "Cuándo empiezo a ver resultados con Google Ads?", a: "Los anuncios empiezan a aparecer desde el primer día de activación. Las primeras semanas son de aprendizaje: la campaña recoge datos y nosotros ajustamos palabras clave, pujas y anuncios. Entre la segunda y la cuarta semana el rendimiento empieza a estabilizarse y mejorar." },
  { q: "Cuál es la diferencia entre Google Ads y Meta Ads?", a: "Google Ads muestra tus anuncios a personas que ya están buscando activamente tu servicio. Es publicidad de intención: captas a alguien en el momento en que quiere lo que ofreces. Meta Ads (Instagram y Facebook) funciona al revés: interrumpe a personas que no estaban buscando nada. Ambas son útiles pero con objetivos distintos." },
  { q: "Puedo gestionar los anuncios yo mismo?", a: "Técnicamente sí. Pero Google Ads tiene muchas variables que afectan directamente al coste y al rendimiento: concordancias de palabras clave, palabras negativas, calidad de anuncios, pujas inteligentes. Sin experiencia, es fácil gastar el presupuesto en clics que no convierten. Tiene sentido delegar la gestión cuando el tiempo y el dinero que ahorras superan el coste del servicio." },
  { q: "Puedo parar la campaña en cualquier momento?", a: "Sí. No hay permanencias. Puedes pausar o cancelar la campaña cuando quieras. El presupuesto publicitario que ya hayas gastado en Google no se recupera, pero no hay penalizaciones ni contratos que te ate." },
];

export default function GoogleAds() {
  return (
    <div className="bg-neutral-950 overflow-x-hidden">
      <Helmet>
        <html lang="es" />
        <title>Google Ads para Negocios Locales | Gestión de Campañas | Kuraianto</title>
        <meta name="description" content="Gestión de Google Ads para negocios locales. Configuración desde cero, seguimiento de conversiones y optimización mensual. Aparece cuando te buscan. Desde 700€/mes." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://kuraianto.com/google-ads" />
        <meta property="og:title" content="Google Ads para Negocios Locales | Gestión de Campañas | Kuraianto" />
        <meta property="og:description" content="Gestión de Google Ads para negocios locales. Configuración desde cero, seguimiento de conversiones y optimización mensual. Desde 700€/mes." />
        <meta property="og:url" content="https://kuraianto.com/google-ads" />
        <meta property="og:image" content="https://kuraianto.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Kuraianto" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Ads para Negocios Locales | Gestión de Campañas | Kuraianto" />
        <meta name="twitter:description" content="Campañas de Google Ads para negocios locales. Solo pagas por clics reales. Configuración y optimización mensual. Desde 700€/mes." />
        <meta name="twitter:image" content="https://kuraianto.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://kuraianto.com/" },
                { "@type": "ListItem", "position": 2, "name": "Google Ads", "item": "https://kuraianto.com/google-ads" }
              ]
            },
            {
              "@type": "Service",
              "@id": "https://kuraianto.com/google-ads#service",
              "name": "Google Ads para Negocios Locales",
              "url": "https://kuraianto.com/google-ads",
              "provider": { "@type": "Organization", "name": "Kuraianto", "url": "https://kuraianto.com" },
              "description": "Gestión completa de campañas de Google Ads para negocios locales. Configuración desde cero, segmentación geográfica, seguimiento de conversiones y optimización mensual.",
              "offers": {
                "@type": "Offer",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "700",
                  "priceCurrency": "EUR",
                  "billingDuration": "P1M"
                },
                "description": "Gestión mensual de Google Ads desde 700€/mes. Sin permanencias."
              },
              "areaServed": [
                { "@type": "Country", "name": "Spain" },
                { "@type": "Country", "name": "Belgium" }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": FAQS.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": { "@type": "Answer", "text": item.a }
              }))
            }
          ]
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.03) 45%, transparent 70%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-6 h-px bg-orange-500" />
                Google Ads
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Google Ads para negocios: visibilidad inmediata para quien ya te está buscando
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-xl">
                Tus anuncios aparecen cuando alguien busca exactamente lo que ofreces. Solo pagas si hacen clic. Sin mínimo de contrato.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={wa(DEMO_MSG)} target="_blank" rel="noopener noreferrer" data-event="gads-hero-demo"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25">
                  Pedir presupuesto gratuito
                </a>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="gads-hero-wa"
                  className="inline-flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/5">
                  Preguntar por WhatsApp
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-8">
                {["Presupuesto gratuito", "Sin permanencias", "Resultados desde el primer día"].map((item) => (
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

      {/* ── WHY GOOGLE ADS WORKS ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Por qué funciona</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
                La persona que ve tu anuncio ya está buscando lo que ofreces
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Google Ads funciona por intención de búsqueda. Cuando alguien escribe "dentista en Valencia" o "abogado laboral Bilbao", está activamente buscando un proveedor. Tu anuncio aparece en ese momento exacto.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                No es publicidad que interrumpe. Es publicidad que responde. La persona tiene una necesidad, Google muestra tu negocio, ella decide si hace clic. Solo pagas si hay clic.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A diferencia del SEO orgánico, los resultados son inmediatos. La campaña puede estar activa en 24-48 horas y generar contactos desde el primer día.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 space-y-6">
                {[
                  { step: "01", text: "Alguien en tu zona busca tu servicio en Google" },
                  { step: "02", text: "Tu anuncio aparece en los primeros resultados, por encima de los resultados orgánicos" },
                  { step: "03", text: "La persona hace clic y llega a tu web o te llama directamente" },
                  { step: "04", text: "Solo pagas si hay clic — no por aparecer, sino por la visita real" },
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
              Gestión completa de tu campaña, de principio a fin
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
                Para negocios que necesitan clientes ahora, no en seis meses
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Google Ads es especialmente efectivo cuando el volumen de búsquedas en tu zona es suficiente y cuando cada cliente tiene un valor claro para tu negocio.
              </p>
              <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.03] p-6">
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3">No es ideal para todos</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Si tu ticket medio es muy bajo, el coste por clic puede hacer que la campaña no sea rentable. Si tu zona tiene muy pocas búsquedas para tu servicio, el volumen no justifica la inversión. En esos casos, te lo decimos antes de empezar.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <ul className="space-y-3">
                {[
                  "Clínicas, consultorios y centros médicos",
                  "Despachos de abogados y asesorías",
                  "Servicios de emergencia: fontanería, cerrajería, electricistas",
                  "Academias, centros de formación y clases particulares",
                  "Inmobiliarias y agencias de alquiler",
                  "Talleres mecánicos y servicios de reparación",
                  "Empresas de reformas, instalaciones y mantenimiento",
                  "Cualquier negocio donde cada cliente tiene un valor significativo",
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

      {/* ── BUDGET & MANAGEMENT ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl mx-auto rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-8 md:p-10">
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest block mb-4">Presupuesto y gestión</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
                Cuánto cuesta realmente una campaña de Google Ads
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Hay dos costes: la inversión publicitaria que va directamente a Google (pagas por cada clic en tus anuncios) y la tarifa de gestión que nos pagas a nosotros por configurar y optimizar la campaña. Son costes separados y transparentes.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Para negocios locales, una inversión publicitaria de entre 300€ y 700€ al mes suele ser el punto de partida mínimo para tener datos suficientes. Por debajo de ese rango, el volumen es tan pequeño que es difícil optimizar.
              </p>
              <p className="text-neutral-300 text-sm font-medium">
                Antes de empezar, hacemos un análisis de volumen de búsquedas y te damos una estimación del coste por clic en tu sector. Sin sorpresas.
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
              Cómo arrancamos y gestionamos tu campaña
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Análisis y estrategia", desc: "Estudiamos las búsquedas en tu zona, la competencia y el potencial de la campaña. Te damos un presupuesto estimado antes de empezar." },
              { num: "02", title: "Configuración de campaña", desc: "Estructuramos la campaña, escribimos los anuncios, definimos palabras clave y configuramos el seguimiento de conversiones." },
              { num: "03", title: "Lanzamiento y primeras semanas", desc: "La campaña entra en fase de aprendizaje. Monitorizamos de cerca y ajustamos palabras clave y pujas para mejorar el rendimiento." },
              { num: "04", title: "Optimización mensual", desc: "Cada mes revisamos datos, eliminamos lo que no convierte, reforzamos lo que funciona y te enviamos un informe claro." },
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
                <h2 className="text-3xl font-bold text-white mt-3 mb-4 leading-tight">Preguntas frecuentes sobre Google Ads</h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-7">
                  Si tienes alguna duda que no aparece aquí, escríbenos por WhatsApp y te respondemos en menos de 24 horas.
                </p>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="gads-faq-wa"
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
              { title: "SEO local", desc: "Los Ads te dan visibilidad inmediata. El SEO local construye una presencia orgánica que no depende del presupuesto publicitario.", href: "/seo-local", cta: "Ver SEO local" },
              { title: "Diseño web profesional", desc: "De nada sirve un buen anuncio si la web a la que llega el usuario no convierte. Una web bien hecha multiplica el rendimiento de tus campañas.", href: "/diseno-web", cta: "Ver diseño web" },
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
              Solicita un presupuesto gratuito
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Analizamos el volumen de búsquedas en tu zona y te damos una estimación real del coste y el potencial de una campaña en Google Ads. Sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={wa(DEMO_MSG)} target="_blank" rel="noopener noreferrer" data-event="gads-bottom-demo"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25">
                Pedir presupuesto gratuito
              </a>
              <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="gads-bottom-wa"
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
