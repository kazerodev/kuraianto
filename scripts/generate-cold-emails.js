require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs   = require("fs");
const path = require("path");
const { readAllLeads, getTodayString } = require("./read-leads");

// ── THIS SCRIPT DOES NOT SEND ANY EMAILS ────────────────────────────────────
// It generates cold-email-ready.csv and email-dashboard.html for manual review.
// ────────────────────────────────────────────────────────────────────────────

const OUTPUT_CSV  = path.join(__dirname, "../data/cold-email-ready.csv");
const OUTPUT_HTML = path.join(__dirname, "../data/email-dashboard.html");

// ── Constants ────────────────────────────────────────────────────────────────

const EXCLUDE_ESTADOS = new Set([
  "Descartado","No interesado","No le interesa","No interesa","Rechazado","Cliente",
]);
const EXCLUDE_NOTES_RE = /no molestar|no contactar|no quiere|no interesado|no interesa/i;

// Domains treated as personal — included in output but marked lower priority
const PERSONAL_DOMAINS = new Set([
  "gmail.com","hotmail.com","hotmail.es","hotmail.fr","hotmail.nl","hotmail.be",
  "yahoo.com","yahoo.es","yahoo.fr","outlook.com","outlook.es","outlook.fr",
  "icloud.com","live.com","live.es","me.com","msn.com","aol.com",
  "googlemail.com","gmx.com","gmx.es","protonmail.com","tutanota.com","mail.com",
]);

// Known typo domains — flagged as suspicious, NOT auto-corrected
const SUSPICIOUS_DOMAINS = new Set([
  // Gmail typos
  "gmial.com","gmai.com","gmali.com","gamil.com","gmal.com",
  "gmail.con","gmail.cm","gmail.co","gmail.vom","gmail.cpm","gmail.cmo",
  // Hotmail typos
  "hotmial.com","hotmai.com","hotmal.com","hotmali.com",
  "hotmail.con","hotmail.cm",
  // Yahoo typos
  "yaho.com","yahooo.com","yhoo.com","yahou.com",
  "yahoo.con","yahoo.cm",
  // Outlook typos
  "outlok.com","outlook.con","outlook.cm","outlookk.com","otlook.com","outiook.com",
  // iCloud typos
  "icloud.con","icloud.cm",
]);

// TLDs that are almost always a typo for .com
const TYPO_TLDS = [".con", ".ocm", ".cpm", ".vom", ".cmo"];

const SUSPICIOUS_LOCALS = new Set(["noreply","no-reply","donotreply","bounce","mailer"]);

// ── Email validation ─────────────────────────────────────────────────────────
// Returns { ok, category, email, reason, flag }
// category: "business" | "personal" | "suspicious" | "invalid"
// ok: false → exclude from output entirely (invalid format / auto-address)
// ok: true  → include with category badge (business / personal / suspicious)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(raw) {
  if (!raw || !raw.trim())
    return { ok: false, category: "invalid", email: "", reason: "Sin email", flag: "empty" };

  const e = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(e))
    return { ok: false, category: "invalid", email: e, reason: "Formato inválido", flag: "invalid" };

  const atIdx = e.indexOf("@");
  const local  = e.slice(0, atIdx);
  const domain = e.slice(atIdx + 1);

  if (SUSPICIOUS_LOCALS.has(local))
    return { ok: false, category: "invalid", email: e, reason: "Dirección automática (" + local + "@)", flag: "suspicious_local" };

  if (SUSPICIOUS_DOMAINS.has(domain))
    return { ok: true, category: "suspicious", email: e,
      reason: "Dominio sospechoso — posible error tipográfico: " + domain, flag: "suspicious_domain" };

  if (TYPO_TLDS.some(tld => domain.endsWith(tld)))
    return { ok: true, category: "suspicious", email: e,
      reason: "TLD sospechoso (¿quiso escribir .com?): " + domain, flag: "suspicious_tld" };

  if (PERSONAL_DOMAINS.has(domain))
    return { ok: true, category: "personal", email: e,
      reason: "Email personal (" + domain + ") — revisar antes de enviar", flag: "personal" };

  return { ok: true, category: "business", email: e, reason: "", flag: "business" };
}

// ── Compliance check ─────────────────────────────────────────────────────────

function complianceCheck(lead) {
  if (EXCLUDE_ESTADOS.has(lead.estado)) return { ok: false, reason: "Estado excluido: " + lead.estado };
  if (EXCLUDE_NOTES_RE.test(lead.notas)) {
    const match = lead.notas.match(EXCLUDE_NOTES_RE);
    return { ok: false, reason: "Notas: \"" + match[0] + "\"" };
  }
  return { ok: true, reason: "" };
}

