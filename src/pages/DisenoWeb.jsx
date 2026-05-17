import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const WA_BASE = "https://wa.me/32485251110";
const wa = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const CTA_MSG = "Hola, me gustaría contratar una web. ¿Podéis contarme más sobre vuestros planes?";
const INFO_MSG = "Hola, me gustaría saber más sobre el servicio de diseño web.";

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
  { title: "Diseño adaptado a tu negocio", desc: "Partimos de tu sector, tus clientes y tu identidad para crear un diseño que tenga sentido y transmita confianza." },
  { title: "Responsive y rápida", desc: "Tu web funciona perfectamente en móvil, tablet y escritorio. La velocidad de carga está optimizada desde el primer día." },
  { title: "WhatsApp y formularios de contacto", desc: "Botones de contacto colocados donde tienen sentido para que los visitantes actúen sin fricción." },
  { title: "SEO técnico incluido", desc: "Configuración básica para que Google pueda encontrarte: estructura, metaetiquetas y velocidad desde el inicio." },
  { title: "Pago seguro con Stripe", desc: "Contratación en 2 clics. Pagas online con Stripe, recibis confirmación inmediata y empezamos enseguida. Sin letra pequeña." },
  { title: "Entrega en plazos claros", desc: "Web Starter en 7 días. Web Pro en 10-14 días. Web + Marketing en 14-21 días. Sin sorpresas de calendario." },
];

const PLANS = [
  {
    name: "Web Starter",
    price: "349€",
    stripe: "https://buy.stripe.com/9B69AM04B4kQ9aca4Nc7u09",
    desc: "Hasta 5 páginas o secciones, diseño responsive, WhatsApp, formulario, Google Maps y SEO básico. Lista en 7 días.",
  },
  {
    name: "Web Pro",
    price: "649€",
    stripe: "https://buy.stripe.com/9B6fZa4kR18E3PS7WFc7u0a",
    popular: true,
    desc: "Todo lo del Starter más hasta 8 secciones, blog, SEO local básico y 1 mes de soporte post-lanzamiento.",
  },
  {
    name: "Web + Marketing",
    price: "1.099€",
    stripe: "https://buy.stripe.com/4gMfZa5oVg3ygCE0udc7u0b",
    desc: "Web completa con landing page para Meta/Google Ads, SEO completo, Meta Pixel con eventos y 3 meses de soporte.",
  },
];

const FAQS = [
  { q: "Cómo se realiza el pago?", a: "El pago se realiza online de forma segura a través de Stripe. Pagas directamente en la web, recibes confirmación inmediata y nos ponemos en contacto para acordar el calendario y enviarte el contrato." },
  { q: "Cuánto tiempo tarda en entregarse una web?", a: "El plan Web Starter se entrega en 7 días. El plan Web Pro en 10 a 14 días. El plan Web + Marketing en 14 a 21 días según el proyecto." },
  { q: "Puedo saber cómo quedaría mi web antes de pagar?", a: "Sí, con mucho gusto. Escríbenos por WhatsApp y te contamos cómo enfocaríamos tu web, qué incluye tu plan y resolvemos cualquier duda antes de que decidas. Sin coste ni compromiso." },
  { q: "Necesito saber programar para gestionar la web?", a: "No. Nos encargamos de todo y te explicamos cada paso de forma sencilla. Si necesitas hacer cambios menores después, podemos enseñarte o encargarnos con nuestro plan de mantenimiento." },
  { q: "Qué diferencia hay entre los tres planes?", a: "Web Starter es una web de hasta 5 páginas, rápida y clara. Web Pro incluye hasta 8 secciones, blog y SEO local. Web + Marketing es la opción completa con landing page para campañas, SEO avanzado y Meta Pixel configurado." },
  { q: "Qué pasa con el hosting y el dominio?", a: "Los gestionamos durante el desarrollo. Después, el hosting y el dominio son costes independientes que podemos gestionar por ti o transferirte para que los controles directamente." },
];

