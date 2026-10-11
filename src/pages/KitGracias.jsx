import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { KIT_PRECIO, WA, evento, pedirDescarga } from "../lib/kit";

const PASOS = [
  { t: "Descarga el PDF", d: "Guárdalo en el móvil o en el ordenador. El enlace de descarga caduca a los 15 minutos, pero puedes volver a esta página para generar otro." },
  { t: "Rellena tu ficha", d: "Capítulo 02. Son 10 minutos y es lo que hace que la IA escriba como tu negocio." },
  { t: "Empieza por las reseñas", d: "El sistema 1 es el que más tiempo ahorra la primera semana." },
];

const WA_AYUDA = `${WA}?text=${encodeURIComponent("Hola, he comprado el Kit IA y no puedo descargarlo.")}`;

export default function KitGracias() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [estado, setEstado] = useState(sessionId ? "comprobando" : "sin-sesion");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    let activo = true;
    pedirDescarga(sessionId)
      .then((datos) => {
        if (!activo) return;
        setUrl(datos.url);
        setEstado("ok");
        if (datos.nuevo) {
          setTimeout(() => evento("Purchase", { value: KIT_PRECIO, currency: "EUR", content_name: "Kit IA", content_ids: ["kit-ia"], content_type: "product" }, { eventID: sessionId }), 1200);
        }
      })
      .catch(() => activo && setEstado("error"));
    return () => {
      activo = false;
    };
  }, [sessionId]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen px-5 py-16 sm:py-24">
      <Helmet>
        <title>Gracias por tu compra | Kit IA | Kuraianto</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>

      <div className="max-w-xl mx-auto">
        <Link to="/" className="font-black text-xl tracking-tight text-stone-900">Kuraianto</Link>

        {estado === "comprobando" && (
          <div className="mt-12">
            <h1 className="text-3xl font-black tracking-tight text-stone-900">Comprobando tu pago...</h1>
            <p className="text-stone-600 mt-3">Solo tarda unos segundos.</p>
          </div>
        )}

        {(estado === "error" || estado === "sin-sesion") && (
          <div className="mt-12">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 leading-[1.08]">No hemos podido confirmar tu pago desde aquí.</h1>
            <p className="text-stone-600 text-lg mt-4">Si acabas de pagar, no te preocupes: tu compra está registrada en Stripe. Escríbenos por WhatsApp o a info@kuraianto.com con el email de la compra y te enviamos el kit enseguida.</p>
            <a href={WA_AYUDA} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center justify-center w-full sm:w-auto px-7 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors">
              Escribir por WhatsApp
            </a>
          </div>
        )}

        {estado === "ok" && (
          <>
            <div className="mt-12">
              <span className="inline-block text-orange-600 text-xs font-bold tracking-[0.14em] uppercase">Pago confirmado</span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 mt-3 mb-4 leading-[1.05]">Ya tienes tu Kit IA.</h1>
              <p className="text-stone-600 text-lg leading-relaxed">Gracias por confiar en nosotros. Descárgalo ahora: también te llegará el recibo de pago por email.</p>
            </div>

            <a
              href={url}
              rel="noopener noreferrer"
              data-event="kit-descarga"
              onClick={() => evento("Download", { content_name: "Kit IA" })}
              className="mt-8 flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-xl text-base transition-colors"
              style={{ boxShadow: "0 10px 24px -10px rgba(234,88,12,0.7)" }}
            >
              Descargar el Kit IA (PDF, 26 páginas)
            </a>
            <p className="text-stone-500 text-sm mt-3 text-center">Guarda esta página en favoritos si quieres volver a descargarlo.</p>

            <div className="mt-10 bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-stone-500 text-[11px] font-bold uppercase tracking-[0.14em] mb-3">Por dónde empezar</p>
              {PASOS.map((p, i) => (
                <div key={p.t} className="flex gap-4 py-3.5 border-b border-stone-100 last:border-0">
                  <span className="w-7 h-7 rounded-full bg-orange-50 text-orange-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-bold text-stone-900">{p.t}</p>
                    <p className="text-stone-600 text-sm">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 bg-stone-900 text-stone-100 rounded-2xl p-6">
          <p className="font-bold text-lg">Te atascas con algún paso?</p>
          <p className="text-stone-400 text-sm mt-1 mb-5">Escríbenos por WhatsApp y te ayudamos. Y si prefieres que te montemos la web o las automatizaciones, también te lo contamos.</p>
          <a href={`${WA}?text=${encodeURIComponent("Hola, he comprado el Kit IA y tengo una duda: ")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors">
            Escribir por WhatsApp
          </a>
        </div>

        <p className="text-stone-500 text-sm mt-8">
          Si necesitas factura a nombre de tu negocio, escríbenos con tus datos fiscales. Tienes 14 días de garantía: si el kit no te sirve, te devolvemos el dinero. <Link to="/kit-ia/condiciones" className="underline underline-offset-2">Condiciones</Link>
        </p>
      </div>
    </div>
  );
}
