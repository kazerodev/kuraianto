import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { KIT_PRECIO, KIT_STRIPE, PROMPTS_PDF, WA, guardarUtm, evento, enlaceCompra, clickCompra, guardarLead } from "../lib/kit";

const SEMANA = [
  { tarea: "Responder 20 reseñas", antes: "40 min", ahora: "5 min" },
  { tarea: "Posts de la semana", antes: "3 h", ahora: "30 min" },
  { tarea: "Mensajes a clientes", antes: "1 h", ahora: "10 min" },
  { tarea: "Un presupuesto", antes: "45 min", ahora: "10 min" },
  { tarea: "Tu web", antes: "500€+", ahora: "1 h" },
];

const PROBLEMAS = [
  { t: "Hay demasiadas", d: "Cada semana sale una nueva. No sabes cuál sirve para qué, cuál es gratis y cuál es humo." },
  { t: "No tienes tiempo", d: "Llevas un negocio. No puedes pasarte tardes viendo tutoriales en inglés para probar cosas." },
  { t: "Suena a robot", d: "Le pides algo a la IA y te devuelve un texto genérico que nunca enviarías a un cliente." },
];

const MAPA = [
  { t: "Escribir", d: "Posts, emails, respuestas a reseñas, textos de tu web y presupuestos.", c: "Gratis para empezar" },
  { t: "Imágenes", d: "Carteles, banners y diseños para redes sin saber diseño.", c: "Gratis para empezar" },
  { t: "Vídeo", d: "Reels con subtítulos automáticos a partir de los vídeos de tu móvil.", c: "Gratis para empezar" },
  { t: "Buscar y analizar", d: "Ver qué hace tu competencia, resumir documentos y sacar ideas.", c: "Gratis para empezar" },
  { t: "Automatizar", d: "Que los avisos, formularios y mensajes se hagan solos.", c: "Gratis con límites", pago: true },
];

const SISTEMAS = [
  { n: "01", t: "Reseñas de Google", d: "Responde buenas y malas reseñas con tu tono en segundos, y consigue más." },
  { n: "02", t: "Un mes de Instagram", d: "Plan, textos e ideas de reels para 4 semanas en una sola tarde." },
  { n: "03", t: "Emails y WhatsApp", d: "Respuestas rápidas, recordatorios, seguimientos y mensajes difíciles." },
  { n: "04", t: "Presupuestos", d: "De tus notas desordenadas a un presupuesto claro que se acepta más." },
  { n: "05", t: "Carta y catálogo", d: "Descripciones de platos, servicios o productos que venden." },
  { n: "06", t: "Preguntas frecuentes", d: "Un asistente que te prepara la respuesta a lo de siempre." },
  { n: "07", t: "Tu web en 1 hora", d: "Paso a paso para publicar una web sencilla y profesional sin programar.", feature: true },
];

const SECTORES = ["Restaurante", "Clínica", "Estética y peluquería", "Tienda", "Reformas", "Autónomos"];

const INCLUYE = [
  "Mapa de qué IA usar para cada tarea",
  "7 sistemas paso a paso con más de 40 prompts",
  "Ejemplos y ajustes para 6 tipos de negocio",
  "Guía para publicar tu web en 1 hora",
  "Qué datos no poner nunca en una IA",
  "Plan de 7 días para empezar",
  "Actualizaciones durante 6 meses",
  "Ayuda por WhatsApp si te atascas",
];

