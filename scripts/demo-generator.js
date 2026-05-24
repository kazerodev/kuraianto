require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const readline = require("readline");
const fs   = require("fs");
const path = require("path");

const rl  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// ── Helpers ────────────────────────────────────────────────────────────────
function cleanPhone(raw) {
  let p = String(raw || "").replace(/[\s\-\.\(\)]/g, "");
  if (p.startsWith("+")) return p;
  if (p.startsWith("00")) return "+" + p.slice(2);
  if (/^[679]\d{8}$/.test(p)) return "+34" + p;
  if (/^0\d{7,8}$/.test(p)) return "+32" + p.slice(1);
  if (/^34[679]\d{8}$/.test(p)) return "+" + p;
  if (/^32\d{8,9}$/.test(p)) return "+" + p;
  return p;
}

function formatPhoneDisplay(p) {
  const d = p.replace(/\s/g, "");
  if (d.startsWith("+34") && d.length === 12)
    return d.slice(0,3)+" "+d.slice(3,6)+" "+d.slice(6,9)+" "+d.slice(9);
  if (d.startsWith("+32") && d.length >= 11)
    return d.slice(0,3)+" "+d.slice(3,6)+" "+d.slice(6,8)+" "+d.slice(8,10)+" "+d.slice(10);
  const num = d.replace("+","");
  return "+" + num.replace(/(\d{3})(?=\d)/g,"$1 ").trim();
}

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function esc(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function mapsUrl(dir, city) {
  return "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent([dir, city].filter(Boolean).join(", "));
}

function waIconSvg(size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
}

// ── Sector list ────────────────────────────────────────────────────────────
const SECTORS = {
  restaurante: "Restaurante / Bar / Café",
  clinica:     "Clínica dental",
  belleza:     "Peluquería / Salón de belleza",
  taller:      "Taller mecánico",
  generico:    "Negocio local (genérico)",
};

// ── Templates ──────────────────────────────────────────────────────────────
const TEMPLATES = {

  restaurante: {
    accent: "#c23b22", accentDark: "#a33119", accentLight: "#fff4f1",
    heroBg: "linear-gradient(160deg,#0e0500 0%,#1c0900 50%,#080200 100%)",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap",
    headingFont: "'Cormorant Garamond',Georgia,serif",
    bodyFont:    "'Inter',system-ui,sans-serif",

    tagline:        (n,c) => "Restaurante · "+c,
    hero:           (n)   => n,
    heroSub:        "Cocina de verdad, ingredientes de temporada y un ambiente donde merece la pena quedarse.",
    heroCta:        "Reservar mesa",
    heroCtaB:       "Ver la carta",
    heroTrustExtra: "Confirmación inmediata",

    statsItems: [
      {n:"Reservas",  l:"Directo por WhatsApp, sin intermediarios"},
      {n:"Carta",     l:"Menú visible desde cualquier pantalla"},
      {n:"Ubicación", l:"Con enlace directo a Google Maps"},
      {n:"Horario",   l:"Siempre visible y actualizado"},
    ],

    s1Label: "La carta",
    s1Title: "Platos que valen la visita",
    s1Sub:   "Ingredientes frescos, recetas propias y una presentación que entra por los ojos.",
    s1Items: [
      {emoji:"🥗", t:"Entrantes",          d:"Producto de temporada, bien trabajado y listo para compartir. Cambia con la estación."},
      {emoji:"🍖", t:"Platos principales", d:"Carnes y pescados a la brasa, al horno o en salsa. Guarnición siempre incluida."},
      {emoji:"🥂", t:"Vinos y bebidas",    d:"Selección de vinos de la zona y cervezas artesanas. También cócteles sin alcohol."},
      {emoji:"🍮", t:"Postres caseros",    d:"Elaborados cada día en cocina. Sin postres de pastelería industrial: todo es nuestro."},
    ],
    s1Cta: "Reservar mesa →",

    ctaStripTitle: "¿Vienes a comer o a cenar?",
    ctaStripSub:   "Reserva tu mesa en WhatsApp en menos de un minuto. Confirmamos disponibilidad al instante.",
    ctaStripBtn:   "Reservar ahora",

    s2Label: "Por qué volver",
    s2Title: "Lo que nos gusta escuchar",
    s2Desc:  "Cuando la gente repite, sabemos que lo estamos haciendo bien. Eso es lo que buscamos.",
    s2Items: [
      "Cocina en casa, sin congelados ni precocinados",
      "Servicio atento, sin apurar",
      "Ambiente cuidado, sin música a volumen alto",
      "Opciones para celíacos y vegetarianos",
      "Menús especiales para grupos y celebraciones",
    ],
    s2Cta: "Reservar mesa →",

    aboutLabel:    "El restaurante",
    aboutTitle:    "Una cocina con historia",
    aboutText:     "Llevamos años cocinando con un principio claro: buenos ingredientes y recetas que funcionan. Trabajamos con proveedores locales, renovamos la carta con la temporada y tratamos a cada cliente como si fuera la primera vez que viene.",
    aboutImgLabel: "Interior del restaurante",
    aboutCta:      "Escríbenos por WhatsApp →",

    hours: "Lun–Vie 13:00–16:00 y 20:00–23:30 · Sáb–Dom 13:00–23:30",

    contactLabel: "Reservas",
    contactTitle: "Nos vemos pronto",
    callCta:      "Llamar para reservar",

    waMsg: (n) => "Hola, me gustaría reservar una mesa en "+n+". ¿Cuándo tenéis disponibilidad?",
  },

  clinica: {
    accent: "#0069a0", accentDark: "#005785", accentLight: "#e8f6ff",
    heroBg: "linear-gradient(160deg,#000d1a 0%,#001f36 50%,#000810 100%)",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    headingFont: "'Inter',system-ui,sans-serif",
    bodyFont:    "'Inter',system-ui,sans-serif",

    tagline:        (n,c) => "Clínica dental · "+c,
    hero:           (n)   => n,
    heroSub:        "Tratamientos dentales con tecnología avanzada. Tu salud bucal en manos expertas.",
    heroCta:        "Pedir cita",
    heroCtaB:       "Ver tratamientos",
    heroTrustExtra: "Primera consulta sin coste",

    statsItems: [
      {n:"Cita",      l:"Solicitar por WhatsApp en segundos"},
      {n:"Servicios", l:"Tratamientos con descripción clara"},
      {n:"Equipo",    l:"Sección de especialidades visible"},
      {n:"Dirección", l:"Con enlace directo a Google Maps"},
    ],

    s1Label: "Tratamientos",
    s1Title: "Todo lo que necesita tu sonrisa",
    s1Sub:   "Diagnóstico preciso y plan de tratamiento personalizado para cada paciente.",
    s1Items: [
      {emoji:"🦷", t:"Ortodoncia invisible",  d:"Alineadores transparentes. Corrección dental discreta y cómoda, sin aparatos metálicos."},
      {emoji:"✨", t:"Blanqueamiento dental", d:"Resultados visibles desde la primera sesión sin dañar el esmalte ni generar sensibilidad."},
      {emoji:"🔩", t:"Implantes dentales",    d:"Solución permanente y natural para dientes perdidos. Alta tasa de éxito a largo plazo."},
      {emoji:"🩺", t:"Revisión y limpieza",   d:"Prevención y mantenimiento bucal. Detección temprana antes de que los problemas avancen."},
    ],
    s1Cta: "Pedir cita →",

    ctaStripTitle: "¿Cuándo fue tu última revisión?",
    ctaStripSub:   "Pide cita ahora por WhatsApp. Primera consulta gratuita y sin compromiso.",
    ctaStripBtn:   "Pedir cita gratuita",

    s2Label: "Por qué elegirnos",
    s2Title: "Tu salud dental en buenas manos",
    s2Desc:  "Combinamos tecnología de diagnóstico avanzada con un trato cercano y sin tecnicismos.",
    s2Items: [
      "Primera consulta gratuita sin compromiso",
      "Presupuesto detallado antes de empezar",
      "Equipo especializado con formación continua",
      "Tecnología de diagnóstico digital avanzada",
      "Horario flexible con citas en poco tiempo",
    ],
    s2Cta: "Pedir cita →",

    aboutLabel:    "Nuestro equipo",
    aboutTitle:    "Especialistas comprometidos",
    aboutText:     "Somos un equipo de odontólogos con años de experiencia clínica. Nos importa que cada paciente entienda su situación, conozca las opciones y tome decisiones informadas. Sin presiones y sin sorpresas en el presupuesto.",
    aboutImgLabel: "Sala de tratamiento",
    aboutCta:      "Pedir cita por WhatsApp →",

    hours: "Lun–Vie 9:00–14:00 y 15:30–20:00 · Sáb 9:00–14:00",

    contactLabel: "Cita y contacto",
    contactTitle: "Pide tu cita hoy",
    callCta:      "Llamar para pedir cita",

    waMsg: (n) => "Hola, me gustaría pedir cita en "+n+". ¿Cuándo tienen disponibilidad?",
  },

  belleza: {
    accent: "#9a1754", accentDark: "#7e1345", accentLight: "#fdf0f5",
    heroBg: "linear-gradient(160deg,#130010 0%,#220018 50%,#0d000b 100%)",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap",
    headingFont: "'Cormorant Garamond',Georgia,serif",
    bodyFont:    "'Inter',system-ui,sans-serif",

    tagline:        (n,c) => "Salón de belleza · "+c,
    hero:           (n)   => n,
    heroSub:        "Tratamientos profesionales, productos de calidad y un ambiente donde desconectar.",
    heroCta:        "Reservar cita",
    heroCtaB:       "Ver servicios",
    heroTrustExtra: "Citas disponibles esta semana",

    statsItems: [
      {n:"Cita",      l:"Reservar en segundos por WhatsApp"},
      {n:"Servicios", l:"Lista completa con descripciones claras"},
      {n:"Dirección", l:"Enlace directo a Google Maps"},
      {n:"Horario",   l:"Visible en cualquier pantalla"},
    ],

    s1Label: "Servicios",
    s1Title: "Cuídate como mereces",
    s1Sub:   "Cada servicio está pensado para que salgas sintiéndote diferente. Para bien.",
    s1Items: [
      {emoji:"✂️", t:"Corte y peinado",       d:"Cortes personalizados según tu tipo de cabello, forma de rostro y estilo de vida."},
      {emoji:"🎨", t:"Color y mechas",         d:"Técnicas actuales de coloración con productos que respetan y protegen el cabello."},
      {emoji:"💆", t:"Tratamientos capilares", d:"Queratinas, hidratación profunda y tratamientos reparadores para el cabello que mereces."},
      {emoji:"💅", t:"Manicura y pedicura",    d:"Cuidado completo de manos y pies. Acabados que duran más de lo que esperas."},
    ],
    s1Cta: "Reservar cita →",

    ctaStripTitle: "¿A qué estás esperando?",
    ctaStripSub:   "Reserva tu cita en WhatsApp en un momento. Confirmamos disponibilidad al instante.",
    ctaStripBtn:   "Reservar cita",

    s2Label: "Por qué repetir",
    s2Title: "Profesionalidad en cada detalle",
    s2Desc:  "Que te sientas bien cuando salgas no es opcional para nosotros. Es lo que nos importa.",
    s2Items: [
      "Profesionales con formación continua",
      "Productos certificados y de alta gama",
      "Ambiente tranquilo, sin ruido ni prisas",
      "Citas también en fin de semana",
      "Atención personalizada desde el primer día",
    ],
    s2Cta: "Reservar cita →",

    aboutLabel:    "El salón",
    aboutTitle:    "Un espacio hecho para ti",
    aboutText:     "Somos un equipo apasionado por la belleza y el bienestar. Trabajamos para que cada visita sea un momento tuyo: un espacio tranquilo, un trato cercano y un resultado que realmente te guste cuando te veas en el espejo.",
    aboutImgLabel: "Interior del salón",
    aboutCta:      "Reservar por WhatsApp →",

    hours: "Lun–Sáb 9:00–20:00 · Dom con cita previa",

    contactLabel: "Reservas",
    contactTitle: "Estamos aquí para ti",
    callCta:      "Llamar para reservar",

    waMsg: (n) => "Hola, me gustaría reservar cita en "+n+". ¿Cuándo tienen disponibilidad?",
  },

  taller: {
    accent: "#1a40b8", accentDark: "#1535a0", accentLight: "#eef1ff",
    heroBg: "linear-gradient(160deg,#020614 0%,#0b152a 50%,#010410 100%)",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    headingFont: "'Inter',system-ui,sans-serif",
    bodyFont:    "'Inter',system-ui,sans-serif",

    tagline:        (n,c) => "Taller mecánico · "+c,
    hero:           (n)   => n,
    heroSub:        "Diagnóstico rápido, reparaciones con garantía y presupuesto sin coste. Siempre.",
    heroCta:        "Pedir presupuesto",
    heroCtaB:       "Ver servicios",
    heroTrustExtra: "Presupuesto siempre gratuito",

    statsItems: [
      {n:"Presupuesto", l:"Solicitar por WhatsApp, gratis"},
      {n:"Servicios",   l:"Lista completa de reparaciones"},
      {n:"Ubicación",   l:"Enlace directo a Google Maps"},
      {n:"Horario",     l:"Visible en cualquier pantalla"},
    ],

    s1Label: "Servicios",
    s1Title: "Todo lo que necesita tu vehículo",
    s1Sub:   "Mecánica general y especializada, repuestos de calidad y plazo de entrega cumplido.",
    s1Items: [
      {emoji:"🔧", t:"Mecánica general",        d:"Reparación y mantenimiento preventivo y correctivo. Trabajamos con todas las marcas."},
      {emoji:"🖥️", t:"Diagnóstico electrónico", d:"Lectura de errores y análisis completo con equipos de última generación."},
      {emoji:"🛢️", t:"Aceite y filtros",         d:"Aceites y filtros homologados para prolongar la vida útil del motor y reducir consumo."},
      {emoji:"📋", t:"Revisión e ITV",           d:"Puesta a punto completa para pasar la ITV sin sorpresas ni rechazos en cabina."},
    ],
    s1Cta: "Pedir presupuesto →",

    ctaStripTitle: "¿Tu coche necesita atención?",
    ctaStripSub:   "Pide presupuesto gratis por WhatsApp. Sin compromiso y sin coste.",
    ctaStripBtn:   "Pedir presupuesto gratis",

    s2Label: "Por qué elegirnos",
    s2Title: "Tu vehículo en buenas manos",
    s2Desc:  "Te explicamos qué hay que hacer, por qué y cuánto cuesta. Antes de empezar.",
    s2Items: [
      "Presupuesto gratuito y sin compromiso",
      "Técnicos certificados con años de experiencia",
      "Repuestos originales y de calidad garantizada",
      "Entrega en el plazo acordado, siempre",
      "Trabajamos con todas las marcas y modelos",
    ],
    s2Cta: "Pedir presupuesto →",

    aboutLabel:    "El taller",
    aboutTitle:    "Honestidad y experiencia",
    aboutText:     "Somos un taller con un compromiso claro: hacer bien el trabajo, explicarlo sin tecnicismos y cumplir con los plazos. Tu vehículo estará listo cuando te decimos y al precio que acordamos. Sin sorpresas.",
    aboutImgLabel: "El taller",
    aboutCta:      "Escribirnos por WhatsApp →",

    hours: "Lun–Vie 8:00–19:00 · Sáb 8:00–14:00",

    contactLabel: "Ubicación",
    contactTitle: "Encuéntranos",
    callCta:      "Llamar ahora",

    waMsg: (n) => "Hola, necesito traer mi vehículo a "+n+" para una revisión. ¿Cuándo puedo pasar?",
  },

  generico: {
    accent: "#076e66", accentDark: "#065d56", accentLight: "#e6f7f6",
    heroBg: "linear-gradient(160deg,#020f0e 0%,#091f1c 50%,#010c0b 100%)",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    headingFont: "'Inter',system-ui,sans-serif",
    bodyFont:    "'Inter',system-ui,sans-serif",

    tagline:        (n,c) => "En "+c,
    hero:           (n)   => n,
    heroSub:        "Calidad, profesionalidad y comunicación directa. Tu proyecto en manos de personas comprometidas.",
    heroCta:        "Contactar",
    heroCtaB:       "Ver servicios",
    heroTrustExtra: "Respuesta en menos de 24h",

    statsItems: [
      {n:"Contacto",  l:"Formulario y WhatsApp directos"},
      {n:"Servicios", l:"Lista clara de lo que ofrecemos"},
      {n:"Ubicación", l:"Si tienes local, enlace a Maps"},
      {n:"Horario",   l:"Visible en cualquier pantalla"},
    ],

    s1Label: "Servicios",
    s1Title: "Soluciones para tu negocio",
    s1Sub:   "Trabajamos contigo para entender qué necesitas y ofrecerte exactamente eso.",
    s1Items: [
      {emoji:"🎯", t:"Consulta inicial gratuita", d:"Analizamos tu situación y te proponemos la mejor opción. Sin ningún coste."},
      {emoji:"✏️", t:"Servicio personalizado",    d:"Cada cliente es diferente. Adaptamos el trabajo a tus necesidades concretas."},
      {emoji:"⚡", t:"Ejecución rápida",           d:"Nos comprometemos con los plazos y te mantenemos informado en todo momento."},
      {emoji:"🔒", t:"Resultado con garantía",    d:"Transparencia total desde el presupuesto hasta la entrega final del trabajo."},
    ],
    s1Cta: "Contactar →",

    ctaStripTitle: "¿Hablamos sobre tu proyecto?",
    ctaStripSub:   "Cuéntanos qué necesitas por WhatsApp. Te respondemos en menos de 24 horas.",
    ctaStripBtn:   "Contactar ahora",

    s2Label: "Por qué nosotros",
    s2Title: "Lo que nos diferencia",
    s2Desc:  "No solo hacemos el trabajo: nos aseguramos de que el resultado sea lo que esperabas.",
    s2Items: [
      "Presupuesto claro y sin sorpresas",
      "Comunicación directa y transparente",
      "Experiencia contrastada en el sector",
      "Soluciones a medida, no estándar",
      "Seguimiento personalizado del proyecto",
    ],
    s2Cta: "Contactar →",

    aboutLabel:    "Quiénes somos",
    aboutTitle:    "Un equipo comprometido",
    aboutText:     "Somos profesionales con experiencia que trabajan con un objetivo claro: que cada cliente quede satisfecho con el resultado. Nos importa tanto la calidad del trabajo como la relación con las personas que confían en nosotros.",
    aboutImgLabel: "Nuestras instalaciones",
    aboutCta:      "Escríbenos por WhatsApp →",

    hours: null,

    contactLabel: "Contacto",
    contactTitle: "Hablemos de tu proyecto",
    callCta:      "Llamar ahora",

    waMsg: (n) => "Hola, me gustaría más información sobre "+n+". ¿Podemos hablar?",
  },
};

// ── HTML builder ───────────────────────────────────────────────────────────
function buildHTML({ nombre, sectorKey, ciudad, telefono, waNumber, direccion, servicio }) {
  const tpl        = TEMPLATES[sectorKey] || TEMPLATES.generico;
  const waMsg      = tpl.waMsg(nombre);
  const waLink     = "https://wa.me/"+waNumber+"?text="+encodeURIComponent(waMsg);
  const callLink   = "tel:"+telefono;
  const phoneDisp  = formatPhoneDisplay(telefono);
  const year       = new Date().getFullYear();
  const mapsLink   = mapsUrl(direccion, ciudad);
  const a          = tpl.accent;

  // ── Service cards
  const cards = tpl.s1Items.map((item, i) =>
    '<div class="sc anim" style="transition-delay:'+( i*0.07 )+'s">'+
      '<div class="sc-top" style="background:linear-gradient(135deg,'+a+'22 0%,'+a+'08 100%)">'+
        '<span class="sc-emoji">'+item.emoji+'</span>'+
      '</div>'+
      '<div class="sc-bd">'+
        '<h3 class="sc-h">'+esc(item.t)+'</h3>'+
        '<p class="sc-p">'+esc(item.d)+'</p>'+
      '</div>'+
    '</div>'
  ).join("");

  // ── Stats strip
  const stats = tpl.statsItems.map((s, i) =>
    '<div class="stat anim" style="transition-delay:'+( i*0.08 )+'s">'+
      '<strong class="stat-n">'+esc(s.n)+'</strong>'+
      '<span class="stat-l">'+esc(s.l)+'</span>'+
    '</div>'
  ).join("");

  // ── Why-us list
  const trustItems = tpl.s2Items.map((text, i) =>
    '<li class="ti anim" style="transition-delay:'+( i*0.06 )+'s">'+
      '<span class="ti-dot" style="background:'+a+'"></span>'+
      '<span>'+esc(text)+'</span>'+
    '</li>'
  ).join("");

  // ── Hero trust bar
  const heroTrust = [
    ciudad   ? '<span>📍 '+esc(ciudad)+'</span>' : "",
    telefono ? '<span>📞 '+esc(phoneDisp)+'</span>' : "",
    '<span>✓ '+esc(tpl.heroTrustExtra)+'</span>',
  ].filter(Boolean).join("\n    ");

  // ── Image placeholder (about section)
  const imgBg = sectorKey==="restaurante"||sectorKey==="belleza" ? "#f0ece8" : "#eef2f6";
  const imgPlaceholder =
    '<div class="img-ph">'+
      '<div class="img-ph-tint" style="background:linear-gradient(135deg,'+a+'1a 0%,transparent 65%)"></div>'+
      '<div class="img-ph-grid"></div>'+
      '<span class="img-ph-label">'+esc(tpl.aboutImgLabel||"Foto del negocio")+'</span>'+
    '</div>';

  // ── Map block
  const mapBlock = direccion
    ? '<a href="'+mapsLink+'" target="_blank" rel="noopener" class="map-frame" title="Abrir en Google Maps">'+
        '<div class="map-visual">'+
          '<div class="map-grid-lines"></div>'+
          '<div class="map-pin-shape" style="background:'+a+'"></div>'+
        '</div>'+
        '<div class="map-info">'+
          '<div class="map-addr">'+
            '<strong>'+esc(direccion)+'</strong>'+
            (ciudad ? '<span>'+esc(ciudad)+'</span>' : '')+
          '</div>'+
          '<span class="map-open" style="color:'+a+'">Abrir en Google Maps →</span>'+
        '</div>'+
      '</a>'
    : '<div class="map-frame map-no-addr">'+
        '<div class="map-visual">'+
          '<div class="map-grid-lines"></div>'+
          '<div class="map-pin-shape" style="background:'+a+'"></div>'+
        '</div>'+
        '<div class="map-info">'+
          '<strong>'+esc(ciudad||"")+'</strong>'+
        '</div>'+
      '</div>';

  const css = buildCSS(tpl, imgBg);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(nombre)}${ciudad?" – "+esc(ciudad):""}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(tpl.fontUrl)}" rel="stylesheet">
