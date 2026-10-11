import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LangContext";

const SB_URL = "https://eskbissmbhfsnypyugqa.supabase.co";
const SB_KEY = "sb_publishable_9rNW6IW7n2ZEHaWFPVKjzg_lubhaqGp";
const WA = "https://wa.me/32485251110";

const PLANES = {
  starter: "Web Starter (349€)",
  pro: "Web Pro (649€)",
  marketing: "Web + Marketing (1.099€)",
};

const TXT = {
  es: {
    title: "Cuéntanos cómo es tu negocio",
    intro: "Con esto empezamos tu web. Son 5 minutos. Si no sabes algo, déjalo en blanco y lo vemos después.",
    s1: "Tu pedido",
    s2: "Tu negocio",
    s3: "Qué quieres conseguir",
    s4: "Estilo y archivos",
    plan: "Plan que has comprado",
    lang: "Idioma de la web",
    contact: "Tu nombre",
    email: "Tu email (el de la compra)",
    business: "Nombre del negocio",
    sector: "Sector",
    sectorPh: "Restaurante, clínica dental, peluquería, taller...",
    city: "Ciudad y zona",
    address: "Dirección completa",
    maps: "Enlace de Google Maps",
    phone: "Teléfono / WhatsApp del negocio",
    bizEmail: "Email del negocio",
    hours: "Horario",
    hoursPh: "L-V 9:00-19:00, S 10:00-14:00",
    site: "Web actual (si tienes)",
    social: "Instagram / Facebook",
    goal: "Qué es lo más importante que haga la web?",
    goals: ["Que me escriban por WhatsApp", "Que me llamen", "Reservas o citas", "Pedidos o ventas", "Que me conozcan y confíen"],
    services: "Servicios principales",
    servicesPh: "Uno por línea. Con precio si quieres mostrarlo.",
    diff: "Qué te diferencia",
    diffPh: "3 cosas reales: años abiertos, especialidad, idiomas, zona...",
    about: "Sobre el negocio",
    aboutPh: "Quiénes sois, desde cuándo, cómo trabajáis.",
    reviews: "Reseñas reales de Google (opcional)",
    reviewsPh: "Pega 2 a 4 reseñas con el nombre del cliente.",
    colors: "Colores",
    colorsPh: "Por ejemplo: los del logo, azul y blanco...",
    likes: "Webs que te gustan (enlaces)",
    dislikes: "Algo que NO quieres",
    logo: "Logo",
    photos: "Fotos del negocio (hasta 5)",
    filesNote: "Si tus fotos pesan mucho, envíalas después por WhatsApp.",
    consent: "Acepto que Kuraianto use estos datos para crear mi web, según la",
    policy: "política de privacidad",
    send: "Enviar y empezar mi web",
    sending: "Enviando...",
    required: "Obligatorio",
    waText: "Prefiero enviarlo por WhatsApp",
    doneTitle: "Recibido, empezamos con tu web",
    doneText: "Ya tenemos todo para empezar. Te enviaremos un enlace para revisar tu web antes de publicarla. Si nos falta algún dato, te escribimos.",
    doneWa: "Escribir por WhatsApp",
    home: "Volver al inicio",
    errorText: "No se ha podido enviar. Prueba otra vez o mándanos los datos por",
  },
  en: {
    title: "Tell us about your business",
    intro: "This is how we start your website. It takes 5 minutes. If you don't know something, leave it blank and we'll sort it out later.",
    s1: "Your order",
    s2: "Your business",
    s3: "What you want to achieve",
    s4: "Style and files",
    plan: "Plan you bought",
    lang: "Website language",
    contact: "Your name",
    email: "Your email (the one used to pay)",
    business: "Business name",
    sector: "Sector",
    sectorPh: "Restaurant, dental clinic, hair salon, garage...",
    city: "City and area",
    address: "Full address",
    maps: "Google Maps link",
    phone: "Business phone / WhatsApp",
    bizEmail: "Business email",
    hours: "Opening hours",
    hoursPh: "Mon-Fri 9:00-19:00, Sat 10:00-14:00",
    site: "Current website (if any)",
    social: "Instagram / Facebook",
    goal: "What is the most important thing the website should do?",
    goals: ["Get WhatsApp messages", "Get phone calls", "Bookings or appointments", "Orders or sales", "Build trust"],
    services: "Main services",
    servicesPh: "One per line. Add the price if you want to show it.",
    diff: "What makes you different",
    diffPh: "3 real things: years open, specialty, languages, area...",
    about: "About the business",
    aboutPh: "Who you are, since when, how you work.",
    reviews: "Real Google reviews (optional)",
    reviewsPh: "Paste 2 to 4 reviews with the customer's name.",
    colors: "Colours",
    colorsPh: "For example: the logo colours, blue and white...",
    likes: "Websites you like (links)",
    dislikes: "Something you do NOT want",
    logo: "Logo",
    photos: "Photos of your business (up to 5)",
    filesNote: "If your photos are very large, send them later on WhatsApp.",
    consent: "I agree that Kuraianto uses this data to build my website, according to the",
    policy: "privacy policy",
    send: "Send and start my website",
    sending: "Sending...",
    required: "Required",
    waText: "I'd rather send it on WhatsApp",
    doneTitle: "Received, we're starting your website",
    doneText: "We have everything we need. We'll send you a link to review your website before it goes live. If anything is missing, we'll message you.",
    doneWa: "Message us on WhatsApp",
    home: "Back to home",
    errorText: "It couldn't be sent. Try again or send us the details on",
  },
  nl: {
    title: "Vertel ons over je zaak",
    intro: "Hiermee beginnen we aan je website. Het duurt 5 minuten. Weet je iets niet, laat het dan leeg en we bekijken het later.",
    s1: "Je bestelling",
    s2: "Je zaak",
    s3: "Wat wil je bereiken",
    s4: "Stijl en bestanden",
    plan: "Pakket dat je kocht",
    lang: "Taal van de website",
    contact: "Je naam",
    email: "Je e-mail (die van de betaling)",
    business: "Naam van de zaak",
    sector: "Sector",
    sectorPh: "Restaurant, tandartspraktijk, kapper, garage...",
    city: "Stad en regio",
    address: "Volledig adres",
    maps: "Google Maps-link",
    phone: "Telefoon / WhatsApp van de zaak",
    bizEmail: "E-mail van de zaak",
    hours: "Openingsuren",
    hoursPh: "Ma-Vr 9:00-19:00, Za 10:00-14:00",
    site: "Huidige website (als je die hebt)",
    social: "Instagram / Facebook",
    goal: "Wat is het belangrijkste dat de website moet doen?",
    goals: ["WhatsApp-berichten krijgen", "Telefoontjes krijgen", "Reservaties of afspraken", "Bestellingen of verkoop", "Vertrouwen opbouwen"],
    services: "Belangrijkste diensten",
    servicesPh: "Eén per lijn. Met prijs als je die wilt tonen.",
    diff: "Wat maakt je anders",
    diffPh: "3 echte dingen: jaren open, specialiteit, talen, regio...",
    about: "Over de zaak",
    aboutPh: "Wie jullie zijn, sinds wanneer, hoe jullie werken.",
    reviews: "Echte Google-reviews (optioneel)",
    reviewsPh: "Plak 2 tot 4 reviews met de naam van de klant.",
    colors: "Kleuren",
    colorsPh: "Bijvoorbeeld: die van het logo, blauw en wit...",
    likes: "Websites die je mooi vindt (links)",
    dislikes: "Iets wat je NIET wilt",
    logo: "Logo",
    photos: "Foto's van je zaak (max. 5)",
    filesNote: "Zijn je foto's erg groot, stuur ze dan later via WhatsApp.",
    consent: "Ik ga ermee akkoord dat Kuraianto deze gegevens gebruikt om mijn website te maken, volgens het",
    policy: "privacybeleid",
    send: "Versturen en mijn website starten",
    sending: "Versturen...",
    required: "Verplicht",
    waText: "Ik stuur het liever via WhatsApp",
    doneTitle: "Ontvangen, we beginnen aan je website",
    doneText: "We hebben alles om te beginnen. Je krijgt een link om je website te bekijken voor hij online gaat. Ontbreekt er iets, dan sturen we je een bericht.",
    doneWa: "Stuur ons een WhatsApp",
    home: "Terug naar home",
    errorText: "Versturen is niet gelukt. Probeer opnieuw of stuur ons de gegevens via",
  },
  fr: {
    title: "Parlez-nous de votre entreprise",
    intro: "C'est avec ça que nous commençons votre site. Cela prend 5 minutes. Si vous ne savez pas quelque chose, laissez vide et on le verra ensuite.",
    s1: "Votre commande",
    s2: "Votre entreprise",
    s3: "Ce que vous voulez obtenir",
    s4: "Style et fichiers",
    plan: "Offre achetée",
    lang: "Langue du site",
    contact: "Votre nom",
    email: "Votre e-mail (celui du paiement)",
    business: "Nom de l'entreprise",
    sector: "Secteur",
    sectorPh: "Restaurant, cabinet dentaire, coiffeur, garage...",
    city: "Ville et zone",
    address: "Adresse complète",
    maps: "Lien Google Maps",
    phone: "Téléphone / WhatsApp de l'entreprise",
    bizEmail: "E-mail de l'entreprise",
    hours: "Horaires",
    hoursPh: "Lun-Ven 9:00-19:00, Sam 10:00-14:00",
    site: "Site actuel (si vous en avez un)",
    social: "Instagram / Facebook",
    goal: "Quelle est la chose la plus importante que le site doit faire ?",
    goals: ["Recevoir des messages WhatsApp", "Recevoir des appels", "Réservations ou rendez-vous", "Commandes ou ventes", "Inspirer confiance"],
    services: "Services principaux",
    servicesPh: "Un par ligne. Avec le prix si vous voulez l'afficher.",
    diff: "Ce qui vous différencie",
    diffPh: "3 choses réelles : années d'ouverture, spécialité, langues, zone...",
    about: "À propos de l'entreprise",
    aboutPh: "Qui vous êtes, depuis quand, comment vous travaillez.",
    reviews: "Vrais avis Google (facultatif)",
    reviewsPh: "Collez 2 à 4 avis avec le nom du client.",
    colors: "Couleurs",
    colorsPh: "Par exemple : celles du logo, bleu et blanc...",
    likes: "Sites que vous aimez (liens)",
    dislikes: "Quelque chose que vous ne voulez PAS",
    logo: "Logo",
    photos: "Photos de votre entreprise (5 max.)",
    filesNote: "Si vos photos sont très lourdes, envoyez-les ensuite par WhatsApp.",
    consent: "J'accepte que Kuraianto utilise ces données pour créer mon site, selon la",
    policy: "politique de confidentialité",
    send: "Envoyer et lancer mon site",
    sending: "Envoi...",
    required: "Obligatoire",
    waText: "Je préfère l'envoyer par WhatsApp",
    doneTitle: "Bien reçu, nous commençons votre site",
    doneText: "Nous avons tout pour commencer. Nous vous enverrons un lien pour vérifier votre site avant sa mise en ligne. S'il manque quelque chose, nous vous écrirons.",
    doneWa: "Écrire sur WhatsApp",
    home: "Retour à l'accueil",
    errorText: "L'envoi a échoué. Réessayez ou envoyez-nous les informations sur",
  },
};

