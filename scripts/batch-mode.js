require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const http = require("http");
const fs = require("fs");
const path = require("path");
const { readAllLeads, getSheets, getTodayString, SPREADSHEET_ID } = require("./read-leads");

const PORT = 3333;
const BATCH_SIZE = 3;
const SOFT_WARNING = 20;
const STATE_FILE = path.join(__dirname, ".batch-state.json");

// ---------------------------------------------------------------------------
// Classification constants
// ---------------------------------------------------------------------------
const ACTIVE_ESTADOS = new Set(["Interesado", "Volver a llamar", "Sin respuesta", "No contesta"]);

const DISCARD_ESTADOS = new Set([
  "No interesado", "Descartado", "No le interesa", "No interesa", "Rechazado",
]);

const DISCARD_NOTES_RE =
  /no interesa(do)?|no le interesa|no quiere|no molestar|no llamar|ya tiene web|no necesita/i;

const RESTO_RE =
  /\b(restaurante|rest\b|bar\b|caf[eé]|cafeter[ií]a|tasca|taberna|bodega|mes[oó]n|hostal|pub\b|bistro|brasserie|cantina|cervecer[ií]a|tapas|marisquer[ií]a|asador|parrilla|grill|pizzer[ií]a|pizza|kebab|sushi|comedor|gastro)\b/i;

// ---------------------------------------------------------------------------
// Phone cleaning
// ---------------------------------------------------------------------------
function cleanPhone(raw) {
  let p = String(raw || "").replace(/[\s\-\.\(\)]/g, "");
  if (p.startsWith("+")) return p;
  if (p.startsWith("00")) return "+" + p.slice(2);
  if (/^[679]\d{8}$/.test(p)) return "+34" + p;
  if (/^0\d{7,8}$/.test(p)) return "+32" + p.slice(1);
  if (/^34[679]\d{8}$/.test(p)) return "+" + p;
  if (/^32\d{8,9}$/.test(p)) return "+" + p;
  return null;
}

// ---------------------------------------------------------------------------
// Never-contacted detection
// ---------------------------------------------------------------------------
function isNeverContacted(lead) {
  // "Pendiente" is the sheet's default estado for leads that have never been called
  // Contestado="No" is pre-filled and does NOT indicate a real contact attempt
  const isPendiente = !lead.estado || lead.estado.trim() === "" ||
                      lead.estado === "Pendiente" || lead.estado === "Sin contactar";
  const noIntento = !lead.intento || lead.intento === 0;
  const noFecha   = !lead.fechaLlamada || lead.fechaLlamada.trim() === "";
  return isPendiente && noIntento && noFecha;
}

// ---------------------------------------------------------------------------
// Message templates — 14 total across 6 categories
// No template literals: all strings use + concatenation
// ---------------------------------------------------------------------------
const TEMPLATES = {
  interesado: [
    (n) => "Hola, soy David de Kuraianto. Hablamos hace poco sobre la web de " + n + ". Te escribo porque puedo prepararte una demo gratis para que veas una primera idea antes de decidir nada. Te gustaria que la prepare?",
    (n) => "Hola, soy David de Kuraianto 😊 Hablamos hace unos dias sobre " + n + ". Sigo aqui por si quieres que prepare esa demo gratis. La verias antes de comprometerte con nada. Te parece?",
    (n) => "Hola, soy David de Kuraianto. Te escribo por " + n + " porque seguimos con las demos gratuitas para negocios locales. Si tienes 10 minutos me gustaria mostrarte una primera idea. Sin compromiso. Cuando te viene bien?",
  ],
  volver_llamar: [
    (n) => "Hola, soy David de Kuraianto 👋 Te llame hace poco por el tema de la web de " + n + ". Quiza no era buen momento. Si quieres te puedo preparar una demo gratis y la ves sin compromiso.",
    (n) => "Hola, soy David de Kuraianto. Intente llamar a " + n + " hace unos dias pero no pude contactar. Te escribo por aqui por si es mas comodo. Hacemos demos gratis para negocios locales. Te interesa echarle un vistazo?",
    (n) => "Hola, soy David de Kuraianto 📲 Llame para hablar sobre la web de " + n + " pero no era buen momento. Si en algun momento quieres ver como podria quedar vuestra web te preparo una demo gratis en pocos dias.",
  ],
  sin_contactar: [
    (n) => "Hola, soy David de Kuraianto 👋 He visto " + n + " y queria comentarte una idea rapida. Estamos preparando demos gratis para negocios locales para que veais como podria quedar vuestra web antes de decidir nada. Te interesa que te prepare una primera idea?",
    (n) => "Hola, soy David de Kuraianto. He visto " + n + " y creo que podria ayudaros a recibir mas contactos con una web sencilla. Ahora mismo hacemos demos gratis antes de contratar nada. Te parece si te preparo una idea rapida? 😊",
    (n) => "Hola 👋 Soy David de Kuraianto. He visto " + n + " y queria comentaros una cosa. Estamos haciendo demos web gratuitas para negocios locales, sin compromiso, para que podais ver como quedaria antes de decidir. Os interesa echarle un vistazo?",
  ],
  restaurante: [
    (n) => "Hola, soy David de Kuraianto 👋 He visto " + n + " y creo que una web con fotos, menu, ubicacion y boton de WhatsApp podria ayudar a que la gente os encuentre mas facil. Estamos haciendo demos gratis. Te gustaria ver una idea rapida?",
    (n) => "Hola, soy David de Kuraianto. Te escribo por " + n + ". Muchos restaurantes nos comentan que la gente busca en Google antes de salir a comer. Una web con menu, fotos y ubicacion puede marcar la diferencia. Hacemos demos gratis antes de decidir nada. Os interesa verlo?",
  ],
  sin_respuesta: [
    (n) => "Hola, soy David de Kuraianto. He visto " + n + " y creo que una web sencilla con servicios claros, ubicacion y WhatsApp podria ayudaros a recibir mas contactos. Ahora estamos haciendo demos gratis antes de decidir nada. Te interesa verla?",
    (n) => "Hola, soy David de Kuraianto. He intentado llamar a " + n + " pero no he podido contactar. Te escribo por aqui por si es mas comodo. Hacemos demos gratis de web para negocios locales, sin compromiso. Te interesa?",
  ],
  muchos_intentos: [
    (n) => "Hola, soy David de Kuraianto. Te escribo una ultima vez por " + n + ". Si algun dia quereis ver una demo gratis de una web sencilla para vuestro negocio me dices y te la preparo. ✅",
  ],
};