export default function DisenoWeb() {
  return (
    <div className="bg-neutral-950 overflow-x-hidden">
      <Helmet>
        <html lang="es" />
        <title>Diseño Web Profesional para Negocios desde 349€ | Kuraianto</title>
        <meta name="description" content="Webs profesionales para negocios locales. Rápidas, modernas y listas en 7 días. Desde 349€. Pago seguro con Stripe. Sin permanencias." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://kuraianto.com/diseno-web" />
        <meta property="og:title" content="Diseño Web Profesional para Negocios desde 349€ | Kuraianto" />
        <meta property="og:description" content="Webs profesionales para negocios locales. Rápidas, modernas y listas en 7 días. Desde 349€. Pago seguro con Stripe. Sin permanencias." />
        <meta property="og:url" content="https://kuraianto.com/diseno-web" />
        <meta property="og:image" content="https://kuraianto.com/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.03) 45%, transparent 70%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-6 h-px bg-orange-500" />
                Diseño Web
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Diseño web profesional para negocios que quieren conseguir clientes
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-xl">
                No diseñamos webs para que queden bonitas. Las diseñamos para que vendan. Pago seguro con Stripe, listo en 7 días, desde 349€.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/#planes" data-event="diseno-hero-plans"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 w-full sm:w-auto">
                  Ver planes y contratar →
                </a>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="diseno-hero-wa"
                  className="inline-flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 font-semibold px-8 py-4 rounded-full text-sm transition-all hover:bg-white/5 w-full sm:w-auto">
                  Tengo dudas, escríbenos
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-8">
                {["Pago seguro con Stripe", "Desde 349€", "Lista en 7-14 días"].map((item) => (
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

      {/* ── WHY WEB MATTERS ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">El problema</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
                Una web que no convierte es dinero que no entra
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                La mayoría de webs de pequeñas empresas son folletos digitales: tienen información, pero no tienen una estructura pensada para que el visitante haga algo. No hay un botón de WhatsApp claro, los textos son genéricos y la web tarda demasiado en cargar en móvil.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                El resultado: el visitante llega, no encuentra lo que busca, y se va. Nunca sabrás que estuvo ahí.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="space-y-4">
                {[
                  { bad: "Web lenta que pierde visitas", good: "Carga rápida en móvil y escritorio" },
                  { bad: "Diseño genérico que no transmite confianza", good: "Diseño adaptado a tu sector y cliente" },
                  { bad: "Sin llamadas a la acción claras", good: "WhatsApp, formulario y CTAs bien colocados" },
                  { bad: "Google no te encuentra", good: "SEO técnico configurado desde el inicio" },
                ].map((item) => (
                  <div key={item.bad} className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-2.5">
                      <span className="text-red-500/60 text-xs mt-0.5 flex-shrink-0">✕</span>
                      <p className="text-neutral-500 text-xs leading-snug">{item.bad}</p>
                    </div>
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.03] p-4 flex items-start gap-2.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 mt-0.5">
                        <path d="M2 6l3 3 5-5" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-neutral-300 text-xs leading-snug">{item.good}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-12">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Qué incluye</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight max-w-xl">
              Todo lo que necesitas para tener una web que funcione
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
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Para quién es</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
                Para cualquier negocio que necesite una web que trabaje por él
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Trabajamos con negocios locales y de servicios que necesitan una presencia digital profesional. No importa si partes de cero o si quieres sustituir una web vieja.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <ul className="space-y-3">
                {[
                  "Clínicas, consultorios y centros de salud",
                  "Restaurantes, cafés y hostelería",
                  "Tiendas y comercios locales",
                  "Despachos de abogados, gestorías y asesorías",
                  "Autónomos y profesionales independientes",
                  "Inmobiliarias y agencias de servicios",
                  "Estudios, talleres y centros de formación",
                  "Cualquier negocio que quiera más clientes desde internet",
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

      {/* ── PROCESS ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-12">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Proceso</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight max-w-xl">
              Cómo trabajamos contigo
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Nos cuentas tu proyecto", desc: "Por WhatsApp, en menos de 5 minutos. Cuéntanos qué necesitas y cómo funciona tu negocio." },
              { num: "02", title: "Propuesta y presupuesto", desc: "Te enviamos un presupuesto detallado y te explicamos cómo enfocaríamos tu web en menos de 24 horas." },
              { num: "03", title: "Desarrollamos tu web", desc: "Con los textos, imágenes y estructura que hemos acordado. Sin sorpresas ni cambios de precio." },
              { num: "04", title: "Entregamos y acompañamos", desc: "Publicamos tu web, te explicamos cómo funciona y quedamos disponibles para lo que necesites." },
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

      {/* ── PLANS ── */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-10">
            <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Planes y precios</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 leading-tight max-w-xl">
              Web profesional desde 349€
            </h2>
            <p className="text-neutral-400 text-sm mt-3 max-w-md">Sin letra pequeña, sin permanencias. Sabes exactamente qué pagas y qué obtienes.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div className={`rounded-2xl p-7 h-full flex flex-col ${plan.popular ? "border border-orange-500/30 bg-orange-500/[0.05]" : "border border-white/[0.07] bg-white/[0.025]"}`}>
                  {plan.popular && (
                    <div className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 rounded-full px-3 py-1 mb-4 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span className="text-orange-400 text-[11px] font-semibold tracking-wide">Más solicitado</span>
                    </div>
                  )}
                  <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-orange-400 font-black text-3xl mb-1">{plan.price}</p>
                  <p className="text-neutral-600 text-xs mb-4">pago único</p>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1 mb-6">{plan.desc}</p>
                  {plan.stripe && (
                    <a
                      href={plan.stripe}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event={`diseno-stripe-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`block text-center font-bold py-3.5 rounded-full text-sm transition-all hover:-translate-y-0.5 ${plan.popular ? "bg-orange-500 hover:bg-orange-400 text-white" : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20"}`}
                    >
                      Contratar ahora — {plan.price}
                    </a>
                  )}
                  <a
                    href={wa(`Hola, tengo dudas sobre el plan ${plan.name} (${plan.price}). ¿Podéis ayudarme?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event={`diseno-wa-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block text-center text-neutral-500 hover:text-neutral-300 text-xs py-2 transition-colors duration-200"
                  >
                    Tengo dudas, escríbenos
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-neutral-950 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">FAQ</span>
                <h2 className="text-3xl font-bold text-white mt-3 mb-4 leading-tight">Preguntas frecuentes sobre diseño web</h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-7">
                  Si tienes alguna duda que no aparece aquí, escríbenos por WhatsApp y te respondemos en menos de 24 horas.
                </p>
                <a href={wa(INFO_MSG)} target="_blank" rel="noopener noreferrer" data-event="diseno-faq-wa"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-md shadow-orange-500/20 w-full sm:w-auto justify-center">
                  Hacer una pregunta →
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
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Reveal className="mb-8">
            <p className="text-neutral-500 text-xs font-semibold tracking-widest uppercase">También puede interesarte</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "SEO local", desc: "Cuando tu web esté lista, el siguiente paso es que Google la encuentre. El SEO local te posiciona en búsquedas de tu ciudad.", href: "/seo-local", cta: "Ver SEO local" },
              { title: "Google Ads", desc: "Si quieres clientes desde el primer día, los anuncios en Google son el complemento perfecto a una web bien hecha.", href: "/google-ads", cta: "Ver Google Ads" },
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
        <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-10 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">Siguiente paso</span>
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Solicita tu presupuesto hoy
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Escríbenos por WhatsApp y te respondemos con un presupuesto detallado en menos de 24 horas. Sin compromiso, sin letra pequeña.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/#planes" data-event="diseno-bottom-plans"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 w-full sm:w-auto">
                Ver planes y contratar →
              </a>
              <a href={wa(CTA_MSG)} target="_blank" rel="noopener noreferrer" data-event="diseno-bottom-wa"
                className="inline-flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 font-semibold px-10 py-4 rounded-full text-sm transition-all hover:bg-white/5 w-full sm:w-auto">
                Preguntar por WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