<style>${css}</style>
</head>
<body>

<!-- Demo banner -->
<div class="demo-banner">
  ⚡ Demo creada por <strong>Kuraianto</strong> —
  <a href="https://wa.me/32485251110?text=${encodeURIComponent("Hola, vi la demo de "+nombre+" y me interesa una web así. ¿Hablamos?")}" target="_blank" rel="noopener">Quiero una web así →</a>
</div>

<!-- Nav -->
<nav class="nav" id="nav">
  <a href="#" class="nav-brand">${esc(nombre)}</a>
  <div class="nav-menu">
    <a href="#servicios" class="nav-link">Servicios</a>
    <a href="#nosotros"  class="nav-link">Nosotros</a>
    <a href="#contacto"  class="nav-link">Contacto</a>
    <a href="${waLink}" target="_blank" rel="noopener" class="nav-cta">${waIconSvg(15)} ${esc(tpl.heroCta)}</a>
  </div>
  <a href="${waLink}" target="_blank" rel="noopener" class="nav-mob-wa" aria-label="WhatsApp">
    ${waIconSvg(18)}
  </a>
</nav>

<!-- Hero -->
<section class="hero" style="background:${tpl.heroBg}">
  <div class="hero-glow" style="background:radial-gradient(ellipse 60% 60% at 20% 60%,${a}28 0%,transparent 70%)"></div>
  <div class="wrap hero-wrap">
    <div class="hero-content">
      <p class="hero-tag" style="color:${a}">${esc(tpl.tagline(nombre,ciudad))}</p>
      <h1 class="hero-h1">${esc(tpl.hero(nombre))}</h1>
      <p class="hero-sub">${esc(tpl.heroSub)}</p>
      ${servicio?'<div class="hero-offer" style="border-color:'+a+'44;color:rgba(255,255,255,.85)">✨ '+esc(servicio)+'</div>':""}
      <div class="hero-btns">
        <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa btn-lg">
          ${waIconSvg(20)} ${esc(tpl.heroCta)}
        </a>
        <a href="#servicios" class="btn-ghost btn-lg">${esc(tpl.heroCtaB)} ↓</a>
      </div>
      <div class="hero-trust">
        ${heroTrust}
      </div>
    </div>
    <div class="hero-deco" aria-hidden="true">
      <div class="hd-card hd-c1" style="background:linear-gradient(145deg,${a}30,${a}10);border-color:${a}30"></div>
      <div class="hd-card hd-c2"></div>
      <div class="hd-card hd-c3"></div>
    </div>
  </div>