function buildMessage(lead) {
  const name = (lead.restaurante || "vuestro negocio").trim();
  const intento = lead.intento || 0;
  let cat;
  if (intento >= 3) cat = "muchos_intentos";
  else if (lead.estado === "Interesado") cat = "interesado";
  else if (lead.estado === "Volver a llamar") cat = "volver_llamar";
  else if (RESTO_RE.test(lead.restaurante)) cat = "restaurante";
  else if (isNeverContacted(lead)) cat = "sin_contactar";
  else cat = "sin_respuesta";
  const pool = TEMPLATES[cat];
  return { message: pool[lead.rowIndex % pool.length](name), category: cat };
}

function leadPriority(lead) {
  if (lead.estado === "Interesado") return 0;
  if (lead.estado === "Volver a llamar") return 1;
  if (isNeverContacted(lead)) return 2;
  if (RESTO_RE.test(lead.restaurante)) return 3;
  return 4;
}

function getPersonalizationReason(lead) {
  const intento = lead.intento || 0;
  const isBelgica = lead.tab === "NEGOCIOS BÉLGICA";
  const country = isBelgica ? " · Bélgica" : "";
  if (intento >= 3) return "Mensaje corto por varios intentos" + country;
  if (lead.estado === "Interesado") return "Lead interesado" + country;
  if (lead.estado === "Volver a llamar") return "Pidió volver a llamar" + country;
  if (isNeverContacted(lead)) {
    return RESTO_RE.test(lead.restaurante)
      ? "Sin contacto previo · Restaurante" + country
      : "Sin contacto previo" + country;
  }
  if (RESTO_RE.test(lead.restaurante)) return "Restaurante detectado" + country;
  if (lead.estado === "Sin respuesta") return "Sin respuesta – WA" + country;
  if (lead.estado === "No contesta") return "No contesta – WA" + country;
  return "Pendiente de contactar" + country;
}

function getDiscardReason(lead) {
  if (lead.estado === "Descartado") return "Ya descartado";
  if (DISCARD_ESTADOS.has(lead.estado)) return "Estado: " + lead.estado;
  const match = lead.notas && lead.notas.match(DISCARD_NOTES_RE);
  if (match) return "Notas: \"" + match[0] + "\"";
  return "Sin motivo claro";
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------
function loadState() {
  const today = getTodayString();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      if (s.date === today) return s;
    }
  } catch (_) {}
  return { date: today, contacted: 0, contactedIds: [] };
}

function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Lead loading with full filtering and stats
// ---------------------------------------------------------------------------
async function loadLeads(state) {
  const all = await readAllLeads();
  const today = getTodayString();

  const stats = {
    total: all.length,
    available: 0,
    interesado: 0,
    volverLlamar: 0,
    sinContactar: 0,
    restaurantes: 0,
    contactedToday: 0,
    notInterested: 0,
    duplicate: 0,
    tooManyAttempts: 0,
  };

  const discardCandidates = [];

  // Pass 1 — identify discard candidates
  for (const l of all) {
    const alreadyDiscarded = l.estado === "Descartado";
    const isDiscardEstado = !alreadyDiscarded && DISCARD_ESTADOS.has(l.estado);
    const isDiscardNotes = !alreadyDiscarded && DISCARD_NOTES_RE.test(l.notas);
    if (isDiscardEstado || isDiscardNotes) {
      discardCandidates.push({
        id: l.tab + ":" + l.rowIndex,
        rowIndex: l.rowIndex,
        tab: l.tab,
        restaurante: l.restaurante || "",
        estado: l.estado || "",
        reason: getDiscardReason(l),
      });
    }
  }

  // Pass 2 — filter pipeline
  let leads = all;

  // Remove session-contacted
  leads = leads.filter(l => !state.contactedIds.includes(l.tab + ":" + l.rowIndex));

  // Exclude discard estados and notes
  leads = leads.filter(l => {
    if (DISCARD_ESTADOS.has(l.estado) || DISCARD_NOTES_RE.test(l.notas)) {
      stats.notInterested++;
      return false;
    }
    return true;
  });

  // Keep active estados OR never-contacted
  leads = leads.filter(l => ACTIVE_ESTADOS.has(l.estado) || isNeverContacted(l));

  // Exclude contacted today (never-contacted always pass — their fecha is empty)
  leads = leads.filter(l => {
    if (l.fechaLlamada === today) { stats.contactedToday++; return false; }
    return true;
  });

  // Exclude 3+ attempts unless Interesado / Volver a llamar
  leads = leads.filter(l => {
    const hi = (l.intento || 0) >= 3;
    const keep = l.estado === "Interesado" || l.estado === "Volver a llamar";
    if (hi && !keep) { stats.tooManyAttempts++; return false; }
    return true;
  });

  // Dedup by phone
  const seen = new Set();
  leads = leads.filter(l => {
    const c = String(l.telefono).replace(/[\s\-\.\(\)]/g, "");
    if (!c || seen.has(c)) { stats.duplicate++; return false; }
    seen.add(c);
    return true;
  });

  // Sort by priority then intento ascending
  leads.sort((a, b) => {
    const d = leadPriority(a) - leadPriority(b);
    return d !== 0 ? d : (a.intento || 0) - (b.intento || 0);
  });

  stats.available = leads.length;

  // Count category stats
  for (const l of leads) {
    if (l.estado === "Interesado") stats.interesado++;
    else if (l.estado === "Volver a llamar") stats.volverLlamar++;
    else if (isNeverContacted(l)) stats.sinContactar++;
    if (RESTO_RE.test(l.restaurante)) stats.restaurantes++;
  }

  const result = leads.map(l => {
    const phone = cleanPhone(l.telefono);
    const { message, category } = buildMessage(l);
    const waLink = phone
      ? "https://wa.me/" + phone.replace("+", "") + "?text=" + encodeURIComponent(message)
      : "";
    const hasPhone = !!phone;
    const hasEmail = !!(l.email && l.email.trim());
    const channel = hasPhone && hasEmail ? "both" : hasEmail ? "email" : "whatsapp";
    return {
      id: l.tab + ":" + l.rowIndex,
      rowIndex: l.rowIndex,
      tab: l.tab,
      restaurante: l.restaurante || "",
      telefono: l.telefono || "",
      telefonoClean: phone || "",
      email: l.email || "",
      web: l.web || "",
      sector: l.sector || "",
      ciudad: l.ciudad || "",
      fuente: l.fuente || "",
      estado: l.estado || "",
      intento: l.intento || 0,
      notas: l.notas || "",
      message,
      category,
      waLink,
      channel,
      reason: getPersonalizationReason(l),
      highAttempts: (l.intento || 0) >= 3,
      isResto: RESTO_RE.test(l.restaurante),
      isNeverContacted: isNeverContacted(l),
    };
  });

  return { leads: result, stats, discardCandidates };
}

