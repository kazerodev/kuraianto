require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { readAllLeads, filterLeads } = require("./read-leads");

const WA_BASE = "https://wa.me/";
const OUTPUT_CSV = path.join(__dirname, "outreach-ready.csv");
const OUTPUT_HTML = path.join(__dirname, "dashboard.html");

// ---------------------------------------------------------------------------
// Phone cleaning
// ---------------------------------------------------------------------------
function cleanPhone(raw) {
  let phone = raw.replace(/[\s\-\.\(\)]/g, "");
  if (phone.startsWith("+")) return { number: phone, status: "ok" };
  if (phone.startsWith("00")) return { number: "+" + phone.slice(2), status: "ok" };
  if (/^[679]\d{8}$/.test(phone)) return { number: "+34" + phone, status: "ok" };
  if (/^0\d{7,8}$/.test(phone)) return { number: "+32" + phone.slice(1), status: "ok" };
  if (/^34[679]\d{8}$/.test(phone)) return { number: "+" + phone, status: "ok" };
  if (/^32\d{8,9}$/.test(phone)) return { number: "+" + phone, status: "ok" };
  return { number: phone, status: "needs review" };
}

// ---------------------------------------------------------------------------
// Discard filter (notes keywords)
// ---------------------------------------------------------------------------
const DISCARD_NOTES_RE =
  /no interesa(do)?|no le interesa|no quiere|no molestar|no llamar|ya tiene web|no necesita/i;

// ---------------------------------------------------------------------------
// Restaurant/bar/café detection
// ---------------------------------------------------------------------------
const RESTO_RE = /\b(restaurante|rest\b|bar\b|caf[eé]|cafeter[ií]a|tasca|taberna|bodega|mes[oó]n|hostal|pub\b|bistro|brasserie|cantina|cervecer[ií]a|tapas|marisquer[ií]a|asador|parrilla|grill|pizzer[ií]a|pizza|kebab|sushi|comedor|gastro|heladería|pastelería|panadería|churrería|hamburgues[ae]ría)\b/i;

function isResto(lead) {
  return RESTO_RE.test(lead.restaurante);
}

// ---------------------------------------------------------------------------
// Never-contacted detection
// ---------------------------------------------------------------------------
function isNeverContacted(lead) {
  // "Pendiente" is the sheet's default estado — Contestado="No" is pre-filled, not real contact
  const isPendiente = !lead.estado || lead.estado.trim() === "" ||
                      lead.estado === "Pendiente" || lead.estado === "Sin contactar";
  const noIntento = !lead.intento || lead.intento === 0;
  const noFecha   = !lead.fechaLlamada || lead.fechaLlamada.trim() === "";
  return isPendiente && noIntento && noFecha;
}