</section>

<!-- Stats strip -->
<div class="stats-strip">
  <div class="wrap stats-wrap">
    ${stats}
  </div>
</div>

<!-- Services -->
<section id="servicios" class="sec sec-light">
  <div class="wrap">
    <div class="sec-hd anim">
      <span class="sec-label" style="color:${a}">${esc(tpl.s1Label)}</span>
      <h2>${esc(tpl.s1Title)}</h2>
      <p class="sec-sub">${esc(tpl.s1Sub)}</p>
    </div>
    <div class="sc-grid">${cards}</div>
    <div class="sec-cta">
      <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa">${waIconSvg(18)} ${esc(tpl.s1Cta)}</a>
    </div>
  </div>
</section>

<!-- CTA strip -->
<section class="cta-strip" style="background:${a}">
  <div class="wrap cta-strip-in">
    <div class="cta-strip-copy">
      <h3>${esc(tpl.ctaStripTitle)}</h3>
      <p>${esc(tpl.ctaStripSub)}</p>
    </div>
    <a href="${waLink}" target="_blank" rel="noopener" class="btn-cta-strip">
      ${waIconSvg(18)} ${esc(tpl.ctaStripBtn)}
    </a>
  </div>
</section>

<!-- Why us -->
<section class="sec sec-dk">
  <div class="wrap">
    <div class="why-g">
      <div class="why-copy anim">
        <span class="sec-label" style="color:${a}">${esc(tpl.s2Label)}</span>
        <h2>${esc(tpl.s2Title)}</h2>
        <p class="why-sub">${esc(tpl.s2Desc)}</p>
        <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa" style="margin-top:2rem">${waIconSvg(18)} ${esc(tpl.s2Cta)}</a>
      </div>
      <ul class="ti-list">
        ${trustItems}
      </ul>
    </div>
  </div>