// ── Template selection ───────────────────────────────────────────────────────

const RESTO_RE   = /restaurante|bar\b|caf[eé]|cafeter[ií]a|tasca|bodega|hostal|comedor|gastro|pizzer[ií]|marisquer[ií]|tapas|asador|parrilla|grill/i;
const CLINIC_RE  = /cl[ií]nica|dental|odonto|m[eé]dico|salud|fisio|psico|veterinari|farmac|óptica/i;
const BEAUTY_RE  = /belleza|peluquer[ií]a|sal[oó]n|est[eé]tica|manicura|pedicura|depilaci|spa\b|nails/i;
const TALLER_RE  = /taller|mec[aá]nico|automóvil|automo[bv]il|coche|veh[ií]culo|motor|carrocer/i;

function selectTemplate(lead) {
  const text = ((lead.sector || "") + " " + (lead.restaurante || "") + " " + (lead.notas || "")).toLowerCase();
  const hasWeb    = !!(lead.web && lead.web.trim());
  const webOldHint = /antigua|vieja|mal|desactualizada|mejorar|renovar|sin responsive|no carga|lenta/i.test(lead.notas || "");
  const noWebHint  = /sin web|no tiene web|no tiene página|no tiene pagina|solo instagram|solo facebook|no aparece/i.test(lead.notas || "");

  if (RESTO_RE.test(text))  return "restaurante";
  if (CLINIC_RE.test(text)) return "clinica";
  if (BEAUTY_RE.test(text)) return "belleza";
  if (TALLER_RE.test(text)) return "taller";
  if (noWebHint || (!hasWeb && lead.sector === "")) return "sin_web";
  if (webOldHint || (hasWeb && lead.notas && /mejorar|renovar|actualizar/i.test(lead.notas))) return "mala_web";
  return "generico";
}

// ── Subject pool ─────────────────────────────────────────────────────────────

const SUBJECTS = [
  (n) => "Idea rápida para la web de " + n,
  (n) => "Demo gratis para " + n,
  (n) => "Una idea para mejorar la web de " + n,
  (n) => "Propuesta rápida para " + n,
];

// ── Body templates ───────────────────────────────────────────────────────────

const SIGNATURE = [
  "",
  "Un saludo,",
  "David",
  "Kuraianto",
  "info@kuraianto.com",
  "+32 485 25 11 10",
  "",
  "Si no te interesa, dime y no te vuelvo a escribir.",
].join("\n");

