require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs   = require("fs");
const path = require("path");
const readline = require("readline");
const { readAllLeads, getSheets, getTodayString, SPREADSHEET_ID, SHEET_TABS } = require("./read-leads");

const INPUT_CSV   = path.join(__dirname, "../data/new-leads.csv");
const REVIEW_CSV  = path.join(__dirname, "../data/new-leads-review.csv");
const TARGET_TAB  = process.env.IMPORT_TARGET_TAB || SHEET_TABS[0] || "NEGOCIOS ESPAÑA";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function cleanPhone(raw) {
  if (!raw) return "";
  let p = String(raw).replace(/[\s\-\.\(\)]/g, "");
  if (p.startsWith("+")) return p;
  if (p.startsWith("00")) return "+" + p.slice(2);
  if (/^[679]\d{8}$/.test(p)) return "+34" + p;
  if (/^0\d{7,8}$/.test(p)) return "+32" + p.slice(1);
  if (/^34[679]\d{8}$/.test(p)) return "+" + p;
  if (/^32\d{8,9}$/.test(p)) return "+" + p;
  return p;
}

function cleanEmail(raw) {
  if (!raw) return "";
  const e = String(raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : "";
}

function normName(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normPhone(s) {
  return String(s || "").replace(/[\s\-\.\(\)\+]/g, "");
}

function csvEscape(s) {
  const str = String(s || "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields)
// ---------------------------------------------------------------------------
function parseCSV(content) {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let field = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(field.trim()); field = "";
      } else {
        field += ch;
      }
    }
    row.push(field.trim());
    result.push(row);
  }
  return result;
}

// Expected CSV columns (flexible header matching):
const FIELD_MAP = {
  name:    ["business name","name","nombre","negocio","business"],
  phone:   ["phone","telefono","teléfono","tel"],
  email:   ["email","e-mail","correo"],
  address: ["address","direccion","dirección","dir"],
  city:    ["city","ciudad"],
  country: ["country","pais","país"],
  web:     ["website","web","url","sitio"],
  sector:  ["sector","tipo","type","category","categoria","categoría"],
  source:  ["source","fuente","origen"],
  notes:   ["notes","notas","nota"],
};

function detectHeaders(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => {
    const key = h.toLowerCase().replace(/[^a-z]/g, "");
    for (const [field, aliases] of Object.entries(FIELD_MAP)) {
      if (aliases.some(a => a.replace(/[^a-z]/g, "") === key)) {
        if (map[field] === undefined) map[field] = i;
      }
    }
  });
  return map;
}

function rowToLead(row, colMap) {
  const g = (f) => (colMap[f] !== undefined ? (row[colMap[f]] || "").trim() : "");
  return {
    name:    g("name"),
    phone:   cleanPhone(g("phone")),
    email:   cleanEmail(g("email")),
    address: g("address"),
    city:    g("city"),
    country: g("country"),
    web:     g("web"),
    sector:  g("sector"),
    source:  g("source"),
    notes:   g("notes"),
  };
}

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------
function buildExistingIndex(existingLeads) {
  const byPhone = new Map();
  const byEmail = new Map();
  const byName  = new Map();
  for (const l of existingLeads) {
    const p = normPhone(l.telefono);
    if (p) byPhone.set(p, l);
    const e = cleanEmail(l.email);
    if (e) byEmail.set(e, l);
    const n = normName(l.restaurante);
    if (n) byName.set(n, l);
  }
  return { byPhone, byEmail, byName };
}

function detectDuplicate(lead, index) {
  const p = normPhone(lead.phone);
  if (p && index.byPhone.has(p)) return { reason: "Teléfono duplicado", match: index.byPhone.get(p) };
  const e = lead.email;
  if (e && index.byEmail.has(e)) return { reason: "Email duplicado", match: index.byEmail.get(e) };
  const n = normName(lead.name);
  if (n && index.byName.has(n)) return { reason: "Nombre similar", match: index.byName.get(n) };
  return null;
}

// ---------------------------------------------------------------------------
// Safety checks
// ---------------------------------------------------------------------------
const EXCLUDE_NOTES_RE = /no molestar|no contactar|no quiere|no interesado|no interesa/i;

function safetyCheck(lead) {
  const issues = [];
  if (!lead.name) issues.push("Falta nombre");
  if (!lead.phone && !lead.email) issues.push("Falta teléfono y email");
  if (lead.phone && !/^\+\d{9,15}$/.test(lead.phone)) issues.push("Teléfono inválido: " + lead.phone);
  if (lead.notes && EXCLUDE_NOTES_RE.test(lead.notes)) issues.push("Notas contienen exclusión");
  return issues;
}

// ---------------------------------------------------------------------------
// Write review CSV
// ---------------------------------------------------------------------------
function writeReviewCSV(rows) {
  const header = ["Estado","Nombre","Teléfono","Email","Web","Sector","Ciudad","País","Fuente","Dirección","Notas","Motivo"];
  const lines = [header.map(csvEscape).join(",")];
  for (const r of rows) {
    lines.push([
      r.status, r.name, r.phone, r.email, r.web, r.sector,
      r.city, r.country, r.source, r.address, r.notes, r.reason,
    ].map(csvEscape).join(","));
  }
  fs.writeFileSync(REVIEW_CSV, lines.join("\n"), "utf8");
}