</section>

<!-- About -->
<section id="nosotros" class="sec sec-light">
  <div class="wrap">
    <div class="about-g anim">
      ${imgPlaceholder}
      <div class="about-copy">
        <span class="sec-label" style="color:${a}">${esc(tpl.aboutLabel)}</span>
        <h2>${esc(tpl.aboutTitle)}</h2>
        <p class="about-text">${esc(tpl.aboutText)}</p>
        ${servicio?'<div class="about-hl" style="background:'+tpl.accentLight+';border-color:'+a+'">✨ '+esc(servicio)+'</div>':""}
        <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa" style="margin-top:1.75rem">${waIconSvg(18)} ${esc(tpl.aboutCta)}</a>
      </div>
    </div>
  </div>
</section>

<!-- Contact -->
<section id="contacto" class="sec sec-dk">
  <div class="wrap">
    <div class="sec-hd anim">
      <span class="sec-label" style="color:${a}">${esc(tpl.contactLabel)}</span>
      <h2>${esc(tpl.contactTitle)}</h2>
    </div>
    <div class="ct-g">
      <div class="ct-info anim">
        ${direccion?'<div class="ct-row"><span class="ct-ico">📍</span><span>'+esc(direccion)+'</span></div>':""}
        ${telefono ?'<div class="ct-row"><span class="ct-ico">📞</span><a href="'+callLink+'" style="color:'+a+'">'+esc(phoneDisp)+'</a></div>':""}
        <div class="ct-row"><span class="ct-ico">💬</span><a href="${waLink}" target="_blank" rel="noopener" style="color:${a}">Escribir por WhatsApp</a></div>
        ${tpl.hours?'<div class="ct-row ct-hours"><span class="ct-ico">🕐</span><span>'+esc(tpl.hours)+'</span></div>':""}
        <div class="ct-btns">
          ${telefono?'<a href="'+callLink+'" class="btn-ghost-dk">'+esc(tpl.callCta)+'</a>':""}
          <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa">${waIconSvg(16)} WhatsApp</a>
        </div>
      </div>
      ${mapBlock}
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="ft">
  <div class="wrap ft-in">
    <div class="ft-brand-block">
      <span class="ft-brand">${esc(nombre)}</span>
      ${ciudad?'<span class="ft-city">'+esc(ciudad)+'</span>':""}
    </div>
    <nav class="ft-links" aria-label="Footer">
      <a href="#servicios">Servicios</a>
      <a href="#nosotros">Nosotros</a>
      <a href="#contacto">Contacto</a>
      <a href="${waLink}" target="_blank" rel="noopener">WhatsApp</a>
      ${telefono?'<a href="'+callLink+'">Llamar</a>':""}
    </nav>
    <p class="ft-copy">© ${year} ${esc(nombre)} · Demo por <a href="https://kuraianto.com" target="_blank" rel="noopener" style="color:${a}">Kuraianto</a></p>
  </div>