const IDIOMAS = { es: "Español", en: "English", nl: "Nederlands", fr: "Français" };

const inputCls = "w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors";
const labelCls = "block text-stone-800 text-sm font-medium mb-2";

function Field({ label, name, required, placeholder, type = "text", area, rows = 3, req }) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
        {required && <span className="text-orange-600 ml-1" title={req}>*</span>}
      </label>
      {area ? (
        <textarea id={name} name={name} required={required} placeholder={placeholder} rows={rows} className={inputCls} />
      ) : (
        <input id={name} name={name} type={type} required={required} placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}

function Section({ num, title, first, children }) {
  return (
    <fieldset className={first ? "" : "border-t border-stone-200 pt-8 mt-8"}>
      <legend className="flex items-baseline gap-3 mb-6">
        <span className="text-orange-600 font-black text-sm tabular-nums">{num}</span>
        <span className="text-stone-900 text-lg font-bold">{title}</span>
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
    </fieldset>
  );
}

const CAMPOS = ["plan", "idioma", "contacto", "email", "negocio", "sector", "ciudad", "direccion", "maps", "telefono", "email_negocio", "horario", "web_actual", "redes", "objetivo", "servicios", "diferencias", "sobre", "resenas", "colores", "webs_gustan", "no_quieren"];

const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

function limpiarNombre(n) {
  return n.normalize("NFD").replace(/[^\w.\-]/g, "_").slice(-80);
}

async function subirArchivo(carpeta, tipo, file) {
  const ruta = `${carpeta}/${tipo}-${limpiarNombre(file.name)}`;
  const r = await fetch(`${SB_URL}/storage/v1/object/archivos/${ruta}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!r.ok) throw new Error("archivo");
  return { tipo, nombre: file.name, url: `${SB_URL}/storage/v1/object/public/archivos/${ruta}` };
}

async function enviarPedido(form) {
  const f = new FormData(form);
  const datos = {};
  CAMPOS.forEach((k) => { datos[k] = (f.get(k) || "").toString().trim(); });
  const carpeta = crypto.randomUUID();
  const archivos = [];
  const logo = f.get("logo");
  if (logo && logo.name) archivos.push(await subirArchivo(carpeta, "logo", logo));
  for (const foto of f.getAll("fotos").slice(0, 5)) {
    if (foto && foto.name) archivos.push(await subirArchivo(carpeta, "foto", foto));
  }
  datos.archivos = archivos;
  const r = await fetch(`${SB_URL}/rest/v1/pedidos`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(datos),
  });
  if (!r.ok) throw new Error("pedido");
}

export default function Empezar() {
  const { lang } = useLang();
  const t = TXT[lang] || TXT.es;
  const [params] = useSearchParams();
  const enviado = params.get("enviado") === "1";
  const planUrl = params.get("plan");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      await enviarPedido(e.currentTarget);
      if (window.fbq) window.fbq("track", "CompleteRegistration");
      if (window.dataLayer) window.dataLayer.push({ event: "brief_enviado" });
      window.scrollTo(0, 0);
      navigate("/empezar?enviado=1");
    } catch {
      setError(true);
      setSending(false);
    }
  };

  if (enviado) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex items-center px-5 py-24">
        <Helmet>
          <title>{t.doneTitle} | Kuraianto</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="max-w-lg mx-auto w-full">
          <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mb-8">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 leading-tight">{t.doneTitle}</h1>
          <p className="text-stone-600 leading-relaxed mb-10">{t.doneText}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-4 rounded-full text-sm transition-colors">
              {t.doneWa}
            </a>
            <Link to="/" className="inline-flex items-center justify-center border border-stone-300 text-stone-700 font-semibold px-6 py-4 rounded-full text-sm hover:bg-stone-100 transition-colors">
              {t.home}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen px-5 pt-28 pb-24">
      <Helmet>
        <title>{t.title} | Kuraianto</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 leading-tight mb-4">{t.title}</h1>
        <p className="text-stone-600 leading-relaxed mb-12 max-w-xl">{t.intro}</p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-9"
        >
          <Section num="01" title={t.s1} first>
            <div>
              <label htmlFor="plan" className={labelCls}>{t.plan}<span className="text-orange-600 ml-1">*</span></label>
              <select id="plan" name="plan" required defaultValue={PLANES[planUrl] || ""} className={inputCls}>
                <option value="" disabled>-</option>
                {Object.values(PLANES).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="idioma" className={labelCls}>{t.lang}<span className="text-orange-600 ml-1">*</span></label>
              <select id="idioma" name="idioma" required defaultValue={IDIOMAS[lang] || "Español"} className={inputCls}>
                {Object.values(IDIOMAS).map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <Field label={t.contact} name="contacto" required req={t.required} />
            <Field label={t.email} name="email" type="email" required req={t.required} />
          </Section>

          <Section num="02" title={t.s2}>
            <Field label={t.business} name="negocio" required req={t.required} />
            <Field label={t.sector} name="sector" required placeholder={t.sectorPh} req={t.required} />
            <Field label={t.city} name="ciudad" required req={t.required} />
            <Field label={t.address} name="direccion" />
            <Field label={t.phone} name="telefono" type="tel" required placeholder="+32 ..." req={t.required} />
            <Field label={t.bizEmail} name="email_negocio" type="email" />
            <Field label={t.hours} name="horario" placeholder={t.hoursPh} />
            <Field label={t.maps} name="maps" type="url" placeholder="https://maps.app.goo.gl/..." />
            <Field label={t.site} name="web_actual" placeholder="www..." />
            <Field label={t.social} name="redes" placeholder="@..." />
          </Section>

          <Section num="03" title={t.s3}>
            <div className="sm:col-span-2">
              <label htmlFor="objetivo" className={labelCls}>{t.goal}<span className="text-orange-600 ml-1">*</span></label>
              <select id="objetivo" name="objetivo" required defaultValue="" className={inputCls}>
                <option value="" disabled>-</option>
                {t.goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Field label={t.services} name="servicios" area rows={4} required placeholder={t.servicesPh} req={t.required} />
            </div>
            <div className="sm:col-span-2">
              <Field label={t.diff} name="diferencias" area placeholder={t.diffPh} />
            </div>
            <div className="sm:col-span-2">
              <Field label={t.about} name="sobre" area placeholder={t.aboutPh} />
            </div>
            <div className="sm:col-span-2">
              <Field label={t.reviews} name="resenas" area placeholder={t.reviewsPh} />
            </div>
          </Section>

          <Section num="04" title={t.s4}>
            <Field label={t.colors} name="colores" placeholder={t.colorsPh} />
            <Field label={t.likes} name="webs_gustan" />
            <div className="sm:col-span-2">
              <Field label={t.dislikes} name="no_quieren" />
            </div>
            <div>
              <label htmlFor="logo" className={labelCls}>{t.logo}</label>
              <input id="logo" name="logo" type="file" accept="image/*,.pdf,.svg" className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-700" />
            </div>
            <div>
              <label htmlFor="fotos" className={labelCls}>{t.photos}</label>
              <input id="fotos" name="fotos" type="file" accept="image/*" multiple className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-700" />
            </div>
            <p className="sm:col-span-2 text-stone-500 text-xs -mt-2">{t.filesNote}</p>
          </Section>

          <label className="flex items-start gap-3 mt-10 text-sm text-stone-600 cursor-pointer">
            <input type="checkbox" required className="mt-1 accent-orange-600 w-4 h-4 flex-shrink-0" />
            <span>
              {t.consent}{" "}
              <Link to="/politicas#privacidad" className="text-orange-600 underline underline-offset-2">{t.policy}</Link>.
            </span>
          </label>

          {error && (
            <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {t.errorText}{" "}
              <a href={WA} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">WhatsApp</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-8 w-full bg-orange-600 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-full text-base transition-colors"
          >
            {sending ? t.sending : t.send}
          </button>
        </form>

        <p className="text-center mt-8">
          <a href={WA} target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-stone-800 text-sm underline underline-offset-4">
            {t.waText}
          </a>
        </p>
      </div>
    </div>
  );
}