// ---------------------------------------------------------------------------
// Sheet writes
// ---------------------------------------------------------------------------
async function markLeads(batch) {
  const sheets = await getSheets();
  const today = getTodayString();
  const now = new Date().toTimeString().slice(0, 5);
  for (const lead of batch) {
    const newIntento = (lead.intento || 0) + 1;
    const newNotas = lead.notas ? lead.notas + " | WA " + today : "WA " + today;
    const updates = [
      { col: "F", value: String(newIntento) },
      { col: "H", value: today },
      { col: "I", value: now },
      { col: "J", value: newNotas },
    ];
    await Promise.all(updates.map(u =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'" + lead.tab + "'!" + u.col + lead.rowIndex,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[u.value]] },
      })
    ));
  }
}

async function discardLeads(candidates) {
  const sheets = await getSheets();
  for (const c of candidates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "'" + c.tab + "'!D" + c.rowIndex,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Descartado"]] },
    });
  }
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
async function handleRequest(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const url = new URL(req.url, "http://localhost:" + PORT);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getHTML());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    const state = loadState();
    const { leads, stats, discardCandidates } = await loadLeads(state);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      leads, stats, discardCandidates,
      dailyContacted: state.contacted,
      softWarning: SOFT_WARNING,
      batchSize: BATCH_SIZE,
    }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/mark") {
    let body = "";
    req.on("data", c => { body += c; });
    await new Promise(r => req.on("end", r));
    const parsed = JSON.parse(body);
    const batch = parsed.batch || [];
    if (!batch.length) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No leads in batch." }));
      return;
    }
    const state = loadState();
    await markLeads(batch);
    state.contacted += batch.length;
    state.contactedIds.push(...batch.map(l => l.id));
    saveState(state);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, contacted: state.contacted }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/discard") {
    let body = "";
    req.on("data", c => { body += c; });
    await new Promise(r => req.on("end", r));
    const { candidates } = JSON.parse(body);
    if (!candidates || !candidates.length) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, count: 0 }));
      return;
    }
    await discardLeads(candidates);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, count: candidates.length }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
}

http.createServer(async (req, res) => {
  try { await handleRequest(req, res); }
  catch (err) {
    console.error("Error:", err.message);
    if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); }
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log("\nKuraianto Batch Mode");
  console.log("-> http://localhost:" + PORT);
  console.log("Ctrl+C para detener\n");
});

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------
function getHTML() {
  return [
    "<!DOCTYPE html><html lang=\"es\"><head>",
    "<meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "<title>Kuraianto – Batch Mode</title>",
    "<style>", getCSS(), "</style>",
    "</head><body>",
    getBodyHTML(),
    "<script>", getClientJS(), "</script>",
    "</body></html>",
  ].join("\n");
}