</footer>

<!-- Floating WA button -->
<a href="${waLink}" target="_blank" rel="noopener" class="wa-fab" aria-label="Abrir WhatsApp">
  ${waIconSvg(22)}
  <span class="wa-fab-label">WhatsApp</span>
</a>

<script>
(function(){
  var io = new IntersectionObserver(function(e){
    e.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('vis'); io.unobserve(x.target); } });
  },{threshold:0.1,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.anim').forEach(function(el){ io.observe(el); });
  var nav = document.getElementById('nav');
  window.addEventListener('scroll',function(){ nav.classList.toggle('nav-scrolled',window.scrollY>60); },{passive:true});
})();
</script>
</body>
</html>`;
}

// ── CSS builder ────────────────────────────────────────────────────────────
function buildCSS(tpl, imgBg) {
  const a=tpl.accent, aD=tpl.accentDark, aL=tpl.accentLight;
  return [
// ── Reset & base
"*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
"html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}",
"body{font-family:"+tpl.bodyFont+";color:#1a1a1a;background:#fff;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}",
"a{color:inherit;text-decoration:none}",
"img{max-width:100%;display:block}",

// ── Scroll animation
".anim{opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}",
".anim.vis{opacity:1;transform:none}",

// ── Demo banner
".demo-banner{background:"+a+";color:#fff;text-align:center;font-size:12px;font-family:"+tpl.bodyFont+";padding:8px 16px;line-height:1.4}",
".demo-banner strong{font-weight:700}",
".demo-banner a{color:#fff;text-decoration:underline;font-weight:700;margin-left:5px}",

// ── Nav
".nav{position:sticky;top:0;z-index:200;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(255,255,255,0.95);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.06);transition:box-shadow .2s}",
"@media(min-width:768px){.nav{padding:0 40px}}",
".nav-scrolled{box-shadow:0 2px 20px rgba(0,0,0,0.08)}",
".nav-brand{font-family:"+tpl.headingFont+";font-weight:700;font-size:18px;color:#111;letter-spacing:-.3px;flex-shrink:0;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
".nav-menu{display:none;align-items:center;gap:24px}",
"@media(min-width:768px){.nav-menu{display:flex}}",
".nav-link{font-size:14px;font-weight:500;color:#666;transition:color .15s}",
".nav-link:hover{color:#111}",
".nav-cta{display:inline-flex;align-items:center;gap:7px;background:"+a+";color:#fff!important;padding:8px 18px;border-radius:50px;font-weight:700;font-size:13px;transition:background .15s,transform .15s;white-space:nowrap}",
".nav-cta:hover{background:"+aD+";transform:translateY(-1px)}",
".nav-mob-wa{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:"+a+";color:#fff;flex-shrink:0}",
"@media(min-width:768px){.nav-mob-wa{display:none}}",

// ── Hero
".hero{position:relative;overflow:hidden;min-height:100svh;display:flex;align-items:center;padding:80px 0 60px}",
"@media(min-width:768px){.hero{min-height:96vh;padding:100px 0 80px}}",
".hero-glow{position:absolute;inset:0;pointer-events:none}",
".hero-wrap{display:flex;align-items:center;justify-content:space-between;gap:40px;width:100%;position:relative;z-index:1}",
".hero-content{flex:1;min-width:0;max-width:620px}",
".hero-tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;margin-bottom:20px;display:flex;align-items:center;gap:10px}",
".hero-tag::before{content:'';display:inline-block;width:28px;height:2px;background:currentColor;border-radius:2px;flex-shrink:0}",
".hero-h1{font-family:"+tpl.headingFont+";font-size:clamp(2.6rem,7.5vw,5.2rem);font-weight:700;color:#fff;line-height:1.0;letter-spacing:-1.5px;margin-bottom:22px}",
".hero-sub{font-size:clamp(15px,2vw,17px);color:rgba(255,255,255,.52);max-width:500px;line-height:1.75;margin-bottom:24px}",
".hero-offer{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;margin-bottom:32px;line-height:1.4}",
".hero-btns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:40px}",
"@media(max-width:480px){.hero-btns{flex-direction:column}.hero-btns .btn-wa,.hero-btns .btn-ghost{width:100%;justify-content:center}}",
".hero-trust{display:flex;flex-wrap:wrap;gap:16px 24px;font-size:12px;color:rgba(255,255,255,.3);font-weight:500;padding-top:28px;border-top:1px solid rgba(255,255,255,.07)}",
".hero-trust span{display:inline-flex;align-items:center;gap:5px}",

// ── Hero decorative cards (desktop only)
".hero-deco{position:relative;flex-shrink:0;width:300px;height:340px;display:none}",
"@media(min-width:1100px){.hero-deco{display:block}}",
".hd-card{position:absolute;border-radius:22px;border:1px solid rgba(255,255,255,.07)}",
".hd-c1{width:220px;height:280px;top:0;right:0}",
".hd-c2{width:170px;height:220px;top:55px;right:105px;background:rgba(255,255,255,.03);transform:rotate(-7deg)}",
".hd-c3{width:120px;height:155px;bottom:20px;right:65px;background:rgba(255,255,255,.02);transform:rotate(4deg);border-radius:16px}",

// ── Stats strip
".stats-strip{background:#fff;border-bottom:1px solid #ebebf0}",
".stats-wrap{display:grid;grid-template-columns:repeat(2,1fr);gap:0}",
"@media(min-width:640px){.stats-wrap{grid-template-columns:repeat(4,1fr)}}",
".stat{display:flex;flex-direction:column;align-items:center;text-align:center;padding:22px 16px;border-right:1px solid #ebebf0}",
".stat:last-child{border-right:none}",
"@media(max-width:639px){.stat:nth-child(2){border-right:none}.stat:nth-child(3){border-top:1px solid #ebebf0}.stat:nth-child(4){border-top:1px solid #ebebf0;border-right:none}}",
".stat-n{font-family:"+tpl.headingFont+";font-size:clamp(1.4rem,3vw,1.9rem);font-weight:700;color:#111;line-height:1;letter-spacing:-.5px}",
".stat-l{font-size:12px;color:#888;margin-top:4px;line-height:1.3}",

// ── Sections
".sec{padding:72px 0}",
"@media(min-width:768px){.sec{padding:96px 0}}",
".sec-light{background:#f8f8fa}",
".sec-dk{background:#0c0c13;color:#fff}",
".wrap{max-width:1080px;margin:0 auto;padding:0 20px}",
"@media(min-width:768px){.wrap{padding:0 40px}}",
".sec-hd{text-align:center;margin-bottom:56px}",
".sec-label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.24em;margin-bottom:12px}",
"h2{font-family:"+tpl.headingFont+";font-size:clamp(1.75rem,3.8vw,2.6rem);font-weight:700;letter-spacing:-.4px;line-height:1.15;color:#111;margin-bottom:14px}",
".sec-dk h2{color:#fff}",
".sec-sub{font-size:15px;color:#777;max-width:480px;margin:0 auto;line-height:1.7}",
".sec-dk .sec-sub{color:rgba(255,255,255,.4)}",
".sec-cta{text-align:center;margin-top:48px}",

// ── Service cards
".sc-grid{display:grid;grid-template-columns:1fr;gap:16px}",
"@media(min-width:560px){.sc-grid{grid-template-columns:1fr 1fr}}",
"@media(min-width:900px){.sc-grid{grid-template-columns:repeat(4,1fr)}}",
".sc{background:#fff;border:1px solid #e8e8ee;border-radius:18px;overflow:hidden;transition:all .2s;display:flex;flex-direction:column}",
".sc:hover{border-color:"+a+"44;box-shadow:0 8px 32px "+a+"12;transform:translateY(-3px)}",
".sc-top{height:96px;display:flex;align-items:center;justify-content:center;font-size:38px;flex-shrink:0}",
".sc-bd{padding:20px 20px 24px;flex:1;display:flex;flex-direction:column}",
".sc-h{font-family:"+tpl.headingFont+";font-size:16px;font-weight:700;color:#111;margin-bottom:8px;line-height:1.25}",
".sc-p{font-size:13px;color:#777;line-height:1.65;flex:1}",

// ── CTA strip
".cta-strip{padding:52px 0}",
".cta-strip-in{display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap}",
"@media(max-width:640px){.cta-strip-in{flex-direction:column;align-items:flex-start}}",
".cta-strip-copy h3{font-family:"+tpl.headingFont+";font-size:clamp(1.3rem,3vw,1.75rem);font-weight:700;color:#fff;line-height:1.2}",
".cta-strip-copy p{font-size:14px;color:rgba(255,255,255,.7);margin-top:6px;max-width:460px;line-height:1.5}",
".btn-cta-strip{display:inline-flex;align-items:center;gap:9px;background:#fff;color:"+a+";font-weight:700;font-size:14px;padding:14px 26px;border-radius:50px;white-space:nowrap;flex-shrink:0;transition:all .2s}",
".btn-cta-strip:hover{background:rgba(255,255,255,.9);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.2)}",
"@media(max-width:640px){.btn-cta-strip{width:100%;justify-content:center}}",

// ── Buttons
".btn-wa{display:inline-flex;align-items:center;gap:9px;background:#25d366;color:#fff;font-weight:700;font-size:14px;padding:13px 24px;border-radius:50px;transition:all .2s;white-space:nowrap;text-decoration:none;border:none;cursor:pointer}",
".btn-wa:hover{background:#1fba59;transform:translateY(-1px);box-shadow:0 8px 24px rgba(37,211,102,.35)}",
".btn-lg{padding:15px 28px;font-size:15px}",
".btn-ghost{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);color:#fff;font-weight:600;font-size:14px;padding:13px 22px;border-radius:50px;border:1px solid rgba(255,255,255,.14);transition:all .2s;white-space:nowrap;text-decoration:none}",
".btn-ghost:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.26)}",
".btn-ghost-dk{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);font-weight:600;font-size:13px;padding:12px 22px;border-radius:50px;border:1px solid rgba(255,255,255,.1);transition:all .2s;white-space:nowrap;text-decoration:none}",
".btn-ghost-dk:hover{background:rgba(255,255,255,.09);color:#fff}",

// ── Why us
".why-g{display:grid;grid-template-columns:1fr;gap:40px}",
"@media(min-width:768px){.why-g{grid-template-columns:1fr 1fr;gap:80px;align-items:start}}",
".why-copy h2{color:#fff}",
".why-sub{font-size:15px;color:rgba(255,255,255,.45);line-height:1.75;margin-top:14px}",
".ti-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:16px}",
"@media(min-width:768px){.ti-list{padding-top:8px}}",
".ti{display:flex;align-items:flex-start;gap:13px;font-size:15px;color:rgba(255,255,255,.72);line-height:1.55}",
".ti-dot{flex-shrink:0;width:7px;height:7px;border-radius:50%;margin-top:7px}",

// ── About
".about-g{display:grid;grid-template-columns:1fr;gap:40px;align-items:center}",
"@media(min-width:768px){.about-g{grid-template-columns:1fr 1fr;gap:72px}}",
".img-ph{position:relative;aspect-ratio:5/4;border-radius:20px;overflow:hidden;background:"+imgBg+";flex-shrink:0}",
".img-ph-tint{position:absolute;inset:0}",
".img-ph-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);background-size:32px 32px}",
".img-ph-label{position:absolute;bottom:16px;left:16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:rgba(0,0,0,.25)}",
".about-copy h2{color:#111}",
".about-text{font-size:15px;color:#555;line-height:1.82;margin-top:12px}",
".about-hl{margin-top:20px;border-left:3px solid "+a+";padding:11px 15px;border-radius:4px;font-size:14px;font-weight:500;color:#333}",

// ── Contact
".ct-g{display:grid;grid-template-columns:1fr;gap:32px}",
"@media(min-width:768px){.ct-g{grid-template-columns:1fr 1fr;gap:48px;align-items:start}}",
".ct-info{display:flex;flex-direction:column;gap:18px}",
".ct-row{display:flex;align-items:flex-start;gap:13px;font-size:15px;color:rgba(255,255,255,.65);line-height:1.5}",
".ct-ico{font-size:18px;flex-shrink:0;margin-top:1px}",
".ct-hours{color:rgba(255,255,255,.45);font-size:13px}",
".ct-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}",
"@media(max-width:480px){.ct-btns{flex-direction:column}.ct-btns .btn-wa,.ct-btns .btn-ghost-dk{width:100%;justify-content:center}}",

// ── Map frame
".map-frame{display:block;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);cursor:pointer;transition:all .2s;text-decoration:none}",
".map-frame:hover{border-color:rgba(255,255,255,.16);box-shadow:0 4px 24px rgba(0,0,0,.3)}",
".map-no-addr{cursor:default}",
".map-visual{height:150px;background:#141e2c;position:relative;overflow:hidden}",
".map-grid-lines{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:60px 60px,60px 60px,15px 15px,15px 15px}",
".map-pin-shape{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%) rotate(-45deg);width:28px;height:28px;border-radius:50% 50% 50% 0;box-shadow:0 4px 16px rgba(0,0,0,.4)}",
".map-pin-shape::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:#fff;border-radius:50%}",
".map-info{padding:14px 16px;background:rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;gap:12px}",
".map-addr{display:flex;flex-direction:column;gap:2px}",
".map-addr strong{font-size:14px;color:rgba(255,255,255,.8);font-weight:600;line-height:1.3}",
".map-addr span{font-size:12px;color:rgba(255,255,255,.4)}",
".map-open{font-size:12px;font-weight:600;white-space:nowrap;flex-shrink:0}",

// ── Footer
".ft{background:#07070e;padding:40px 0;border-top:1px solid rgba(255,255,255,.04)}",
".ft-in{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:24px}",
".ft-brand-block{display:flex;flex-direction:column;gap:3px}",
".ft-brand{font-family:"+tpl.headingFont+";font-size:16px;font-weight:700;color:#fff}",
".ft-city{font-size:12px;color:#3a3a4a}",
".ft-links{display:flex;flex-wrap:wrap;gap:16px 20px;font-size:13px;color:#444}",
".ft-links a:hover{color:#999;transition:color .15s}",
".ft-copy{font-size:11px;color:#252535;width:100%;padding-top:18px;border-top:1px solid rgba(255,255,255,.03);text-align:center}",

// ── Floating WA
".wa-fab{position:fixed;bottom:24px;right:20px;z-index:999;display:inline-flex;align-items:center;gap:9px;background:#25d366;color:#fff;font-weight:700;font-size:13px;padding:13px 20px;border-radius:50px;box-shadow:0 4px 20px rgba(37,211,102,.5);transition:all .2s;text-decoration:none}",
".wa-fab:hover{background:#1fba59;transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,.55)}",
"@media(max-width:480px){.wa-fab-label{display:none}.wa-fab{padding:14px;border-radius:50%}}",
"@media(max-width:768px){.wa-fab{bottom:20px;right:16px}}",

  ].join("");
}

// ── Main ───────────────────────────────────────────────────────────────────
function parseFlags(args) {
  const m = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i+1] && !args[i+1].startsWith("--"))
      m[args[i].slice(2)] = args[++i];
  }
  return m;
}

async function main() {
  const args  = process.argv.slice(2);
  const flags = parseFlags(args);

  // ── Non-interactive mode: --nombre "X" --sector restaurante --ciudad "Y" --tel "Z" --dir "A" --oferta "B"
  if (flags.nombre) {
    rl.close();
    const sectorKeys = Object.keys(SECTORS);
    const si = flags.sector || "generico";
    const sNum = parseInt(si, 10);
    const sectorKey = (!isNaN(sNum) && sNum>=1 && sNum<=sectorKeys.length)
      ? sectorKeys[sNum-1]
      : sectorKeys.find((k) => k === si || k.startsWith(si)) || "generico";
    const nombre   = flags.nombre;
    const ciudad   = flags.ciudad || "tu ciudad";
    const rawPhone = flags.tel || flags.telefono || "";
    const rawDir   = flags.dir || flags.direccion || "";
    const servicio = flags.oferta || "";
    const telefono = cleanPhone(rawPhone);
    const waNumber = telefono.replace(/\+/g,"").replace(/\s/g,"");
    const slug     = slugify(nombre) || "demo";
    const outDir   = path.join(__dirname,"../demos",slug);
    fs.mkdirSync(outDir, { recursive: true });
    const html = buildHTML({ nombre, sectorKey, ciudad, telefono, waNumber, direccion: rawDir, servicio });
    fs.writeFileSync(path.join(outDir,"index.html"), html, "utf8");
    const relPath = "demos\\"+slug+"\\index.html";
    console.log("\n✓ Demo lista: "+relPath);
    console.log("  start "+relPath);
    return;
  }

  let prefilled = null;

  const rowIdx = args.indexOf("--row");
  if (rowIdx !== -1 && args[rowIdx+1]) {
    const rowNum = parseInt(args[rowIdx+1], 10);
    console.log("\nCargando lead de la fila "+rowNum+"...");
    try {
      const { readAllLeads } = require("./read-leads");
      const all  = await readAllLeads();
      const lead = all.find((l) => l.rowIndex === rowNum);
      if (!lead) { console.error("No se encontró lead en fila "+rowNum); process.exit(1); }
      prefilled = { nombre: lead.restaurante, telefono: lead.telefono, direccion: lead.direccion };
      console.log("Lead: "+lead.restaurante+" · "+lead.telefono);
    } catch (err) {
      console.error("No se pudo leer el sheet:", err.message);
    }
  }

  console.log("\n=== Kuraianto – Demo Generator ===\n");

  const nombre = prefilled
    ? (await ask("Nombre del negocio ["+prefilled.nombre+"]: ")).trim() || prefilled.nombre
    : (await ask("Nombre del negocio: ")).trim() || "Mi Negocio";

  console.log("\nSectores:");
  const sectorKeys = Object.keys(SECTORS);
  sectorKeys.forEach((k,i) => console.log("  "+(i+1)+". "+SECTORS[k]));
  const si = (await ask("Elige un sector (1-"+sectorKeys.length+"): ")).trim();
  const sNum = parseInt(si, 10);
  const sectorKey = (!isNaN(sNum) && sNum>=1 && sNum<=sectorKeys.length)
    ? sectorKeys[sNum-1]
    : sectorKeys.find((k) => k.startsWith(si.toLowerCase())) || "generico";

  const ciudad   = (await ask("Ciudad: ")).trim() || "tu ciudad";
  const rawPhone = prefilled
    ? (await ask("Teléfono / WhatsApp ["+prefilled.telefono+"]: ")).trim() || prefilled.telefono
    : (await ask("Teléfono / WhatsApp: ")).trim();
  const rawDir   = prefilled
    ? (await ask("Dirección ["+( prefilled.direccion||"sin dirección")+"]: ")).trim() || prefilled.direccion
    : (await ask("Dirección (opcional): ")).trim();
  const servicio = (await ask("Oferta o servicio especial (opcional): ")).trim();

  rl.close();

  const telefono = cleanPhone(rawPhone);
  const waNumber = telefono.replace(/\+/g,"").replace(/\s/g,"");
  const slug     = slugify(nombre) || "demo";
  const outDir   = path.join(__dirname,"../demos",slug);

  fs.mkdirSync(outDir, { recursive: true });
  const html     = buildHTML({ nombre, sectorKey, ciudad, telefono, waNumber, direccion: rawDir, servicio });
  const htmlPath = path.join(outDir,"index.html");
  fs.writeFileSync(htmlPath, html, "utf8");

  const relPath = "demos\\"+slug+"\\index.html";
  console.log("\n✓ Demo lista!\n");
  console.log("  "+nombre+" · "+SECTORS[sectorKey]+" · "+ciudad);
  console.log("  Archivo: "+relPath+"\n");
  console.log("Abrir:");
  console.log("  start "+relPath);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  rl.close();
  process.exit(1);
});