const TEMPLATES = {

  restaurante: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y quería comentarte algo rápido.",
    "",
    "Muchos restaurantes nos dicen que la gente busca en Google antes de decidir dónde ir a comer. Una web con fotos, la carta visible y un botón de reserva puede marcar la diferencia.",
    "",
    "Ahora mismo estamos haciendo demos gratis para que podáis ver cómo quedaría antes de decidir nada.",
    "",
    "Si te interesa, te preparo una primera idea y te la envío.",
    SIGNATURE,
  ].join("\n"),

  clinica: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y quería proponerte algo.",
    "",
    "Muchas clínicas nos comentan que sus pacientes buscan online antes de pedir cita. Una web con servicios claros, información del equipo y cita por WhatsApp puede hacer mucha diferencia.",
    "",
    "Estamos haciendo demos gratis para que veáis cómo quedaría antes de comprometeros con nada.",
    "",
    "Si te interesa, te preparo una primera idea.",
    SIGNATURE,
  ].join("\n"),

  belleza: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y quería comentarte una idea.",
    "",
    "Los salones con una web clara con sus servicios, fotos y opción de reserva suelen conseguir más clientas nuevas. Es lo que muchas personas buscan antes de probar un sitio nuevo.",
    "",
    "Ahora mismo estamos haciendo demos gratis para que podáis verlo antes de decidir nada.",
    "",
    "Si te interesa, te preparo una primera idea y te la envío.",
    SIGNATURE,
  ].join("\n"),

  taller: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y quería comentarte algo.",
    "",
    "Muchos talleres nos dicen que sus clientes buscan en Google antes de llamar. Una web sencilla con servicios, ubicación y presupuesto por WhatsApp puede ayudar a que os encuentren más fácil.",
    "",
    "Estamos haciendo demos gratis para que veáis cómo quedaría antes de decidir nada.",
    "",
    "Si te interesa, te preparo una primera idea.",
    SIGNATURE,
  ].join("\n"),

  sin_web: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He buscado " + n + " en Google y parece que no tenéis web propia todavía.",
    "",
    "Muchos negocios locales pierden clientes porque la gente no los encuentra online. Con una web sencilla y bien hecha podéis recibir más contactos sin depender solo de Instagram o Facebook.",
    "",
    "Estamos haciendo demos gratis para que veáis cómo quedaría antes de decidir nada.",
    "",
    "Si te interesa, te preparo una primera idea y te la envío sin compromiso.",
    SIGNATURE,
  ].join("\n"),

  mala_web: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y la web que tenéis actualmente.",
    "",
    "A veces una web que no funciona bien en móvil o que tiene información desactualizada puede dar una primera impresión equivocada. Una web clara y moderna puede marcar la diferencia.",
    "",
    "Estamos haciendo demos gratis para que veáis cómo podría quedar una versión actualizada antes de decidir nada.",
    "",
    "Si te interesa, te preparo una primera idea.",
    SIGNATURE,
  ].join("\n"),

  generico: (n) => [
    "Hola,",
    "",
    "Soy David de Kuraianto. He visto " + n + " y quería comentarte una idea rápida.",
    "",
    "Estamos preparando demos gratis para negocios locales, para que podáis ver cómo podría quedar una web más clara y profesional antes de decidir nada.",
    "",
    "No tienes que contratar nada para verla.",
    "",
    "Si te interesa, te puedo preparar una primera idea y enviártela.",
    SIGNATURE,
  ].join("\n"),
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function personalizationReason(lead, template) {
  const parts = [];
  if (template === "sin_web")    parts.push("Sin web detectada");
  if (template === "mala_web")   parts.push("Web antigua o mejorable");
  if (template === "restaurante") parts.push("Restaurante / hostelería");
  if (template === "clinica")    parts.push("Clínica / salud");
  if (template === "belleza")    parts.push("Salón de belleza");
  if (template === "taller")     parts.push("Taller mecánico");
  if (lead.ciudad)               parts.push("Ciudad: " + lead.ciudad);
  if (lead.fuente)               parts.push("Fuente: " + lead.fuente);
  if (lead.web)                  parts.push("Tiene web: " + lead.web);
  return parts.join(" · ") || "Negocio local";
}

function recommendedAction(lead) {
  const hasTel   = !!(lead.telefono && lead.telefono.trim());
  const hasEmail = !!(lead.email && lead.email.trim());
  if (hasTel && hasEmail) return "Enviar email + seguimiento WhatsApp si no responde";
  if (hasEmail)           return "Enviar email — añadir WhatsApp si contestas";
  return "Solo email disponible";
}