function getCSS() {
  return [
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
    "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d0d12;color:#dcdce4;min-height:100vh}",

    // Topbar
    ".topbar{background:#13131b;border-bottom:1px solid #1e1e2c;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}",
    ".topbar h1{font-size:15px;font-weight:700;color:#f97316}",
    ".countdown{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;color:#f97316;letter-spacing:1px}",
    ".countdown.warn{color:#ef4444;animation:pulse 1s infinite}",
    "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}",
    ".daily-wrap{display:flex;align-items:center;gap:8px;font-size:12px;color:#666}",
    ".daily-bar{width:100px;height:5px;background:#1e1e2c;border-radius:3px;overflow:hidden}",
    ".daily-fill{height:100%;background:#f97316;border-radius:3px;transition:width .3s}",
    ".btn-discard-open{padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;background:#7f1d1d22;border:1px solid #f8717133;color:#f87171;cursor:pointer;transition:background .15s}",
    ".btn-discard-open:hover{background:#7f1d1d44}",
    ".btn-discard-open.hidden{display:none}",

    // Stats row
    ".stats-row{display:flex;flex-wrap:wrap;gap:8px;padding:10px 24px;background:#0f0f18;border-bottom:1px solid #1a1a24}",
    ".stat-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600}",
    ".stat-pill .num{font-size:14px;font-weight:700}",
    ".sp-avail{background:#14532d22;color:#4ade80;border:1px solid #4ade8022}",
    ".sp-int{background:#14532d33;color:#86efac;border:1px solid #86efac22}",
    ".sp-vol{background:#78350f22;color:#fb923c;border:1px solid #fb923c22}",
    ".sp-sinc{background:#0c4a6e22;color:#22d3ee;border:1px solid #22d3ee22}",
    ".sp-rest{background:#4c1d9522;color:#a78bfa;border:1px solid #a78bfa22}",
    ".sp-today{background:#1e3a5f22;color:#60a5fa;border:1px solid #60a5fa22}",
    ".sp-notin{background:#7f1d1d22;color:#f87171;border:1px solid #f8717122}",
    ".sp-dupl{background:#1e1e2c;color:#666;border:1px solid #2a2a3a}",
    ".sp-att{background:#78350f22;color:#fb923c;border:1px solid #fb923c22}",
    ".stat-sep{width:1px;background:#1e1e2c;align-self:stretch;margin:0 2px}",

    // Soft warning
    ".soft-warn{display:none;padding:8px 24px;background:#78350f22;border-bottom:1px solid #fb923c33;color:#fb923c;font-size:11px;line-height:1.5}",

    // Filter bar
    ".filter-bar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 24px;background:#0f0f18;border-bottom:1px solid #1a1a24;align-items:center}",
    ".filter-bar label{font-size:11px;color:#666;display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none}",
    ".filter-bar select{background:#1a1a28;border:1px solid #2a2a3a;border-radius:5px;padding:4px 8px;font-size:11px;color:#c0c0d0;cursor:pointer;outline:none}",
    ".filter-bar select:focus{border-color:#f97316}",
    ".filter-bar input[type=checkbox]{accent-color:#f97316;cursor:pointer}",
    ".btn-reset{padding:4px 10px;border-radius:5px;font-size:11px;background:#1a1a28;border:1px solid #2a2a3a;color:#555;cursor:pointer}",
    ".btn-reset:hover{color:#c0c0d0}",
    ".filter-label{font-size:10px;color:#444;text-transform:uppercase;letter-spacing:.5px;margin-right:2px}",

    // Main
    ".main{padding:20px 24px;max-width:1100px;margin:0 auto}",
    ".batch-info{font-size:12px;color:#555;margin-bottom:14px;line-height:1.6}",
    ".cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-bottom:20px}",

    // Card
    ".card{background:#13131b;border:1px solid #1e1e2c;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}",
    ".card.hi-att{border-color:#7c3b1d}",
    ".card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}",
    ".card-name{font-size:14px;font-weight:700;color:#e8e8f0;line-height:1.3}",
    ".card-sub{font-size:10px;color:#3a3a5a;margin-top:2px;text-transform:uppercase;letter-spacing:.4px}",

    // Estado badges
    ".badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap}",
    ".b-int{background:#14532d22;color:#4ade80;border:1px solid #4ade8033}",
    ".b-vol{background:#78350f22;color:#fb923c;border:1px solid #fb923c33}",
    ".b-sinc{background:#0c4a6e22;color:#22d3ee;border:1px solid #22d3ee33}",
    ".b-sin{background:#1e293b;color:#94a3b8;border:1px solid #33415544}",

    // Reason tag
    ".reason-tag{display:inline-block;background:#1a1a2e;border:1px solid #2a2a44;border-radius:4px;padding:2px 8px;font-size:10px;color:#6868a0;line-height:1.4}",
    ".warn-badge{display:inline-flex;align-items:center;gap:4px;background:#7c1d1d22;color:#f87171;border:1px solid #f8717133;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}",
    ".card-phone{font-size:12px;color:#a0a0c0}.card-phone strong{color:#dcdce4;font-size:13px}",
    ".card-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:1px}",
    ".meta-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:500;background:#1a1a2a;border:1px solid #2a2a3a;color:#8080a0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".meta-chip a{color:#8080a0;text-decoration:none}.meta-chip a:hover{color:#c0c0d0}",
    ".ch-both{background:#14532d22;color:#4ade80;border-color:#4ade8033}",
    ".ch-email{background:#0c4a6e22;color:#22d3ee;border-color:#22d3ee33}",
    ".ch-wa{background:#166534;color:#86efac;border-color:#86efac33}",
    ".card-notas{font-size:11px;color:#4a4a6a;line-height:1.4;font-style:italic}",
    ".card-msg{background:#0a0a14;border:1px solid #1a1a28;border-radius:8px;padding:10px 12px;font-size:12px;color:#b0b0c0;line-height:1.6}",
    ".card-actions{display:flex;gap:8px;margin-top:auto;padding-top:2px}",

    // Buttons
    ".btn-copy{flex:1;padding:7px;border-radius:6px;font-size:11px;font-weight:600;background:#1e1e2e;border:1px solid #2e2e4e;color:#a0a0c0;cursor:pointer;transition:background .15s}",
    ".btn-copy:hover{background:#2a2a44;color:#e2e2e5}.btn-copy.copied{background:#14532d;border-color:#4ade8033;color:#4ade80}",
    ".btn-wa{flex:1;padding:7px;border-radius:6px;font-size:11px;font-weight:700;background:#22c55e;color:#000;border:none;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;transition:background .15s}",
    ".btn-wa:hover{background:#16a34a;color:#fff}.btn-wa.off{background:#1e1e2e;color:#555;border:1px solid #2e2e4e;pointer-events:none}",

    ".actions-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
    ".btn-nav{padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600;background:#1e1e2e;border:1px solid #2e2e4e;color:#a0a0c0;cursor:pointer}",
    ".btn-nav:hover:not(:disabled){background:#2a2a44;color:#e2e2e5}.btn-nav:disabled{opacity:.3;cursor:not-allowed}",
    ".btn-mark{padding:9px 20px;border-radius:8px;font-size:12px;font-weight:700;background:#f97316;color:#000;border:none;cursor:pointer;margin-left:auto}",
    ".btn-mark:hover{background:#ea6c0a}.btn-mark:disabled{background:#3a2010;color:#555;cursor:not-allowed}",

    // Modals
    ".overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;z-index:100;padding:16px}",
    ".overlay.open{display:flex}",
    ".modal{background:#16161e;border:1px solid #2e2e3e;border-radius:14px;padding:24px;width:100%;max-height:85vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px}",
    ".modal-sm{max-width:420px}",
    ".modal-lg{max-width:580px}",
    ".modal h2{font-size:15px;font-weight:700;color:#f97316}",
    ".modal p{font-size:12px;color:#888;line-height:1.6}",
    ".modal-list{list-style:none;display:flex;flex-direction:column;gap:5px}",
    ".modal-list li{background:#0d0d12;border:1px solid #1e1e2c;border-radius:6px;padding:8px 12px;font-size:12px;color:#c0c0d0;line-height:1.4}",
    ".modal-list li .reason{color:#555;font-size:11px}",
    ".modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:4px}",
    ".btn-cancel{padding:8px 16px;border-radius:7px;font-size:12px;font-weight:600;background:#1e1e2e;border:1px solid #2e2e4e;color:#a0a0c0;cursor:pointer}",
    ".btn-confirm{padding:8px 16px;border-radius:7px;font-size:12px;font-weight:700;background:#22c55e;color:#000;border:none;cursor:pointer}",
    ".btn-confirm:hover{background:#16a34a;color:#fff}.btn-confirm:disabled{opacity:.5;cursor:not-allowed}",
    ".btn-confirm-red{background:#ef4444;color:#fff}.btn-confirm-red:hover{background:#dc2626}",

    ".toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:none;z-index:200;white-space:nowrap}",
    ".toast.ok{background:#14532d;color:#4ade80;border:1px solid #4ade8033;display:block}",
    ".toast.err{background:#7f1d1d;color:#f87171;border:1px solid #f8717133;display:block}",
    ".empty{text-align:center;padding:48px 24px;color:#444}",
    ".empty strong{display:block;font-size:17px;margin-bottom:8px;color:#666}",
    "small{color:#555;font-size:11px}",
  ].join("");
}

function getBodyHTML() {
  return [
    "<div class=\"topbar\">",
    "  <h1>Kuraianto – Batch Mode</h1>",
    "  <div class=\"countdown\" id=\"cd\">15:00</div>",
    "  <div class=\"daily-wrap\">",
    "    <span id=\"daily-txt\">0 contactados hoy</span>",
    "    <div class=\"daily-bar\"><div class=\"daily-fill\" id=\"daily-fill\" style=\"width:0%\"></div></div>",
    "  </div>",
    "  <button class=\"btn-discard-open hidden\" id=\"btn-discard-open\" onclick=\"openDiscard()\">Ver no interesados (<span id=\"discard-count\">0</span>)</button>",
    "</div>",

    "<div class=\"stats-row\" id=\"stats-row\">",
    "  <span class=\"stat-pill sp-avail\"><span class=\"num\" id=\"stat-avail\">–</span> disponibles</span>",
    "  <span class=\"stat-pill sp-int\"><span class=\"num\" id=\"stat-int\">–</span> interesados</span>",
    "  <span class=\"stat-pill sp-vol\"><span class=\"num\" id=\"stat-vol\">–</span> volver llamar</span>",
    "  <span class=\"stat-pill sp-sinc\"><span class=\"num\" id=\"stat-sinc\">–</span> nunca contactados</span>",
    "  <span class=\"stat-pill sp-rest\"><span class=\"num\" id=\"stat-rest\">–</span> restaurantes</span>",
    "  <span class=\"stat-sep\"></span>",
    "  <span class=\"stat-pill sp-today\"><span class=\"num\" id=\"stat-today\">–</span> contactados hoy (excl.)</span>",
    "  <span class=\"stat-pill sp-notin\"><span class=\"num\" id=\"stat-notin\">–</span> descartados (excl.)</span>",
    "  <span class=\"stat-pill sp-dupl\"><span class=\"num\" id=\"stat-dupl\">–</span> duplicados (excl.)</span>",
    "  <span class=\"stat-pill sp-att\"><span class=\"num\" id=\"stat-att\">–</span> muchos intentos (excl.)</span>",
    "</div>",

    "<div class=\"soft-warn\" id=\"soft-warn\">⚠️ Recomendación: no contactes demasiados leads seguidos. Prioriza calidad antes que volumen.</div>",

    "<div class=\"filter-bar\">",
    "  <span class=\"filter-label\">Filtros:</span>",
    "  <select id=\"f-tab\" onchange=\"onFilter()\">",
    "    <option value=\"all\">Todos los países</option>",
    "    <option value=\"NEGOCIOS ESPAÑA\">España</option>",
    "    <option value=\"NEGOCIOS BÉLGICA\">Bélgica</option>",
    "  </select>",
    "  <select id=\"f-estado\" onchange=\"onFilter()\">",
    "    <option value=\"all\">Todos los estados</option>",
    "    <option value=\"Interesado\">Interesado</option>",
    "    <option value=\"Volver a llamar\">Volver a llamar</option>",
    "    <option value=\"sincontactar\">Nunca contactados</option>",
    "    <option value=\"sinrespuesta\">Sin respuesta / No contesta</option>",
    "    <option value=\"Sin respuesta\">Solo Sin respuesta</option>",
    "    <option value=\"No contesta\">Solo No contesta</option>",
    "  </select>",
    "  <select id=\"f-cat\" onchange=\"onFilter()\">",
    "    <option value=\"all\">Todas las plantillas</option>",
    "    <option value=\"interesado\">Interesado</option>",
    "    <option value=\"volver_llamar\">Volver a llamar</option>",
    "    <option value=\"sin_contactar\">Sin contactar</option>",
    "    <option value=\"restaurante\">Restaurante</option>",
    "    <option value=\"sin_respuesta\">Sin respuesta</option>",
    "    <option value=\"muchos_intentos\">Muchos intentos</option>",
    "  </select>",
    "  <label><input type=\"checkbox\" id=\"f-resto\" onchange=\"onFilter()\"> Solo restaurantes</label>",
    "  <label><input type=\"checkbox\" id=\"f-sin\" onchange=\"onFilter()\"> Solo sin contactar</label>",
    "  <button class=\"btn-reset\" onclick=\"resetFilters()\">Limpiar filtros</button>",
    "</div>",

    "<div class=\"main\">",
    "  <div class=\"batch-info\" id=\"batch-info\">Cargando leads...</div>",
    "  <div class=\"cards\" id=\"cards\"></div>",
    "  <div class=\"actions-row\">",
    "    <button class=\"btn-nav\" id=\"btn-prev\" onclick=\"changeBatch(-1)\" disabled>← Lote anterior</button>",
    "    <button class=\"btn-nav\" id=\"btn-next\" onclick=\"changeBatch(1)\" disabled>Siguiente lote →</button>",
    "    <button class=\"btn-mark\" id=\"btn-mark\" onclick=\"openModal()\" disabled>Marcar lote como contactado</button>",
    "  </div>",
    "</div>",

    // Mark modal
    "<div class=\"overlay\" id=\"overlay\">",
    "  <div class=\"modal modal-sm\">",
    "    <h2>Confirmar contacto</h2>",
    "    <p>Se actualizará Intento +1 y Fecha en el sheet. El Estado no cambia.</p>",
    "    <ul class=\"modal-list\" id=\"modal-list\"></ul>",
    "    <div class=\"modal-actions\">",
    "      <button class=\"btn-cancel\" onclick=\"closeModal()\">Cancelar</button>",
    "      <button class=\"btn-confirm\" id=\"btn-confirm\" onclick=\"confirmMark()\">Confirmar</button>",
    "    </div>",
    "  </div>",
    "</div>",

    // Discard modal
    "<div class=\"overlay\" id=\"overlay-discard\">",
    "  <div class=\"modal modal-lg\">",
    "    <h2>Descartar leads no interesados</h2>",
    "    <p>Los siguientes leads tienen indicios de no estar interesados. Se actualizará Estado a \"Descartado\" en el sheet. Esta acción no se puede deshacer fácilmente.</p>",
    "    <ul class=\"modal-list\" id=\"discard-list\"></ul>",
    "    <div class=\"modal-actions\">",
    "      <button class=\"btn-cancel\" onclick=\"closeDiscard()\">Cancelar</button>",
    "      <button class=\"btn-confirm btn-confirm-red\" id=\"btn-discard-confirm\" onclick=\"confirmDiscard()\">Descartar todos</button>",
    "    </div>",
    "  </div>",
    "</div>",

    "<div class=\"toast\" id=\"toast\"></div>",
  ].join("\n");
}

function getClientJS() {
  return [
    "var leads=[], filteredLeads=[], discardCandidates=[], batchIdx=0, dailyContacted=0, softWarning=20, cdTimer, cdSecs=900;",
    "var filters={tab:'all',estado:'all',cat:'all',soloResto:false,soloSin:false};",

    "async function init(){",
    "  try{",
    "    var r=await fetch('/api/state'), d=await r.json();",
    "    leads=d.leads; filteredLeads=leads.slice();",
    "    discardCandidates=d.discardCandidates||[];",
    "    dailyContacted=d.dailyContacted; softWarning=d.softWarning||20;",
    "    updateBar(); updateStats(d.stats); renderBatch(); startCD();",
    "  } catch(e){ document.getElementById('cards').innerHTML='<div class=\"empty\"><strong>Error al cargar</strong>'+e.message+'</div>'; }",
    "}",

    "function applyFilters(){",
    "  filteredLeads=leads.filter(function(l){",
    "    if(filters.tab!=='all' && l.tab!==filters.tab) return false;",
    "    if(filters.estado!=='all'){",
    "      if(filters.estado==='sincontactar' && !l.isNeverContacted) return false;",
    "      if(filters.estado==='sinrespuesta' && l.estado!=='Sin respuesta' && l.estado!=='No contesta') return false;",
    "      if(filters.estado!=='sincontactar' && filters.estado!=='sinrespuesta' && l.estado!==filters.estado) return false;",
    "    }",
    "    if(filters.cat!=='all' && l.category!==filters.cat) return false;",
    "    if(filters.soloResto && !l.isResto) return false;",
    "    if(filters.soloSin && !l.isNeverContacted) return false;",
    "    return true;",
    "  });",
    "  batchIdx=0; renderBatch();",
    "}",

    "function onFilter(){",
    "  filters.tab=document.getElementById('f-tab').value;",
    "  filters.estado=document.getElementById('f-estado').value;",
    "  filters.cat=document.getElementById('f-cat').value;",
    "  filters.soloResto=document.getElementById('f-resto').checked;",
    "  filters.soloSin=document.getElementById('f-sin').checked;",
    "  applyFilters();",
    "}",

    "function resetFilters(){",
    "  document.getElementById('f-tab').value='all';",
    "  document.getElementById('f-estado').value='all';",
    "  document.getElementById('f-cat').value='all';",
    "  document.getElementById('f-resto').checked=false;",
    "  document.getElementById('f-sin').checked=false;",
    "  filters={tab:'all',estado:'all',cat:'all',soloResto:false,soloSin:false};",
    "  applyFilters();",
    "}",

    "function updateStats(s){",
    "  if(!s) return;",
    "  document.getElementById('stat-avail').textContent=s.available;",
    "  document.getElementById('stat-int').textContent=s.interesado;",
    "  document.getElementById('stat-vol').textContent=s.volverLlamar;",
    "  document.getElementById('stat-sinc').textContent=s.sinContactar;",
    "  document.getElementById('stat-rest').textContent=s.restaurantes;",
    "  document.getElementById('stat-today').textContent=s.contactedToday;",
    "  document.getElementById('stat-notin').textContent=s.notInterested;",
    "  document.getElementById('stat-dupl').textContent=s.duplicate;",
    "  document.getElementById('stat-att').textContent=s.tooManyAttempts;",
    "  var dc=discardCandidates.length;",
    "  document.getElementById('discard-count').textContent=dc;",
    "  var btn=document.getElementById('btn-discard-open');",
    "  btn.className=dc>0?'btn-discard-open':'btn-discard-open hidden';",
    "}",

    "function startCD(){ clearInterval(cdTimer); cdSecs=900; drawCD();",
    "  cdTimer=setInterval(function(){ cdSecs--; drawCD(); if(cdSecs<=0){ startCD(); } },1000); }",
    "function drawCD(){ var m=Math.floor(cdSecs/60),s=cdSecs%60;",
    "  var el=document.getElementById('cd'); el.textContent=pad(m)+':'+pad(s);",
    "  el.className='countdown'+(cdSecs<=60?' warn':''); }",
    "function pad(n){ return n<10?'0'+n:''+n; }",

    "function updateBar(){",
    "  document.getElementById('daily-txt').textContent=dailyContacted+' contactados hoy';",
    "  var pct=Math.min(100,dailyContacted/softWarning*100);",
    "  var fill=document.getElementById('daily-fill');",
    "  fill.style.width=pct+'%';",
    "  fill.style.background=dailyContacted>=softWarning?'#ef4444':'#f97316';",
    "  document.getElementById('soft-warn').style.display=dailyContacted>=softWarning?'block':'none'; }",

    "function batch(){ return filteredLeads.slice(batchIdx*3, batchIdx*3+3); }",

    "function renderBatch(){",
    "  var b=batch(), total=filteredLeads.length, totalB=Math.max(1,Math.ceil(total/3));",
    "  var info=document.getElementById('batch-info');",
    "  if(!total){",
    "    var msg=leads.length===0?'No hay leads disponibles.':'No hay leads con los filtros actuales.';",
    "    info.textContent=msg;",
    "    document.getElementById('cards').innerHTML='<div class=\"empty\"><strong>Sin resultados</strong>'+msg+'</div>';",
    "    document.getElementById('btn-mark').disabled=true;",
    "    document.getElementById('btn-next').disabled=true;",
    "    document.getElementById('btn-prev').disabled=true; return; }",
    "  var s=batchIdx*3+1, e=Math.min(s+2,total);",
    "  info.innerHTML='Lote <strong>'+(batchIdx+1)+'</strong> de <strong>'+totalB+'</strong> &nbsp;&middot;&nbsp; Leads '+s+'&ndash;'+e+' de '+total;",
    "  document.getElementById('cards').innerHTML=b.map(renderCard).join('');",
    "  document.getElementById('btn-prev').disabled=batchIdx===0;",
    "  document.getElementById('btn-next').disabled=(batchIdx+1)*3>=total;",
    "  document.getElementById('btn-mark').disabled=!b.length;",
    "  document.getElementById('btn-mark').textContent='Marcar lote como contactado'; }",

    "function badgeCls(l){ if(l.estado==='Interesado') return 'badge b-int'; if(l.estado==='Volver a llamar') return 'badge b-vol'; if(l.isNeverContacted) return 'badge b-sinc'; return 'badge b-sin'; }",
    "function badgeLabel(l){ return l.estado||'Sin contactar'; }",

    "function chLabel(c){ return c==='both'?'WA + Email':c==='email'?'Solo Email':'Solo WhatsApp'; }",
    "function chCls(c){ return c==='both'?'ch-both':c==='email'?'ch-email':'ch-wa'; }",

    "function renderCard(l){",
    "  var warn=l.highAttempts?'<span class=\"warn-badge\" style=\"margin-top:2px\">⚠ '+l.intento+' intentos</span>':'';",
    "  var ph=l.telefonoClean?'<strong>'+esc(l.telefonoClean)+'</strong>':'<span style=\"color:#f87171\">Revisar: '+esc(l.telefono)+'</span>';",
    "  var wa=l.waLink?'<a href=\"'+l.waLink+'\" target=\"_blank\" class=\"btn-wa\">WhatsApp</a>':'<span class=\"btn-wa off\">Sin tel.</span>';",
    "  var notas=l.notas?'<div class=\"card-notas\">'+esc(l.notas)+'</div>':'';",
    "  var metaChips='';",
    "  if(l.email) metaChips+='<span class=\"meta-chip\">✉ <a href=\"mailto:'+esc(l.email)+'\" onclick=\"event.stopPropagation()\">'+esc(l.email)+'</a></span>';",
    "  if(l.web) metaChips+='<span class=\"meta-chip\">🌐 <a href=\"'+esc(l.web)+'\" target=\"_blank\" rel=\"noopener\" onclick=\"event.stopPropagation()\">'+esc(l.web.replace(/^https?:\\/\\//,'').replace(/\\/$/,''))+'</a></span>';",
    "  if(l.sector) metaChips+='<span class=\"meta-chip\">'+esc(l.sector)+'</span>';",
    "  if(l.ciudad) metaChips+='<span class=\"meta-chip\">📍 '+esc(l.ciudad)+'</span>';",
    "  if(l.fuente) metaChips+='<span class=\"meta-chip\">src: '+esc(l.fuente)+'</span>';",
    "  var meta=metaChips?'<div class=\"card-meta\">'+metaChips+'</div>':'';",
    "  var chBadge='<span class=\"meta-chip '+chCls(l.channel)+'\" style=\"margin-top:2px\">'+chLabel(l.channel)+'</span>';",
    "  return '<div class=\"card'+(l.highAttempts?' hi-att':'')+'\">'+",
    "    '<div class=\"card-top\">'+",
    "    '<div><div class=\"card-name\">'+esc(l.restaurante)+'</div>'+",
    "    '<div class=\"card-sub\">'+esc(l.tab)+' · Fila '+l.rowIndex+'</div></div>'+",
    "    '<span class=\"'+badgeCls(l)+'\">'+esc(badgeLabel(l))+'</span></div>'+",
    "    '<div style=\"display:flex;gap:6px;flex-wrap:wrap;align-items:center\">'+",
    "    '<span class=\"reason-tag\">'+esc(l.reason)+'</span>'+chBadge+warn+'</div>'+",
    "    '<div class=\"card-phone\">Tel: '+ph+'</div>'+",
    "    '<div style=\"font-size:11px;color:#555\">Intentos: '+l.intento+'</div>'+",
    "    meta+notas+",
    "    '<div class=\"card-msg\">'+esc(l.message)+'</div>'+",
    "    '<div class=\"card-actions\">'+",
    "    '<button class=\"btn-copy\" data-msg=\"'+escAttr(l.message)+'\" onclick=\"copyMsg(this)\">Copiar</button>'+",
    "    wa+'</div></div>'; }",

    "function changeBatch(d){ var ni=batchIdx+d;",
    "  if(ni<0||ni*3>=filteredLeads.length) return;",
    "  batchIdx=ni; renderBatch(); startCD(); }",

    // Mark modal
    "function openModal(){",
    "  var b=batch(); if(!b.length) return;",
    "  document.getElementById('modal-list').innerHTML=b.map(function(l){",
    "    return '<li><strong>'+esc(l.restaurante)+'</strong> &middot; '+esc(l.estado||'Sin contactar')+' &middot; <span class=\"reason\">'+esc(l.reason)+'</span></li>'; }).join('');",
    "  document.getElementById('overlay').classList.add('open'); }",
    "function closeModal(){ document.getElementById('overlay').classList.remove('open'); }",

    "async function confirmMark(){",
    "  var b=batch(), btn=document.getElementById('btn-confirm');",
    "  btn.disabled=true; btn.textContent='Guardando...';",
    "  try{",
    "    var r=await fetch('/api/mark',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({batch:b})});",
    "    var d=await r.json();",
    "    if(!r.ok) throw new Error(d.error||'Error');",
    "    closeModal(); dailyContacted=d.contacted; updateBar();",
    "    var ids=new Set(b.map(function(l){return l.id;}));",
    "    leads=leads.filter(function(l){return !ids.has(l.id);});",
    "    applyFilters();",
    "    toast('ok',b.length+' leads marcados. Sheet actualizado.');",
    "  } catch(e){ toast('err','Error: '+e.message); }",
    "  finally{ btn.disabled=false; btn.textContent='Confirmar'; }",
    "}",

    // Discard modal
    "function openDiscard(){",
    "  if(!discardCandidates.length) return;",
    "  document.getElementById('discard-list').innerHTML=discardCandidates.map(function(c){",
    "    return '<li><strong>'+esc(c.restaurante)+'</strong> &nbsp;<span style=\"color:#666\">'+esc(c.estado)+'</span><br><span class=\"reason\">Motivo: '+esc(c.reason)+'</span></li>'; }).join('');",
    "  document.getElementById('overlay-discard').classList.add('open'); }",
    "function closeDiscard(){ document.getElementById('overlay-discard').classList.remove('open'); }",

    "async function confirmDiscard(){",
    "  var btn=document.getElementById('btn-discard-confirm');",
    "  btn.disabled=true; btn.textContent='Descartando...';",
    "  try{",
    "    var r=await fetch('/api/discard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({candidates:discardCandidates})});",
    "    var d=await r.json();",
    "    if(!r.ok) throw new Error(d.error||'Error');",
    "    closeDiscard();",
    "    var count=d.count; discardCandidates=[];",
    "    document.getElementById('discard-count').textContent='0';",
    "    document.getElementById('btn-discard-open').className='btn-discard-open hidden';",
    "    toast('ok',count+' leads marcados como Descartado.');",
    "  } catch(e){ toast('err','Error: '+e.message); }",
    "  finally{ btn.disabled=false; btn.textContent='Descartar todos'; }",
    "}",

    // Shared helpers
    "function copyMsg(btn){",
    "  var text=btn.getAttribute('data-msg');",
    "  navigator.clipboard.writeText(text).then(function(){",
    "    btn.textContent='Copiado'; btn.classList.add('copied');",
    "    setTimeout(function(){btn.textContent='Copiar';btn.classList.remove('copied');},1800);",
    "  }).catch(function(){",
    "    var ta=document.createElement('textarea'); ta.value=text;",
    "    ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta);",
    "    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);",
    "    btn.textContent='Copiado'; btn.classList.add('copied');",
    "    setTimeout(function(){btn.textContent='Copiar';btn.classList.remove('copied');},1800);",
    "  }); }",

    "function toast(type,msg){",
    "  var el=document.getElementById('toast'); el.textContent=msg; el.className='toast '+type;",
    "  setTimeout(function(){ el.className='toast'; },3500); }",

    "function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }",
    "function escAttr(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;'); }",

    "init();",
  ].join("\n");
}
