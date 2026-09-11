import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NoEncontrado() {
  return (
    <section className="bg-neutral-950 min-h-[70vh] flex items-center">
      <Helmet>
        <title>Página no encontrada | Kuraianto</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-orange-400 font-black text-[80px] sm:text-[110px] leading-none tracking-tight">
          404
        </p>
        <h1 className="text-white text-3xl sm:text-4xl font-black mt-4">
          Esta página no existe
        </h1>
        <p className="text-neutral-300 mt-4 max-w-md mx-auto">
          O la dirección está mal escrita, o la página cambió de sitio. Desde
          aquí puedes seguir por donde ibas.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            to="/"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            to="/diseno-web"
            className="border border-white/25 hover:border-white/50 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Ver diseño web
          </Link>
          <a
            href="https://wa.me/32485251110?text=Hola%2C%20buscaba%20algo%20en%20la%20web%20y%20no%20lo%20encuentro."
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/25 hover:border-white/50 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Preguntar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