// ---------------------------------------------------------------------------
// Write new leads to Google Sheet
// ---------------------------------------------------------------------------
async function appendToSheet(leads) {
  const sheets = await getSheets();
  const today = getTodayString();

  // Get next empty row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'" + TARGET_TAB + "'!A:A",
  });
  const nextRow = (res.data.values || []).length + 1;
  console.log("  Appending from row", nextRow);

  const rows = leads.map(l => [
    l.name,      // A: Restaurante
    l.phone,     // B: Teléfono
    l.address,   // C: Dirección
    "Sin contactar", // D: Estado
    "",          // E: Contestado
    "0",         // F: Intento
    "",          // G: Agente
    "",          // H: Fecha llamada
    "",          // I: Hora
    l.notes,     // J: Notas
    l.email,     // K: Email
    l.web,       // L: Web
    l.sector,    // M: Sector
    l.city,      // N: Ciudad
    l.source,    // O: Fuente
    today,       // P: Fecha añadido
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "'" + TARGET_TAB + "'!A" + nextRow + ":P" + (nextRow + rows.length - 1),
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });

  return nextRow;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(r => rl.question(q, r));

  console.log("\n=== Kuraianto – Importar nuevos leads ===\n");

  // 1. Read input CSV
  if (!fs.existsSync(INPUT_CSV)) {
    console.error("No se encontró el archivo de entrada: data/new-leads.csv");
    console.error("Crea el archivo con los leads a importar. Consulta data/new-leads.csv.example");
    rl.close(); process.exit(1);
  }

  const raw = fs.readFileSync(INPUT_CSV, "utf8");
  const rows = parseCSV(raw);
  if (rows.length < 2) {
    console.error("El CSV está vacío o solo tiene cabecera.");
    rl.close(); process.exit(1);
  }

  const colMap = detectHeaders(rows[0]);
  const inputLeads = rows.slice(1).map(r => rowToLead(r, colMap)).filter(l => l.name || l.phone);
  console.log("Leads en CSV:", inputLeads.length);

  // 2. Load existing leads from sheet for deduplication
  console.log("Cargando leads existentes del sheet...");
  const existing = await readAllLeads();
  console.log("Leads existentes:", existing.length);
  const index = buildExistingIndex(existing);

  // 3. Classify each input lead
  const newLeads      = [];
  const duplicates    = [];
  const invalid       = [];
  const reviewRows    = [];

  for (const lead of inputLeads) {
    const issues = safetyCheck(lead);
    const dup = detectDuplicate(lead, index);

    if (issues.length) {
      invalid.push(lead);
      reviewRows.push({ status: "INVÁLIDO", ...lead, reason: issues.join("; ") });
    } else if (dup) {
      duplicates.push(lead);
      reviewRows.push({ status: "DUPLICADO", ...lead, reason: dup.reason + " (fila " + dup.match.rowIndex + ": " + dup.match.restaurante + ")" });
    } else {
      newLeads.push(lead);
      reviewRows.push({ status: "NUEVO", ...lead, reason: "" });
    }
  }

  // 4. Write review CSV
  writeReviewCSV(reviewRows);
  console.log("\n--- Resumen ---");
  console.log("  Nuevos (listos para importar):", newLeads.length);
  console.log("  Duplicados (excluidos):", duplicates.length);
  console.log("  Inválidos (excluidos):", invalid.length);
  console.log("\nRevisa el archivo: data/new-leads-review.csv");

  if (!newLeads.length) {
    console.log("\nNo hay leads nuevos que importar.");
    rl.close(); return;
  }

  // 5. Show preview and ask confirmation
  console.log("\nLead nuevos a importar:");
  newLeads.slice(0, 10).forEach((l, i) => {
    console.log("  " + (i+1) + ". " + l.name + " | " + (l.phone||"sin tel") + " | " + (l.email||"sin email") + " | " + (l.city||"sin ciudad"));
  });
  if (newLeads.length > 10) console.log("  ... y " + (newLeads.length - 10) + " más");

  console.log("\nTab destino: " + TARGET_TAB);
  const confirm = (await ask("\n¿Importar " + newLeads.length + " leads nuevos al sheet? (s/n): ")).trim().toLowerCase();

  if (confirm !== "s" && confirm !== "si" && confirm !== "sí") {
    console.log("Cancelado. No se importó nada. Revisa data/new-leads-review.csv.");
    rl.close(); return;
  }

  // 6. Append to sheet
  console.log("\nImportando...");
  const startRow = await appendToSheet(newLeads);
  console.log("✓ " + newLeads.length + " leads añadidos desde fila " + startRow + " en " + TARGET_TAB);
  console.log("✓ Revisa data/new-leads-review.csv para el informe completo.");
  rl.close();
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
