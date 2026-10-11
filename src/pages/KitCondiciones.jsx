import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const SECCIONES = [
  {
    h: "1. Quién vende",
    p: "El Kit IA para tu negocio lo vende David Toledo Romero, que trabaja con el nombre comercial Kuraianto. Dirección: Hanswijkstraat 74, 2800 Mechelen, Bélgica. BTW BE1036325630. Contacto: info@kuraianto.com y WhatsApp +32 485 25 11 10.",
  },
  {
    h: "2. Qué compras",
    p: "Un documento digital en formato PDF con una guía práctica para usar herramientas de inteligencia artificial en un negocio, y las versiones actualizadas que publiquemos durante los 6 meses siguientes a la compra. Las actualizaciones se envían al email usado en la compra.",
  },
  {
    h: "3. Precio y pago",
    p: "El precio es de 29€, pago único, sin suscripción. El pago se hace con Stripe. Kuraianto está acogido al régimen de franquicia de pequeñas empresas (art. 56bis del Código del IVA belga), por lo que no se repercute IVA.",
  },
  {
    h: "4. Entrega",
    p: "La descarga está disponible justo después del pago, en la página de confirmación. Si tienes cualquier problema con la descarga, escríbenos y te lo enviamos por email.",
  },
  {
    h: "5. Garantía de 14 días",
    p: "Si el kit no te resulta útil, escríbenos en los 14 días siguientes a la compra y te devolvemos el importe completo, sin necesidad de justificarlo. La devolución se hace al mismo medio de pago.",
  },
  {
    h: "6. Derecho de desistimiento",
    p: "Al tratarse de contenido digital que se entrega de forma inmediata, al completar la compra solicitas que la entrega empiece antes de que termine el plazo legal de desistimiento. Aun así, mantenemos la garantía voluntaria de 14 días descrita en el punto anterior.",
  },
  {
    h: "7. Uso permitido",
    p: "La compra te da una licencia de uso personal, para ti y tu negocio. No está permitido revender, compartir públicamente ni distribuir el documento, en todo o en parte.",
  },
  {
    h: "8. Responsabilidad",
    p: "El kit contiene recomendaciones y ejemplos orientativos. Los tiempos de ahorro indicados son estimaciones y dependen de cada negocio. Las herramientas de terceros que se mencionan pueden cambiar sus funciones, condiciones o precios. Eres responsable de revisar el contenido que generes con inteligencia artificial antes de usarlo. Kuraianto no está afiliado a las marcas mencionadas.",
  },
  {
    h: "9. Factura",
    p: "Si necesitas una factura a nombre de tu negocio, escríbenos con tus datos fiscales y te la enviamos.",
  },
  {
    h: "10. Ley aplicable",
    p: "Estas condiciones se rigen por la legislación belga, sin perjuicio de los derechos que te reconozca la normativa de protección del consumidor de tu país de residencia en la Unión Europea.",
  },
];

export default function KitCondiciones() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen px-5 py-16">
      <Helmet>
        <title>Condiciones de venta del Kit IA | Kuraianto</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="font-black text-xl tracking-tight text-stone-900">Kuraianto</Link>
        <h1 className="text-4xl font-black tracking-tight text-stone-900 mt-10 mb-2">Condiciones de venta</h1>
        <p className="text-stone-500 mb-10">Kit IA para tu negocio · Última actualización: octubre de 2026</p>
        {SECCIONES.map((s) => (
          <div key={s.h} className="mb-7">
            <h2 className="font-bold text-lg text-stone-900 mb-2">{s.h}</h2>
            <p className="text-stone-600 leading-relaxed">{s.p}</p>
          </div>
        ))}
        <Link to="/" className="inline-block mt-6 text-orange-700 font-semibold underline underline-offset-2">Volver al Kit IA</Link>
      </div>
    </div>
  );
}