function csvEscape(s) {
  const str = String(s || "");
  return (str.includes(",") || str.includes('"') || str.includes("\n"))
    ? '"' + str.replace(/"/g, '""') + '"'
    : str;
}

const EMAIL_CATEGORY_LABEL = { business: "Negocio", personal: "Personal", suspicious: "SOSPECHOSO" };
const EMAIL_PRIORITY        = { business: 1, personal: 2, suspicious: 3 };

// ── HTML dashboard ───────────────────────────────────────────────────────────

function buildDashboard(emails, skipped) {
  const data        = JSON.stringify(emails);
  const skippedData = JSON.stringify(skipped);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kuraianto – Email Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d0d12;color:#dcdce4;min-height:100vh}
.topbar{background:#13131b;border-bottom:1px solid #1e1e2c;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.topbar h1{font-size:15px;font-weight:700;color:#22d3ee}
.topbar small{font-size:11px;color:#555}
.notice{background:#0c1a0c;border-bottom:1px solid #22c55e22;padding:8px 24px;font-size:11px;color:#4ade80}
.stats-row{display:flex;flex-wrap:wrap;gap:8px;padding:10px 24px;background:#0f0f18;border-bottom:1px solid #1a1a24}
.sp{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600}
.sp .n{font-size:14px;font-weight:700}
.sp-tot{background:#0c4a6e22;color:#22d3ee;border:1px solid #22d3ee33}
.sp-pend{background:#78350f22;color:#fb923c;border:1px solid #fb923c33}
.sp-sent{background:#14532d22;color:#4ade80;border:1px solid #4ade8033}
.sp-disc{background:#7f1d1d22;color:#f87171;border:1px solid #f8717133}
.sp-skip{background:#1e1e2c;color:#555;border:1px solid #2a2a3a}
.sp-biz{background:#14532d22;color:#4ade80;border:1px solid #4ade8033}
.sp-per{background:#78350f22;color:#fbbf24;border:1px solid #fbbf2433}
.sp-sus{background:#7f1d1d44;color:#f87171;border:1px solid #f87171aa}
.stats-divider{width:1px;background:#2a2a3a;margin:0 4px}
.filter-bar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 24px;background:#0f0f18;border-bottom:1px solid #1a1a24;align-items:center}
.filter-bar select,.filter-bar input[type=text]{background:#1a1a28;border:1px solid #2a2a3a;border-radius:5px;padding:4px 8px;font-size:11px;color:#c0c0d0;outline:none}
.filter-bar select:focus,.filter-bar input[type=text]:focus{border-color:#22d3ee}
.filter-label{font-size:10px;color:#444;text-transform:uppercase;letter-spacing:.5px}
.btn-sm{padding:4px 10px;border-radius:5px;font-size:11px;background:#1a1a28;border:1px solid #2a2a3a;color:#555;cursor:pointer}
.btn-sm:hover{color:#c0c0d0}
.main{padding:20px 24px;max-width:1100px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.card{background:#13131b;border:1px solid #1e1e2c;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:9px}
.card[data-status=enviado]{border-color:#4ade8044;opacity:.7}
.card[data-status=descartado]{border-color:#f8717144;opacity:.5}
.card-suspicious{border-color:#f87171aa !important}
.card-personal{border-color:#fbbf2444 !important}
.card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.card-name{font-size:14px;font-weight:700;color:#e8e8f0;line-height:1.3}
.card-email-row{display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap}
.card-email{font-size:11px;color:#555}
.et-badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
.et-business{background:#14532d22;color:#4ade80;border:1px solid #4ade8033}
.et-personal{background:#78350f22;color:#fbbf24;border:1px solid #fbbf2433}
.et-suspicious{background:#7f1d1d44;color:#f87171;border:1px solid #f87171aa}
.tpl-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;text-transform:uppercase;letter-spacing:.5px}
.t-restaurante{background:#78350f22;color:#fb923c;border:1px solid #fb923c33}
.t-clinica{background:#0c4a6e22;color:#22d3ee;border:1px solid #22d3ee33}
.t-belleza{background:#4a1d9622;color:#c084fc;border:1px solid #c084fc33}
.t-taller{background:#14532d22;color:#4ade80;border:1px solid #4ade8033}
.t-sin_web{background:#7f1d1d22;color:#f87171;border:1px solid #f8717133}
.t-mala_web{background:#78350f22;color:#fb923c;border:1px solid #fb923c33}
.t-generico{background:#1e293b;color:#94a3b8;border:1px solid #33415544}
.status-badge{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;border:1px solid transparent}
.st-pendiente{background:#1e293b;color:#64748b;border-color:#33415544}
.st-enviado{background:#14532d22;color:#4ade80;border-color:#4ade8033}
.st-descartado{background:#7f1d1d22;color:#f87171;border-color:#f8717133}
.sus-warn{font-size:11px;color:#f87171;background:#7f1d1d22;border:1px solid #f8717155;border-radius:6px;padding:7px 10px;line-height:1.5}
.sus-warn strong{display:block;margin-bottom:2px}
.sus-warn small{font-size:10px;color:#ef4444;opacity:.8}
.per-note{font-size:10px;color:#fbbf24;background:#78350f11;border:1px solid #fbbf2422;border-radius:4px;padding:4px 8px}
.subj{font-size:11px;font-weight:600;color:#e8e8f0;background:#0a0a14;border:1px solid #1a1a28;border-radius:6px;padding:7px 10px}
.body-preview{font-size:11px;color:#8080a0;line-height:1.55;background:#0a0a14;border:1px solid #1a1a28;border-radius:6px;padding:8px 10px;white-space:pre-wrap;max-height:90px;overflow:hidden;cursor:pointer;transition:max-height .3s}
.body-preview.expanded{max-height:500px}
.reason-tag{font-size:10px;color:#4a4a7a;background:#10101e;border:1px solid #1e1e30;border-radius:4px;padding:2px 7px;line-height:1.4}
.action-tag{font-size:10px;color:#6868a0;line-height:1.4}
.btn-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
.btn-copy{flex:1;min-width:80px;padding:6px 4px;border-radius:6px;font-size:11px;font-weight:600;background:#1e1e2e;border:1px solid #2e2e4e;color:#a0a0c0;cursor:pointer;transition:background .15s;text-align:center}
.btn-copy:hover{background:#2a2a44;color:#e2e2e5}
.btn-copy.copied{background:#14532d;border-color:#4ade8033;color:#4ade80}
.btn-mailto{flex:1;min-width:80px;padding:6px 4px;border-radius:6px;font-size:11px;font-weight:700;background:#0c4a6e44;border:1px solid #22d3ee33;color:#22d3ee;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;transition:background .15s}
.btn-mailto:hover{background:#0c4a6e88}
.status-row{display:flex;gap:5px;margin-top:2px}
.btn-status{padding:4px 8px;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:background .15s}
.btn-s-pend{background:#1e293b;color:#64748b;border-color:#33415544}
.btn-s-pend:hover{border-color:#94a3b8;color:#94a3b8}
.btn-s-sent{background:#14532d22;color:#4ade80;border-color:#4ade8033}
.btn-s-sent:hover{background:#14532d44}
.btn-s-disc{background:#7f1d1d22;color:#f87171;border-color:#f8717133}
.btn-s-disc:hover{background:#7f1d1d44}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:none;z-index:200;white-space:nowrap}
.toast.ok{background:#14532d;color:#4ade80;border:1px solid #4ade8033;display:block}
.empty{text-align:center;padding:48px;color:#444}
.empty strong{display:block;font-size:17px;margin-bottom:8px;color:#666}
.skipped-section{margin-top:24px;padding:16px;background:#0f0f18;border:1px solid #1e1e2c;border-radius:10px}
.skipped-section h3{font-size:12px;color:#555;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
.skipped-row{display:flex;gap:8px;font-size:11px;color:#555;padding:4px 0;border-bottom:1px solid #1a1a24}
.skipped-row:last-child{border-bottom:none}
.skipped-row strong{color:#666;flex:2}
.skipped-row span{flex:3;color:#4a4a6a}
</style>
</head>
<body>
<div class="topbar">
  <h1>Kuraianto – Email Dashboard</h1>
  <small id="gen-date">Generado: ${new Date().toLocaleString("es-ES")}</small>
</div>
<div class="notice">⚠ Este dashboard es solo para revisión manual. Ningún email se envía automáticamente. Usa el botón "Abrir email" para enviar desde tu cliente de correo.</div>
<div class="stats-row">
  <span class="sp sp-tot"><span class="n" id="st-tot">0</span> total</span>
  <span class="sp sp-pend"><span class="n" id="st-pend">0</span> pendientes</span>
  <span class="sp sp-sent"><span class="n" id="st-sent">0</span> enviados</span>
  <span class="sp sp-disc"><span class="n" id="st-disc">0</span> descartados</span>
  <div class="stats-divider"></div>
  <span class="sp sp-biz"><span class="n" id="st-biz">0</span> negocio</span>
  <span class="sp sp-per"><span class="n" id="st-per">0</span> personal</span>
  <span class="sp sp-sus"><span class="n" id="st-sus">0</span> sospechosos</span>
  <div class="stats-divider"></div>
  <span class="sp sp-skip"><span class="n" id="st-skip">${skipped.length}</span> excluidos</span>
</div>
<div class="filter-bar">
  <span class="filter-label">Filtro:</span>
  <select id="f-status" onchange="applyFilter()">
    <option value="all">Todos los estados</option>
    <option value="pendiente">Pendiente</option>
    <option value="enviado">Enviado</option>
    <option value="descartado">Descartado</option>
  </select>
  <select id="f-email-type" onchange="applyFilter()">
    <option value="all">Todos los emails</option>
    <option value="business">Solo negocio</option>
    <option value="personal">Solo personal</option>
    <option value="suspicious">Solo sospechosos</option>
  </select>
  <select id="f-tpl" onchange="applyFilter()">
    <option value="all">Todas las plantillas</option>
    <option value="restaurante">Restaurante</option>
    <option value="clinica">Clínica</option>
    <option value="belleza">Belleza</option>
    <option value="taller">Taller</option>
    <option value="sin_web">Sin web</option>
    <option value="mala_web">Web antigua</option>
    <option value="generico">Genérico</option>
  </select>
  <input type="text" id="f-search" placeholder="Buscar negocio o email..." oninput="applyFilter()" style="width:180px">
  <button class="btn-sm" onclick="resetFilter()">Limpiar</button>
</div>
<div class="main">
  <div class="grid" id="grid"></div>
  <div class="skipped-section" id="skipped-section" style="display:none">
    <h3>Excluidos (<span id="skip-count">0</span>)</h3>
    <div id="skipped-list"></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
var ALL=${data};
var SKIPPED=${skippedData};
var KEY="email_dash_status_v2";

function loadStatus(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function saveStatus(s){localStorage.setItem(KEY,JSON.stringify(s));}
function getStatus(id){return loadStatus()[id]||"pendiente";}
function setStatus(id,v){var s=loadStatus();s[id]=v;saveStatus(s);renderGrid();updateStats();}

function tplLabel(t){
  var m={restaurante:"Restaurante",clinica:"Clínica",belleza:"Belleza",taller:"Taller",
         sin_web:"Sin web",mala_web:"Web antigua",generico:"Genérico"};
  return m[t]||t;
}
function etLabel(t){return t==="business"?"Negocio":t==="personal"?"Personal":"Sospechoso";}
function stLabel(s){return s==="pendiente"?"Pendiente":s==="enviado"?"Enviado":"Descartado";}

function applyFilter(){
  var fStatus=document.getElementById("f-status").value;
  var fEmailType=document.getElementById("f-email-type").value;
  var fTpl=document.getElementById("f-tpl").value;
  var fSearch=document.getElementById("f-search").value.toLowerCase();
  var filtered=ALL.filter(function(e){
    var st=getStatus(e.id);
    if(fStatus!=="all"&&st!==fStatus) return false;
    if(fEmailType!=="all"&&e.emailType!==fEmailType) return false;
    if(fTpl!=="all"&&e.template!==fTpl) return false;
    if(fSearch&&!(e.name.toLowerCase().includes(fSearch)||e.email.toLowerCase().includes(fSearch))) return false;
    return true;
  });
  renderGrid(filtered);
}

function resetFilter(){
  document.getElementById("f-status").value="all";
  document.getElementById("f-email-type").value="all";
  document.getElementById("f-tpl").value="all";
  document.getElementById("f-search").value="";
  applyFilter();
}

function renderGrid(list){
  list=list||ALL;
  var g=document.getElementById("grid");
  if(!list.length){g.innerHTML='<div class="empty"><strong>Sin resultados</strong>Ajusta los filtros.</div>';return;}
  g.innerHTML=list.map(function(e){return renderCard(e);}).join("");
}

function renderCard(e){
  var st=getStatus(e.id);
  var mailto="mailto:"+encodeURIComponent(e.email)+"?subject="+encodeURIComponent(e.subject)+"&body="+encodeURIComponent(e.body);
  var cardClass="card";
  if(e.emailType==="suspicious") cardClass+=" card-suspicious";
  else if(e.emailType==="personal") cardClass+=" card-personal";

  var susWarn="";
  if(e.emailType==="suspicious"){
    susWarn='<div class="sus-warn"><strong>⚠ EMAIL SOSPECHOSO — verificar antes de enviar</strong>'+
      '<small>'+esc(e.emailTypeReason)+'</small></div>';
  }
  var perNote="";
  if(e.emailType==="personal"){
    perNote='<div class="per-note">📧 Email personal — revisar antes de enviar</div>';
  }

  return '<div class="'+cardClass+'" data-id="'+esc(e.id)+'" data-status="'+st+'">'+
    '<div class="card-head">'+
      '<div>'+
        '<div class="card-name">'+esc(e.name)+'</div>'+
        '<div class="card-email-row">'+
          '<span class="card-email">'+esc(e.email)+'</span>'+
          '<span class="et-badge et-'+e.emailType+'">'+etLabel(e.emailType)+'</span>'+
        '</div>'+
      '</div>'+
      '<span class="tpl-badge t-'+e.template+'">'+tplLabel(e.template)+'</span>'+
    '</div>'+
    susWarn+
    perNote+
    '<span class="status-badge st-'+st+'" id="badge-'+esc(e.id)+'">'+stLabel(st)+'</span>'+
    '<div class="subj">'+esc(e.subject)+'</div>'+
    '<div class="body-preview" onclick="toggleBody(this)" title="Clic para expandir">'+escPre(e.body)+'</div>'+
    '<div class="reason-tag">'+esc(e.reason)+'</div>'+
    '<div class="action-tag">→ '+esc(e.action)+'</div>'+
    '<div class="btn-row">'+
      '<button class="btn-copy" data-val="'+escAttr(e.subject)+'" onclick="copyField(this)">Copiar asunto</button>'+
      '<button class="btn-copy" data-val="'+escAttr(e.body)+'" onclick="copyField(this)">Copiar mensaje</button>'+
      '<a class="btn-mailto" href="'+mailto+'" target="_blank">✉ Abrir email</a>'+
    '</div>'+
    '<div class="status-row">'+
      '<button class="btn-status btn-s-pend" onclick="setStatus(\''+esc(e.id)+'\',\'pendiente\')">Pendiente</button>'+
      '<button class="btn-status btn-s-sent" onclick="setStatus(\''+esc(e.id)+'\',\'enviado\')">✓ Enviado</button>'+
      '<button class="btn-status btn-s-disc" onclick="setStatus(\''+esc(e.id)+'\',\'descartado\')">✗ Descartar</button>'+
    '</div>'+
    '</div>';
}

function toggleBody(el){el.classList.toggle("expanded");}

function updateStats(){
  var tot=ALL.length,pend=0,sent=0,disc=0,biz=0,per=0,sus=0;
  ALL.forEach(function(e){
    var s=getStatus(e.id);
    if(s==="pendiente") pend++;
    else if(s==="enviado") sent++;
    else disc++;
    if(e.emailType==="business") biz++;
    else if(e.emailType==="personal") per++;
    else if(e.emailType==="suspicious") sus++;
  });
  document.getElementById("st-tot").textContent=tot;
  document.getElementById("st-pend").textContent=pend;
  document.getElementById("st-sent").textContent=sent;
  document.getElementById("st-disc").textContent=disc;
  document.getElementById("st-biz").textContent=biz;
  document.getElementById("st-per").textContent=per;
  document.getElementById("st-sus").textContent=sus;
}

function copyField(btn){
  var text=btn.getAttribute("data-val");
  var orig=btn.textContent;
  navigator.clipboard.writeText(text).then(function(){
    btn.textContent="Copiado";btn.classList.add("copied");
    setTimeout(function(){btn.textContent=orig;btn.classList.remove("copied");},1800);
  }).catch(function(){
    var ta=document.createElement("textarea");ta.value=text;
    ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);
    ta.select();document.execCommand("copy");document.body.removeChild(ta);
    btn.textContent="Copiado";btn.classList.add("copied");
    setTimeout(function(){btn.textContent=orig;btn.classList.remove("copied");},1800);
  });
}

function renderSkipped(){
  if(!SKIPPED.length) return;
  document.getElementById("skipped-section").style.display="block";
  document.getElementById("skip-count").textContent=SKIPPED.length;
  document.getElementById("skipped-list").innerHTML=SKIPPED.map(function(s){
    return '<div class="skipped-row"><strong>'+esc(s.name||"")+'</strong><span>'+esc(s.email||"—")+'</span><span>'+esc(s.reason)+'</span></div>';
  }).join("");
}

function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function escPre(s){return esc(s);}
function escAttr(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

renderGrid();
updateStats();
renderSkipped();
</script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n=== Kuraianto – Generador de emails en frío ===");
  console.log("ESTE SCRIPT NO ENVÍA EMAILS. Genera CSV y dashboard para revisión manual.\n");

  const all   = await readAllLeads();
  const today = getTodayString();
  console.log("Total leads en sheet:", all.length);

  const emailLeads     = [];
  const skipped        = [];
  const templateCounts = {};

  for (const lead of all) {
    const comp = complianceCheck(lead);
    if (!comp.ok) {
      skipped.push({ name: lead.restaurante, email: lead.email, reason: comp.reason, type: "compliance" });
      continue;
    }

    const ev = validateEmail(lead.email);
    if (!ev.ok) {
      if (ev.flag === "empty") continue; // silently skip blanks — too many to list
      skipped.push({ name: lead.restaurante, email: lead.email || "(en blanco)", reason: ev.reason, type: "invalid" });
      continue;
    }

    if (lead.fechaLlamada === today) {
      skipped.push({ name: lead.restaurante, email: ev.email, reason: "Contactado hoy (soft exclusion)", type: "today" });
      continue;
    }

    const template = selectTemplate(lead);
    const name     = lead.restaurante || "vuestro negocio";
    const subject  = SUBJECTS[lead.rowIndex % SUBJECTS.length](name);
    const body     = TEMPLATES[template](name);
    const reason   = personalizationReason(lead, template);
    const action   = recommendedAction(lead);

    templateCounts[template] = (templateCounts[template] || 0) + 1;

    emailLeads.push({
      id:              lead.tab + ":" + lead.rowIndex,
      name:            lead.restaurante || "",
      email:           ev.email,
      emailType:       ev.category,
      emailTypeReason: ev.reason,
      subject,
      body,
      sector:          lead.sector || "",
      city:            lead.ciudad || "",
      web:             lead.web || "",
      source:          lead.fuente || "",
      reason,
      template,
      action,
      status:          "Pendiente",
      tab:             lead.tab,
      rowIndex:        lead.rowIndex,
    });
  }

  // Sort: business first, then personal, then suspicious
  emailLeads.sort((a, b) => EMAIL_PRIORITY[a.emailType] - EMAIL_PRIORITY[b.emailType]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const bizCount = emailLeads.filter(e => e.emailType === "business").length;
  const perCount = emailLeads.filter(e => e.emailType === "personal").length;
  const susCount = emailLeads.filter(e => e.emailType === "suspicious").length;

  console.log("Leads con email aptos:    ", emailLeads.length);
  console.log("  Negocio (prioridad 1):  ", bizCount);
  console.log("  Personal (revisar):     ", perCount);
  console.log("  Sospechosos (verificar):", susCount);
  console.log("Excluidos por compliance: ", skipped.filter(s => s.type === "compliance").length);
  console.log("Excluidos email inválido: ", skipped.filter(s => s.type === "invalid").length);

  if (susCount > 0) {
    console.log("\n⚠  Emails sospechosos — verificar antes de enviar:");
    emailLeads.filter(e => e.emailType === "suspicious").forEach(e => {
      console.log("   " + e.name + " <" + e.email + ">");
      console.log("   → " + e.emailTypeReason);
    });
  }

  if (emailLeads.length > 0) {
    console.log("\nTemplates usadas:");
    Object.entries(templateCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
      console.log("  " + t + ": " + c);
    });
  }

  if (!emailLeads.length) {
    console.log("\nNo hay leads con email válido todavía.");
    console.log("→ Añade emails en la columna K del Google Sheet y vuelve a ejecutar.");
    console.log("→ Consulta OUTREACH_README.md para opciones de enriquecimiento.");
    return;
  }

  // ── Write CSV ──────────────────────────────────────────────────────────────
  const HEADER = [
    "Nombre negocio","Email","Categoría email","Asunto","Cuerpo email",
    "Sector","Ciudad","Web","Fuente",
    "Motivo personalización","Template","Acción recomendada","Estado",
  ];
  const csvLines = [
    HEADER.map(csvEscape).join(","),
    ...emailLeads.map(e => [
      e.name, e.email, EMAIL_CATEGORY_LABEL[e.emailType] || e.emailType,
      e.subject, e.body,
      e.sector, e.city, e.web, e.source,
      e.reason, e.template, e.action, e.status,
    ].map(csvEscape).join(",")),
  ];
  fs.mkdirSync(path.dirname(OUTPUT_CSV), { recursive: true });
  fs.writeFileSync(OUTPUT_CSV, csvLines.join("\n"), "utf8");
  console.log("\n✓ CSV:       data/cold-email-ready.csv (" + emailLeads.length + " filas)");

  // ── Write HTML dashboard ───────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_HTML, buildDashboard(emailLeads, skipped), "utf8");
  console.log("✓ Dashboard: data/email-dashboard.html");

  // ── Sample preview ─────────────────────────────────────────────────────────
  const samples = emailLeads.slice(0, 5);
  console.log("\n── Muestra (" + samples.length + " primeros) ──────────────────────────────────────");
  samples.forEach((e, i) => {
    const typeTag = e.emailType === "suspicious" ? " ⚠ SOSPECHOSO" : e.emailType === "personal" ? " (personal)" : "";
    console.log("\n[" + (i+1) + "] " + e.name + " <" + e.email + ">" + typeTag);
    if (e.emailTypeReason) console.log("    Aviso    : " + e.emailTypeReason);
    console.log("    Asunto   : " + e.subject);
    console.log("    Template : " + e.template);
    console.log("    Acción   : " + e.action);
  });

  console.log("\n── Próximos pasos ───────────────────────────────────────────");
  if (susCount > 0) console.log("1. Revisa los " + susCount + " emails sospechosos en el dashboard (filtro: Solo sospechosos)");
  console.log((susCount > 0 ? "2" : "1") + ". Abre data/email-dashboard.html en el navegador");
  console.log((susCount > 0 ? "3" : "2") + ". Expande el cuerpo del email haciendo clic en él");
  console.log((susCount > 0 ? "4" : "3") + ". Usa 'Abrir email' para enviar desde tu cliente de correo");
  console.log((susCount > 0 ? "5" : "4") + ". Marca cada uno como Enviado o Descartado — se guarda en localStorage");
  console.log("\nNO se ha enviado ningún email.");
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
