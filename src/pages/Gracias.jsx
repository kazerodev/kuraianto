import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const WA_CONFIRM = `https://wa.me/32485251110?text=${encodeURIComponent("Hola, acabo de realizar mi compra en Kuraianto y quiero coordinar el inicio del proyecto.")}`;

export default function Gracias() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "Purchase", { currency: "EUR" });
    }
    if (window.dataLayer) {
      window.dataLayer.push({ event: "purchase" });
    }
  }, []);

  const steps = [
    "Recibirás email de confirmación",
    "Te contactamos en menos de 24 horas",
    "Te enviamos el contrato para firmar",
    "Empezamos con tu proyecto",
  ];

  return (
    <div className="bg-neutral-950 min-h-screen flex items-center justify-center px-5 py-20">
      <Helmet>
        <title>¡Gracias por tu compra! | Kuraianto</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-lg mx-auto text-center w-full">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-8" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.15)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">¡Muchas gracias!</h1>
        <p className="text-neutral-400 text-base leading-relaxed mb-2">
          Hemos recibido tu compra correctamente.
        </p>
        <p className="text-neutral-500 text-sm mb-10">Nos pondremos en contacto contigo en menos de 24 horas.</p>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 mb-8 text-left">
          <p className="text-neutral-500 text-[11px] font-semibold uppercase tracking-widest mb-4">Qué pasa ahora</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3.5 py-3 border-b border-white/[0.05] last:border-0">
              <span className="w-6 h-6 rounded-full bg-orange-500/15 text-orange-400 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-neutral-300 text-sm leading-snug pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={WA_CONFIRM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 20px rgba(34,197,94,0.3)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escribir por WhatsApp
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-white/15 text-neutral-300 font-semibold px-6 py-4 rounded-full text-sm transition-all hover:bg-white/5 hover:border-white/30"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