// ---------------------------------------------------------------------------
// Message templates — 14 total across 6 categories
// Rotation: deterministic by rowIndex so output is consistent across reruns
// ---------------------------------------------------------------------------
const TEMPLATES = {

  interesado: [
    {
      id: "interesado_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto. Hablamos hace poco sobre la web de ${n}. Te escribo porque puedo prepararte una demo gratis para que veas una primera idea antes de decidir nada. ¿Te gustaría que la prepare?`,
    },
    {
      id: "interesado_B",
      fn: (n) =>
        `Hola, soy David de Kuraianto 😊 Hablamos hace unos días sobre ${n}. Sigo aquí por si quieres que prepare esa demo gratis. La verías antes de comprometerte con nada. ¿Te parece?`,
    },
    {
      id: "interesado_C",
      fn: (n) =>
        `Hola, soy David de Kuraianto. Te escribo por ${n} porque seguimos con las demos gratuitas para negocios locales. Si tienes 10 minutos me gustaría mostrarte una primera idea. Sin compromiso. ¿Cuándo te viene bien?`,
    },
  ],

  volver_llamar: [
    {
      id: "volver_llamar_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto 👋 Te llamé hace poco por el tema de la web de ${n}. Quizá no era buen momento. Si quieres te puedo preparar una demo gratis y la ves sin compromiso.`,
    },
    {
      id: "volver_llamar_B",
      fn: (n) =>
        `Hola, soy David de Kuraianto. Intenté llamar a ${n} hace unos días pero no pude contactar. Te escribo por aquí por si es más cómodo. Hacemos demos gratis para negocios locales. ¿Te interesa echarle un vistazo?`,
    },
    {
      id: "volver_llamar_C",
      fn: (n) =>
        `Hola, soy David de Kuraianto 📲 Llamé para hablar sobre la web de ${n} pero no era buen momento. Te dejo esto por aquí: si en algún momento quieres ver cómo podría quedar vuestra web, te preparo una demo gratis en pocos días.`,
    },
  ],

  sin_contactar: [
    {
      id: "sin_contactar_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto 👋 He visto ${n} y quería comentarte una idea rápida. Estamos preparando demos gratis para negocios locales, para que veáis cómo podría quedar vuestra web antes de decidir nada. ¿Te interesa que te prepare una primera idea?`,
    },
    {
      id: "sin_contactar_B",
      fn: (n) =>
        `Hola, soy David de Kuraianto. He visto ${n} y creo que podría ayudaros a recibir más contactos con una web sencilla. Ahora mismo hacemos demos gratis antes de contratar nada. ¿Te parece si te preparo una idea rápida? 😊`,
    },
    {
      id: "sin_contactar_C",
      fn: (n) =>
        `Hola 👋 Soy David de Kuraianto. He visto ${n} y quería comentaros una cosa. Estamos haciendo demos web gratuitas para negocios locales, sin compromiso, para que podáis ver cómo quedaría antes de decidir. ¿Os interesa echarle un vistazo?`,
    },
  ],

  restaurante: [
    {
      id: "restaurante_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto 👋 He visto ${n} y creo que una web con fotos, menú, ubicación y botón de WhatsApp podría ayudar a que la gente os encuentre más fácil. Estamos haciendo demos gratis. ¿Te gustaría ver una idea rápida?`,
    },
    {
      id: "restaurante_B",
      fn: (n) =>
        `Hola, soy David de Kuraianto. Te escribo por ${n}. Muchos restaurantes nos comentan que la gente busca en Google antes de salir a comer. Una web con menú, fotos y ubicación puede marcar la diferencia. Hacemos demos gratis antes de decidir nada. ¿Os interesa verlo?`,
    },
  ],

  sin_respuesta: [
    {
      id: "sin_respuesta_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto. He visto ${n} y creo que una web sencilla con servicios claros, ubicación y WhatsApp podría ayudaros a recibir más contactos. Ahora estamos haciendo demos gratis antes de decidir nada. ¿Te interesa verla?`,
    },
    {
      id: "sin_respuesta_B",
      fn: (n) =>
        `Hola, soy David de Kuraianto. He intentado llamar a ${n} pero no he podido contactar. Te escribo por aquí por si es más cómodo. Hacemos demos gratis de web para negocios locales, sin compromiso. ¿Te interesa echarle un vistazo?`,
    },
  ],

  muchos_intentos: [
    {
      id: "muchos_intentos_A",
      fn: (n) =>
        `Hola, soy David de Kuraianto. Te escribo una última vez por ${n}. Si algún día queréis ver una demo gratis de una web sencilla para vuestro negocio, me dices y te la preparo. ✅`,
    },
  ],
};

// ---------------------------------------------------------------------------
// Template selection and message building
// ---------------------------------------------------------------------------
function selectTemplate(lead) {
  const name = (lead.restaurante || "vuestro negocio").trim();
  const isBelgica = lead.tab === "NEGOCIOS BÉLGICA";
  const country = isBelgica ? " | Lead Bélgica" : "";
  const estado = lead.estado;
  const intento = lead.intento || 0;

  let category;
  let reason;

  if (intento >= 3) {
    category = "muchos_intentos";
    reason = `Mensaje corto por varios intentos (${intento})` + country;
  } else if (estado === "Interesado") {
    category = "interesado";
    reason = `Lead interesado – seguimiento cálido` + (isResto(lead) ? " · Restaurante" : "") + country;
  } else if (estado === "Volver a llamar") {
    category = "volver_llamar";
    reason = `Pidió volver a llamar – recordatorio por WA` + (isResto(lead) ? " · Restaurante" : "") + country;
  } else if (isResto(lead)) {
    category = "restaurante";
    reason = `Restaurante detectado – demo con fotos, menú y ubicación` + country;
  } else if (isNeverContacted(lead)) {
    category = "sin_contactar";
    reason = `Sin contacto previo – primer mensaje frío` + country;
  } else {
    category = "sin_respuesta";
    reason = `Sin respuesta a llamada – contacto por WA` + country;
  }

  const pool = TEMPLATES[category];
  const tpl = pool[lead.rowIndex % pool.length];
  const mensaje = tpl.fn(name);

  return { mensaje, templateId: tpl.id, razonPersonalizacion: reason };
}