const FAQ = [
  { q: "Tengo que pagar alguna IA?", a: "No para empezar. Todo el kit funciona con versiones gratuitas. Te decimos claramente cuándo merece la pena pagar y cuándo no." },
  { q: "Necesito saber de tecnología?", a: "No. Si sabes escribir un WhatsApp, puedes usar el kit. Copias el prompt, cambias lo que va entre corchetes y lo pegas." },
  { q: "Qué recibo exactamente?", a: "Un PDF de 26 páginas que puedes leer en el móvil o imprimir. Lo recibes justo después del pago, junto con el recibo." },
  { q: "La IA cambia cada mes. Se quedará viejo?", a: "Las herramientas cambian, pero los sistemas no. Aun así, lo revisamos y durante 6 meses te enviamos las versiones nuevas al email de la compra." },
  { q: "Es seguro meter datos de mis clientes en una IA?", a: "El kit incluye un capítulo sobre qué no debes poner nunca en una IA y cómo trabajar sin exponer datos de tus clientes. Especialmente importante en clínicas." },
  { q: "Y si no me sirve?", a: "Escríbenos en los primeros 14 días y te devolvemos los 29€. Sin preguntas raras." },
  { q: "Recibo factura?", a: "Sí. Si necesitas factura a nombre de tu negocio, escríbenos con tus datos fiscales después de la compra." },
];

function WaIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Label({ children, className = "text-orange-600" }) {
  return <span className={`inline-block text-xs font-bold tracking-[0.14em] uppercase ${className}`}>{children}</span>;
}

function BotonCompra({ origen, children, className = "" }) {
  return (
    <a
      href={enlaceCompra()}
      target={KIT_STRIPE ? undefined : "_blank"}
      rel={KIT_STRIPE ? undefined : "noopener noreferrer"}
      onClick={() => clickCompra(origen)}
      data-event={`kit-comprar-${origen}`}
      className={`inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 ${className}`}
      style={{ boxShadow: "0 10px 24px -10px rgba(234,88,12,0.7)" }}
    >
      {children}
    </a>
  );
}

