require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || "./credentials.json";
// Supports a single tab name or a comma-separated list: "NEGOCIOS ESPAÑA,NEGOCIOS BÉLGICA"
const SHEET_TABS = (process.env.SHEET_TAB_NAME || "").split(",").map((s) => s.trim()).filter(Boolean);

// Columns (0-indexed): A=0 Restaurante, B=1 Teléfono, C=2 Dirección,
// D=3 Estado, E=4 Contestado, F=5 Intento, G=6 Agente,
// H=7 Fecha llamada, I=8 Hora, J=9 Notas de llamada,
// K=10 Email, L=11 Web, M=12 Sector, N=13 Ciudad, O=14 Fuente, P=15 Fecha añadido

async function getSheets() {
  const credPath = require("path").isAbsolute(CREDENTIALS_PATH)
    ? CREDENTIALS_PATH
    : require("path").resolve(__dirname, "..", CREDENTIALS_PATH);
  const credentials = require(credPath);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function readAllLeads() {
  const sheets = await getSheets();
  const allLeads = [];

  for (const tab of SHEET_TABS) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${tab}'!A2:P`,
    });

    const rows = res.data.values || [];
    const leads = rows.map((row, index) => ({
      rowIndex: index + 2, // row 1 = header
      tab,
      restaurante: row[0] || "",
      telefono: row[1] || "",
      direccion: row[2] || "",
      estado: row[3] || "",
      contestado: row[4] || "",
      intento: parseInt(row[5] || "0", 10) || 0,
      agente: row[6] || "",
      fechaLlamada: row[7] || "",
      hora: row[8] || "",
      notas: row[9] || "",
      email: row[10] || "",
      web: row[11] || "",
      sector: row[12] || "",
      ciudad: row[13] || "",
      fuente: row[14] || "",
      fechaAdded: row[15] || "",
    }));

    allLeads.push(...leads);
  }

  return allLeads;
}

function getTodayString() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function filterLeads(leads, options = {}) {
  const {
    estados = ["Interesado", "Volver a llamar", "Sin respuesta", "No contesta"],
    skipContactedToday = true,
  } = options;

  const today = getTodayString();

  return leads.filter((lead) => {
    if (!lead.telefono || lead.telefono.trim() === "") return false;
    if (!estados.includes(lead.estado)) return false;
    if (skipContactedToday && lead.fechaLlamada === today) return false;
    return true;
  });
}

module.exports = { getSheets, readAllLeads, filterLeads, getTodayString, SPREADSHEET_ID, SHEET_TABS };