// ---------------------------------------------------------------------------
// Recommended action
// ---------------------------------------------------------------------------
function getAccion(lead) {
  const intento = lead.intento || 0;
  if (intento >= 3) return "Último intento – enviar solo si aún no respondió";
  if (lead.estado === "Interesado") return "Prioridad alta – tiene interés previo";
  if (lead.estado === "Volver a llamar") return "Seguimiento – acordó volver a contactar";
  if (isNeverContacted(lead)) return "Primer contacto – mensaje frío, sin llamada previa";
  if (isResto(lead)) return "Negocio hostelería – demo enfocada en menú/reservas";
  return "Contacto vía WA – no contestó llamada";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Leyendo leads de Google Sheets...\n");

  let allLeads;
  try {
    allLeads = await readAllLeads();
  } catch (err) {
    console.error("\nError al leer el sheet:", err.message);
    if (err.message.includes("credentials") || err.message.includes("ENOENT")) {
      console.error("Falta credentials.json. Consulta el OUTREACH_README.md.");
    } else {
      console.error("Comprueba SPREADSHEET_ID, GOOGLE_CREDENTIALS_PATH y SHEET_TAB_NAME en tu .env");
    }
    process.exit(1);
  }

  // Active-estado leads (Interesado, Volver a llamar, Sin respuesta, No contesta)
  const normalLeads = filterLeads(allLeads).filter(l => !DISCARD_NOTES_RE.test(l.notas || ""));

  // Never-contacted leads (empty estado, no call history)
  const neverContacted = allLeads.filter(l =>
    isNeverContacted(l) &&
    l.telefono && l.telefono.trim() !== "" &&
    !DISCARD_NOTES_RE.test(l.notas || "")
  );
  const normalIds = new Set(normalLeads.map(l => l.tab + ":" + l.rowIndex));
  const extraLeads = neverContacted.filter(l => !normalIds.has(l.tab + ":" + l.rowIndex));

  const leads = [...normalLeads, ...extraLeads];

  if (leads.length === 0) {
    console.log("No hay leads pendientes para hoy.");
    console.log(`Total en el sheet: ${allLeads.length}`);
    return;
  }

  console.log(`${leads.length} lead(s) listos (${normalLeads.length} activos + ${extraLeads.length} sin contactar). Total en sheet: ${allLeads.length}\n`);

  const rows = [];
  const templateCount = {};

  for (const lead of leads) {
    const { number, status } = cleanPhone(lead.telefono);
    const { mensaje, templateId, razonPersonalizacion } = selectTemplate(lead);
    const accion = getAccion(lead);
    const waLink = status === "ok"
      ? `${WA_BASE}${number.replace("+", "")}?text=${encodeURIComponent(mensaje)}`
      : "";

    templateCount[templateId] = (templateCount[templateId] || 0) + 1;

    rows.push({
      fila: lead.rowIndex,
      tab: lead.tab,
      restaurante: lead.restaurante,
      telefono: lead.telefono,
      telefonoLimpio: number,
      estadoTelefono: status,
      estado: lead.estado || "Sin contactar",
      intento: lead.intento || 0,
      notas: lead.notas,
      mensaje,
      templateId,
      razonPersonalizacion,
      waLink,
      accion,
    });
  }

  // Summary
  const uniqueTemplates = Object.keys(templateCount).length;
  console.log(`Plantillas usadas: ${uniqueTemplates} distintas`);
  Object.entries(templateCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, count]) => console.log(`  ${id}: ${count} mensajes`));

  // ---------------------------------------------------------------------------
  // CSV
  // ---------------------------------------------------------------------------
  const csvHeader = "Restaurante,Teléfono,Estado,Intento,Notas de llamada,Mensaje personalizado,WhatsApp link,Acción recomendada,Plantilla usada,Razón personalización";
  const csvLines = rows.map((r) =>
    [
      csvVal(r.restaurante),
      csvVal(r.telefono),
      csvVal(r.estado),
      r.intento,
      csvVal(r.notas),
      csvVal(r.mensaje),
      r.waLink,
      csvVal(r.accion),
      csvVal(r.templateId),
      csvVal(r.razonPersonalizacion),
    ].join(",")
  );
  fs.writeFileSync(OUTPUT_CSV, "﻿" + [csvHeader, ...csvLines].join("\n"), "utf8");
  console.log(`\nCSV guardado en: ${OUTPUT_CSV}`);

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  const templateStats = Object.entries(templateCount)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `<span class="stat-pill">${escHtml(id)}: <strong>${n}</strong></span>`)
    .join("");

  const needsReview = rows.filter((r) => r.estadoTelefono !== "ok").length;
  const countByEstado = {};
  rows.forEach(r => { countByEstado[r.estado] = (countByEstado[r.estado] || 0) + 1; });

  const tableRows = rows.map((r) => {
    const badgeClass = `badge estado-${(r.estado || "").toLowerCase().replace(/ /g, "-")}`;
    const phoneNote = r.estadoTelefono !== "ok"
      ? `<br><span class="warn">Revisar: ${escHtml(r.telefonoLimpio)}</span>`
      : `<br><small>${escHtml(r.telefonoLimpio)}</small>`;

    const btnCopy = `<button class="copy-btn" data-msg="${escHtml(r.mensaje)}" onclick="copyMsg(this)">Copiar</button>`;
    const btnWa = r.estadoTelefono === "ok"
      ? `<a href="${r.waLink}" target="_blank" class="wa-btn">WhatsApp</a>`
      : `<span class="warn-sm">Revisar tel.</span>`;

    return `<tr>
      <td class="col-name">
        <strong>${escHtml(r.restaurante)}</strong>
        <br><small class="tab-label">${escHtml(r.tab)}</small>
        <br><small>Fila ${r.fila}</small>
      </td>
      <td class="col-phone">${escHtml(r.telefono)}${phoneNote}</td>
      <td class="col-status">
        <span class="${badgeClass}">${escHtml(r.estado)}</span>
        <br><small>${r.intento} intento${r.intento !== 1 ? "s" : ""}</small>
      </td>
      <td class="col-notes">${escHtml(r.notas) || "<span class='empty'>—</span>"}</td>
      <td class="col-msg">${escHtml(r.mensaje)}</td>
      <td class="col-tpl">
        <span class="tpl-badge">${escHtml(r.templateId)}</span>
        <br><small>${escHtml(r.razonPersonalizacion)}</small>
      </td>
      <td class="col-accion"><span class="accion">${escHtml(r.accion)}</span></td>
      <td class="col-action">${btnCopy} ${btnWa}</td>
    </tr>`;
  }).join("\n");

  const html = buildDashboardHtml({ count: rows.length, needsReview, templateStats, tableRows, countByEstado });
  fs.writeFileSync(OUTPUT_HTML, html, "utf8");
  console.log(`Dashboard guardado en: ${OUTPUT_HTML}`);
  console.log("\nAbre scripts/dashboard.html en tu navegador.");
}