function Pregunta({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex justify-between items-start gap-5 text-left py-5 group">
        <span className="font-semibold text-stone-900 text-[15px] leading-snug">{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${open ? "bg-stone-900 border-stone-900 text-white rotate-45" : "border-stone-300 text-stone-500 group-hover:border-stone-900"}`}>
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? "400px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <p className="pb-5 text-stone-600 text-[15px] leading-relaxed pr-10">{a}</p>
      </div>
    </div>
  );
}

function FormPrompts() {
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState("");

  async function enviar(e) {
    e.preventDefault();
    if (!acepto) {
      setEstado("acepta");
      return;
    }
    setEstado("enviando");
    try {
      await guardarLead(email.trim().toLowerCase(), sector);
      evento("Lead", { content_name: "10 prompts", value: 0, currency: "EUR" });
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="bg-white text-stone-900 rounded-2xl p-6">
        <p className="font-bold text-lg mb-1">Listo, aquí los tienes.</p>
        <p className="text-stone-600 text-sm mb-5">Empieza por el prompt 1, el de las reseñas. Es el que más tiempo ahorra la primera semana.</p>
        <a href={PROMPTS_PDF} target="_blank" rel="noopener" download className="inline-flex items-center justify-center w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-4 rounded-xl text-sm transition-colors">
          Descargar los 10 prompts (PDF)
        </a>
        <p className="text-stone-500 text-xs mt-4">
          Cuando quieras el kit completo, son {KIT_PRECIO}€ con garantía de 14 días.{" "}
          <a href="#precio" className="underline underline-offset-2 text-stone-800">Ver el kit</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <input
        type="email"
        required
        maxLength={200}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        aria-label="Tu email"
        className="w-full px-4 py-4 rounded-xl bg-white text-stone-900 placeholder-stone-400 text-[15px] outline-none focus:ring-2 focus:ring-stone-900"
      />
      <select
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        aria-label="Tipo de negocio"
        className="w-full px-4 py-4 rounded-xl bg-white text-stone-900 text-[15px] outline-none focus:ring-2 focus:ring-stone-900"
      >
        <option value="">Tipo de negocio (opcional)</option>
        {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
        <option value="Otro">Otro</option>
      </select>
      <label className="flex items-start gap-2.5 text-[13px] leading-snug text-orange-50 cursor-pointer">
        <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-0.5 w-4 h-4 accent-stone-900 flex-shrink-0" />
        <span>Acepto recibir los prompts y algún email con consejos y ofertas de Kuraianto. Me puedo dar de baja cuando quiera. <Link to="/politicas#privacidad" className="underline underline-offset-2">Privacidad</Link></span>
      </label>
      <button type="submit" disabled={estado === "enviando"} className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-[15px] transition-colors">
        {estado === "enviando" ? "Enviando..." : "Quiero los 10 prompts gratis"}
      </button>
      {estado === "acepta" && <p className="text-sm font-semibold text-white">Marca la casilla para poder enviártelos.</p>}
      {estado === "error" && (
        <p className="text-sm text-white">
          No se ha podido enviar. Prueba otra vez o{" "}
          <a href={`${WA}?text=${encodeURIComponent("Hola, quiero los 10 prompts gratis")}`} className="underline font-semibold">pídelos por WhatsApp</a>.
        </p>
      )}
    </form>
  );
}

function BarraMovil() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent" style={{ transform: show ? "translateY(0)" : "translateY(110%)", transition: "transform 0.3s ease" }}>
      <BotonCompra origen="barra-movil" className="w-full py-4 text-[15px]">Conseguir el kit · {KIT_PRECIO}€</BotonCompra>
    </div>
  );
}

export default function KitIA() {
  useEffect(() => {
    guardarUtm();
    const t = setTimeout(() => evento("ViewContent", { value: KIT_PRECIO, currency: "EUR", content_name: "Kit IA", content_ids: ["kit-ia"], content_type: "product" }), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-[#FAF9F6] text-stone-900">
      <Helmet>
        <title>Kit IA para tu negocio: qué IA usar y cómo, paso a paso | Kuraianto</title>
        <meta name="description" content="Qué IA usar para cada tarea de tu negocio y cómo hacerlo paso a paso. Reseñas, Instagram, WhatsApp, presupuestos y tu web en 1 hora. 29€, descarga inmediata." />
        <link rel="canonical" href="https://kuraianto.com/" />
        <meta property="og:title" content="Kit IA para tu negocio | Kuraianto" />
        <meta property="og:description" content="7 sistemas con prompts listos para copiar: reseñas, Instagram, WhatsApp, presupuestos y tu web en 1 hora." />
        <meta property="og:image" content="https://kuraianto.com/og-kit-ia.png" />
      </Helmet>

      <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-black text-xl tracking-tight">Kuraianto</Link>
          <nav className="flex items-center gap-7">
            <a href="#que-ia" className="hidden md:inline text-sm text-stone-600 hover:text-stone-900">Qué IA usar</a>
            <a href="#incluye" className="hidden md:inline text-sm text-stone-600 hover:text-stone-900">Qué incluye</a>
            <a href="#preguntas" className="hidden md:inline text-sm text-stone-600 hover:text-stone-900">Preguntas</a>
            <a href="#precio" className="bg-stone-900 hover:bg-stone-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">Conseguir el kit</a>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-14 items-center">
        <div>
          <Label>Kit IA para negocios y autónomos</Label>
          <h1 className="text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px] font-black tracking-tight mt-4 mb-6">
            Deja de leer sobre IA. <span className="text-orange-600">Úsala en tu negocio.</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-xl">
            Qué IA usar para cada tarea, cuál es gratis y cómo hacerlo paso a paso. Reseñas, Instagram, WhatsApp, presupuestos y tu web, con todo listo para copiar y pegar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <BotonCompra origen="hero" className="px-7 py-4 text-base">Quiero el kit · {KIT_PRECIO}€</BotonCompra>
            <a href="#gratis" data-event="kit-hero-gratis" className="inline-flex items-center justify-center px-7 py-4 rounded-xl border-2 border-stone-900 font-bold text-base hover:bg-stone-900 hover:text-white transition-colors">
              Empezar con 10 prompts gratis
            </a>
          </div>
          <p className="text-sm text-stone-500 mt-4">{KIT_STRIPE ? "Pago seguro con Stripe · Descarga inmediata" : "Compra por WhatsApp · Te lo enviamos en minutos"} · Garantía de 14 días</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:rotate-[-1.2deg]" style={{ boxShadow: "0 30px 60px -28px rgba(28,25,23,0.35)" }} aria-hidden="true">
          <div className="flex justify-between items-baseline pb-3 border-b border-dashed border-stone-200">
            <span className="font-black text-lg">Tu semana</span>
            <span className="text-xs text-stone-500">sin IA → con el kit</span>
          </div>
          {SEMANA.map((s) => (
            <div key={s.tarea} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3.5 border-b border-stone-100 last:border-0 text-[15px]">
              <span>{s.tarea}</span>
              <s className="text-stone-400">{s.antes}</s>
              <b className="text-orange-600 font-black min-w-[56px] text-right">{s.ahora}</b>
            </div>
          ))}
          <p className="text-[11px] text-stone-400 mt-2">Tiempos orientativos. Dependen de tu negocio.</p>
        </div>
      </section>

      <section className="bg-stone-900 text-stone-100 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl leading-[1.05] mb-12">
            Todo el mundo habla de IA. <span className="text-orange-400">Nadie te dice qué hacer con ella el lunes.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {PROBLEMAS.map((p) => (
              <div key={p.t} className="border-t-2 border-stone-700 pt-5">
                <h3 className="text-xl font-bold mb-2">{p.t}</h3>
                <p className="text-stone-400 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="que-ia" className="max-w-6xl mx-auto px-5 py-20 md:py-24 scroll-mt-16">
        <div className="max-w-2xl mb-10">
          <Label>Qué IA usar para qué</Label>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3 leading-[1.05]">El mapa que te ahorra semanas de pruebas.</h2>
          <p className="text-stone-600 text-lg mt-4">Para cada tarea te decimos qué herramienta usar, cuál es la alternativa y cuándo merece la pena pagar. Con 3 herramientas gratuitas cubres casi todo.</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {MAPA.map((m) => (
            <div key={m.t} className="grid md:grid-cols-[200px_1fr_190px] gap-2 md:gap-6 px-6 py-5 border-b border-stone-200 last:border-0 md:items-center">
              <h3 className="font-bold text-lg">{m.t}</h3>
              <p className="text-stone-600 text-[15px]">{m.d}</p>
              <span className={`justify-self-start text-xs font-bold px-3 py-1.5 rounded-full ${m.pago ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>{m.c}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="incluye" className="max-w-6xl mx-auto px-5 pb-20 md:pb-24 scroll-mt-16">
        <div className="max-w-2xl mb-10">
          <Label>Qué incluye</Label>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3 leading-[1.05]">7 tareas de tu negocio, resueltas con IA.</h2>
          <p className="text-stone-600 text-lg mt-4">No son 1.000 prompts sueltos. Son 7 sistemas completos para las cosas que haces cada semana.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SISTEMAS.map((s) => (
            <div key={s.n} className={`rounded-2xl p-6 border ${s.feature ? "bg-orange-600 border-orange-600 text-white sm:col-span-2 lg:col-span-1" : "bg-white border-stone-200"}`}>
              <span className={`font-black text-sm ${s.feature ? "text-orange-100" : "text-orange-600"}`}>{s.n}</span>
              <h3 className="text-xl font-bold mt-3 mb-2">{s.t}</h3>
              <p className={`text-[15px] leading-relaxed ${s.feature ? "text-orange-50" : "text-stone-600"}`}>{s.d}</p>
            </div>
          ))}
          <div className="rounded-2xl p-6 border border-dashed border-stone-300 sm:col-span-2 lg:col-span-2 flex flex-col justify-center">
            <p className="text-[15px] leading-relaxed text-stone-700">
              <b className="text-stone-900">Cada sistema incluye</b> qué IA usar, los prompts listos para copiar, un ejemplo del resultado y cómo adaptarlo a tu tipo de negocio:
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {SECTORES.map((s) => <span key={s} className="text-sm font-semibold bg-stone-100 rounded-full px-3 py-1.5">{s}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-24">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <Label>Un ejemplo del kit</Label>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 leading-[1.08]">Una reseña de 2 estrellas, respondida en 15 segundos.</h2>
            <p className="text-stone-600 text-lg mt-4">Con el prompt del sistema 1 y la ficha de tu negocio, la IA escribe como tú y no como un robot. Tú solo revisas y publicas.</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">M</span>
                <span className="font-semibold text-sm">Reseña de ejemplo</span>
                <span className="text-orange-500 text-sm tracking-wider">★★<span className="text-stone-300">★★★</span></span>
              </div>
              <p className="text-stone-700 text-[15px]">La comida bien, pero esperamos casi 40 minutos por los segundos y nadie nos dijo nada.</p>
            </div>
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 ml-6">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-400 mb-2">Respuesta con el kit</p>
              <p className="text-[15px] leading-relaxed">Hola Marta, tienes razón: el sábado tardamos demasiado con los segundos y no os avisamos. Desde esta semana, si hay retraso, el camarero avisa en la mesa. Nos encantaría que nos dieras otra oportunidad: escríbenos y te invitamos al postre. Jordi, encargado de sala.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-7">
            <h3 className="text-xl font-bold mb-4">Es para ti si</h3>
            {["Tienes un negocio local o eres autónomo", "Quieres usar IA pero no sabes por dónde empezar", "Has probado ChatGPT y no te ha servido mucho", "Quieres ahorrar horas cada semana, no aprender teoría"].map((x) => (
              <p key={x} className="py-2.5 border-b border-stone-100 last:border-0 text-[15px]">{x}</p>
            ))}
          </div>
          <div className="border border-dashed border-stone-300 rounded-2xl p-7">
            <h3 className="text-xl font-bold mb-4">No es para ti si</h3>
            {["Ya usas IA a diario y la dominas", "Buscas un curso técnico o de programación", "Prefieres que te lo montemos todo (mira abajo)"].map((x) => (
              <p key={x} className="py-2.5 border-b border-stone-100 last:border-0 text-[15px] text-stone-500">{x}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-24">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <Label>Quién está detrás</Label>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 leading-[1.08]">Una agencia que trabaja cada día con negocios locales.</h2>
            <p className="text-stone-600 text-lg mt-4">En Kuraianto hacemos webs, publicidad y automatizaciones para negocios locales. Este kit es lo que usamos nosotros, explicado para que lo apliques tú sin depender de nadie.</p>
          </div>
          <div className="grid gap-3">
            {[["dentalpina.com", "Clínica dental"], ["quaonlab.eu", "Empresa"], ["madatsutcg.com", "Tienda online"]].map(([u, s]) => (
              <a key={u} href={`https://${u}`} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-5 py-5 bg-white border border-stone-200 rounded-xl font-bold hover:border-stone-900 transition-colors">
                {u} <span className="font-normal text-stone-500 text-sm">{s}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="precio" className="max-w-6xl mx-auto px-5 pb-20 md:pb-24 scroll-mt-20">
        <div className="max-w-2xl mb-10">
          <Label>Precio</Label>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3 leading-[1.05]">Hazlo tú, o te lo montamos.</h2>
        </div>
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="bg-white border-2 border-stone-900 rounded-2xl p-7 sm:p-9 flex flex-col" style={{ boxShadow: "0 30px 50px -28px rgba(28,25,23,0.35)" }}>
            <h3 className="text-2xl font-bold">Kit IA para tu negocio</h3>
            <p className="text-6xl font-black tracking-tight mt-4">{KIT_PRECIO}€ <span className="text-lg font-medium text-stone-500 tracking-normal">pago único</span></p>
            <ul className="mt-6 mb-8 flex-1">
              {INCLUYE.map((x) => (
                <li key={x} className="flex gap-3 py-2 text-[15px]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-1 text-orange-600" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {x}
                </li>
              ))}
            </ul>
            <BotonCompra origen="precio" className="w-full py-4 text-base">Comprar y descargar</BotonCompra>
            <p className="text-sm text-stone-500 mt-3 text-center">{KIT_STRIPE ? "Descarga inmediata" : "Por WhatsApp, te lo enviamos en minutos"} · Garantía de 14 días</p>
          </div>
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-7 sm:p-9 flex flex-col">
            <h3 className="text-2xl font-bold">Te lo montamos</h3>
            <p className="text-6xl font-black tracking-tight mt-4">349€ <span className="text-lg font-medium text-stone-400 tracking-normal">desde</span></p>
            <ul className="mt-6 mb-8 flex-1 text-[15px] text-stone-300">
              {["Tu web hecha por nosotros, lista en 7 días", "Automatizaciones de mensajes y formularios", "Asistente para responder a tus clientes", "Tú no tocas nada"].map((x) => (
                <li key={x} className="py-2 border-b border-stone-800 last:border-0">{x}</li>
              ))}
            </ul>
            <a href={`${WA}?text=${encodeURIComponent("Hola, he visto el Kit IA y prefiero que me lo montéis. Mi negocio es: ")}`} target="_blank" rel="noopener noreferrer" data-event="kit-wa-montamos" onClick={() => evento("Contact", { content_name: "Te lo montamos" })} className="inline-flex items-center justify-center gap-2 border-2 border-stone-100 text-stone-100 hover:bg-stone-100 hover:text-stone-900 font-bold py-4 rounded-xl transition-colors">
              <WaIcon /> Hablar por WhatsApp
            </a>
            <p className="text-sm text-stone-500 mt-3 text-center">Te decimos el precio exacto antes de empezar. <Link to="/webs" className="underline underline-offset-2">Ver planes web</Link></p>
          </div>
        </div>
      </section>

      <section id="gratis" className="max-w-6xl mx-auto px-5 pb-20 md:pb-24 scroll-mt-20">
        <div className="bg-orange-600 text-white rounded-3xl p-7 sm:p-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <Label className="text-orange-100">Gratis</Label>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 leading-[1.08]">Empieza con 10 prompts que ahorran horas cada semana.</h2>
            <p className="text-orange-50 text-lg mt-4">Reseñas, Instagram, WhatsApp, presupuestos y tu web. Los descargas al momento.</p>
          </div>
          <FormPrompts />
        </div>
      </section>

      <section id="preguntas" className="max-w-3xl mx-auto px-5 pb-24 scroll-mt-20">
        <Label>Preguntas</Label>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 mb-6">Lo que nos suelen preguntar</h2>
        {FAQ.map((f) => <Pregunta key={f.q} q={f.q} a={f.a} />)}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <BotonCompra origen="faq" className="px-7 py-4 text-base">Conseguir el kit · {KIT_PRECIO}€</BotonCompra>
          <a href={`${WA}?text=${encodeURIComponent("Hola, tengo una duda sobre el Kit IA: ")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-stone-300 font-semibold hover:border-stone-900">
            <WaIcon /> Tengo una duda
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-10 pb-28 md:pb-10 text-sm text-stone-500">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Kuraianto · David Toledo Romero · Hanswijkstraat 74, 2800 Mechelen · BTW BE1036325630</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/kit-ia/condiciones" className="hover:text-stone-900">Condiciones de venta</Link>
            <Link to="/politicas#privacidad" className="hover:text-stone-900">Privacidad</Link>
            <Link to="/politicas#cookies" className="hover:text-stone-900">Cookies</Link>
            <Link to="/webs" className="hover:text-stone-900">Webs para negocios</Link>
          </p>
        </div>
      </footer>

      <BarraMovil />
    </div>
  );
}