// ---------------------------------------------------------------------------
// Dashboard HTML
// ---------------------------------------------------------------------------
function buildDashboardHtml({ count, needsReview, templateStats, tableRows, countByEstado }) {
  const generated = new Date().toLocaleString("es-ES");
  const estadoBoxes = Object.entries(countByEstado)
    .sort((a, b) => b[1] - a[1])
    .map(([e, n]) => `<div class="stat-box"><strong>${n}</strong>${escHtml(e)}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kuraianto – Outreach Dashboard</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d0d12; color: #dcdce4; padding: 28px 20px; }
header { margin-bottom: 24px; }
h1 { font-size: 20px; font-weight: 700; color: #f97316; }
.meta { margin-top: 4px; font-size: 12px; color: #555; }
.stats-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.stat-box { background: #16161e; border: 1px solid #1e1e2c; border-radius: 8px; padding: 12px 18px; font-size: 13px; line-height: 1.3; }
.stat-box strong { display: block; font-size: 24px; font-weight: 700; color: #f97316; }
.tpl-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; align-items: center; }
.tpl-row-label { font-size: 11px; color: #555; margin-right: 4px; }
.stat-pill { background: #1c1c28; border: 1px solid #2a2a3a; border-radius: 4px; padding: 3px 8px; font-size: 11px; color: #a0a0c0; }
.stat-pill strong { font-size: 12px; color: #e2e2e5; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
th { background: #13131b; color: #777; font-weight: 600; text-align: left; padding: 9px 12px; border-bottom: 1px solid #1a1a24; white-space: nowrap; }
td { padding: 11px 12px; border-bottom: 1px solid #14141c; vertical-align: top; }
tr:hover td { background: #111118; }
.col-name { min-width: 130px; }
.col-phone { white-space: nowrap; min-width: 130px; }
.col-status { white-space: nowrap; }
.col-notes { max-width: 150px; color: #777; font-size: 12px; line-height: 1.4; }
.col-msg { max-width: 280px; line-height: 1.5; color: #c4c4d4; }
.col-tpl { max-width: 200px; }
.col-accion { max-width: 160px; }
.col-action { white-space: nowrap; min-width: 160px; }
small { color: #555; font-size: 11px; }
.tab-label { color: #4a4a6a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.empty { color: #333; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.badge.estado-interesado { background: #14532d22; color: #4ade80; border: 1px solid #4ade8033; }
.badge.estado-volver-a-llamar { background: #78350f22; color: #fb923c; border: 1px solid #fb923c33; }
.badge.estado-sin-contactar,.badge.estado- { background: #0c4a6e22; color: #22d3ee; border: 1px solid #22d3ee33; }
.badge.estado-sin-respuesta, .badge.estado-no-contesta { background: #1e293b; color: #94a3b8; border: 1px solid #33415544; }
.tpl-badge { display: inline-block; background: #1a1a2e; border: 1px solid #2a2a44; border-radius: 3px; padding: 2px 7px; font-size: 10px; color: #7878aa; font-family: monospace; }
.accion { display: inline-block; font-size: 11px; color: #6a6a8a; line-height: 1.4; }
.warn { color: #f97316; font-size: 11px; }
.warn-sm { font-size: 11px; color: #f97316; }
.copy-btn {
  display: inline-block; padding: 5px 10px; border-radius: 5px; font-size: 11px; font-weight: 600;
  background: #1e1e2e; border: 1px solid #2e2e4e; color: #a0a0c0; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.copy-btn:hover { background: #2a2a44; color: #e2e2e5; }
.copy-btn.copied { background: #14532d; border-color: #4ade8033; color: #4ade80; }
.wa-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: #22c55e; color: #000; padding: 5px 12px; border-radius: 5px;
  text-decoration: none; font-weight: 600; font-size: 11px; margin-left: 4px;
}
.wa-btn:hover { background: #16a34a; color: #fff; }
.footer-note { margin-top: 24px; font-size: 11px; color: #333; }
</style>
</head>
<body>
<header>
  <h1>Kuraianto – Outreach Dashboard</h1>
  <p class="meta">Generado el ${generated}</p>
</header>

<div class="stats-row">
  <div class="stat-box"><strong>${count}</strong>leads para hoy</div>
  <div class="stat-box"><strong>${count - needsReview}</strong>con WA listo</div>
  ${needsReview > 0 ? `<div class="stat-box"><strong style="color:#f97316">${needsReview}</strong>revisar teléfono</div>` : ""}
  ${estadoBoxes}
</div>

<div class="tpl-row">
  <span class="tpl-row-label">Plantillas:</span>
  ${templateStats}
</div>

<div class="table-wrap">
<table>
  <thead>
    <tr>
      <th>Negocio</th>
      <th>Teléfono</th>
      <th>Estado</th>
      <th>Notas</th>
      <th>Mensaje generado</th>
      <th>Plantilla / Razón</th>
      <th>Acción recomendada</th>
      <th>Enviar</th>
    </tr>
  </thead>
  <tbody>
${tableRows}
  </tbody>
</table>
</div>
<p class="footer-note">Los mensajes no se envían automáticamente. Revisa cada mensaje antes de enviarlo. El botón WhatsApp abre wa.me con el texto prellenado.</p>

<script>
function copyMsg(btn) {
  const text = btn.getAttribute("data-msg");
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copiado";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("copied"); }, 1800);
  }).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    btn.textContent = "Copiado";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("copied"); }, 1800);
  });
}
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function csvVal(str) {
  const s = String(str || "").replace(/"/g, '""');
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main();
