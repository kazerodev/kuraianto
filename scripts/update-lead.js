require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const readline = require("readline");
const { getSheets, readAllLeads, getTodayString, SPREADSHEET_ID } = require("./read-leads");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const ESTADOS_VALIDOS = ["Interesado", "Volver a llamar", "Sin respuesta", "No contesta", "Cliente", "Descartado"];

async function writeRow(sheets, tab, rowIndex, fields) {
  // Columns: D=estado, F=intento, H=fechaLlamada, I=hora, J=notas
  // E (Contestado) and G (Agente) are not touched
  const updates = [
    { col: "D", value: fields.estado },
    { col: "F", value: String(fields.intento) },
    { col: "H", value: fields.fechaLlamada },
    { col: "I", value: fields.hora },
    { col: "J", value: fields.notas },
  ];

  const ranges = updates.map((u) => `'${tab}'!${u.col}${rowIndex}`);
  const requests = [];

  for (let i = 0; i < ranges.length; i++) {
    requests.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: ranges[i],
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[updates[i].value]] },
      })
    );
  }

  await Promise.all(requests);
}

async function main() {
  const args = process.argv.slice(2);
  let targetRow = args[0] ? parseInt(args[0], 10) : null;

  console.log("\n=== Kuraianto – Actualizar Lead ===\n");

  let lead;

  if (targetRow) {
    const all = await readAllLeads();
    lead = all.find((l) => l.rowIndex === targetRow);
    if (!lead) {
      console.error(`No se encontró ningún lead en la fila ${targetRow}.`);
      process.exit(1);
    }
  } else {
    // Show all actionable leads and let user pick
    console.log("Cargando leads...\n");
    const all = await readAllLeads();
    const pending = all.filter((l) => l.telefono && l.estado && l.estado !== "Cliente" && l.estado !== "Descartado");

    if (pending.length === 0) {
      console.log("No hay leads pendientes.");
      rl.close();
      return;
    }

    pending.forEach((l) => {
      console.log(`  Fila ${l.rowIndex}: ${l.restaurante} | Estado: ${l.estado} | Intentos: ${l.intento} | Última llamada: ${l.fechaLlamada || "—"}`);
    });

    console.log("");
    const input = await ask("¿Qué fila quieres actualizar? ");
    targetRow = parseInt(input, 10);
    lead = pending.find((l) => l.rowIndex === targetRow);

    if (!lead) {
      console.error(`Fila ${targetRow} no encontrada en los leads pendientes.`);
      rl.close();
      process.exit(1);
    }
  }

  // Show current state
  console.log(`\nLead actual:`);
  console.log(`  Restaurante : ${lead.restaurante}`);
  console.log(`  Teléfono    : ${lead.telefono}`);
  console.log(`  Estado      : ${lead.estado}`);
  console.log(`  Intentos    : ${lead.intento}`);
  console.log(`  Última fecha: ${lead.fechaLlamada || "—"}`);
  console.log(`  Notas       : ${lead.notas || "—"}`);
  console.log("");

  // New estado
  console.log(`Estados válidos: ${ESTADOS_VALIDOS.join(", ")}`);
  const nuevoEstado = (await ask(`Nuevo estado [${lead.estado}]: `)).trim() || lead.estado;

  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    console.warn(`⚠️  "${nuevoEstado}" no está en la lista. Se guardará de todas formas.`);
  }

  // Increment intento by default
  const nuevoIntentoStr = (await ask(`Número de intento [${lead.intento + 1}]: `)).trim();
  const nuevoIntento = nuevoIntentoStr === "" ? lead.intento + 1 : parseInt(nuevoIntentoStr, 10);

  // Date and time default to now
  const today = getTodayString();
  const nowTime = new Date().toTimeString().slice(0, 5);
  const fechaInput = (await ask(`Fecha llamada [${today}]: `)).trim() || today;
  const horaInput = (await ask(`Hora [${nowTime}]: `)).trim() || nowTime;

  const notas = (await ask(`Notas (deja en blanco para conservar): `)).trim() || lead.notas;

  // Confirm before writing
  console.log("\nResumen de cambios:");
  console.log(`  Estado    : ${lead.estado} → ${nuevoEstado}`);
  console.log(`  Intentos  : ${lead.intento} → ${nuevoIntento}`);
  console.log(`  Fecha     : ${lead.fechaLlamada || "—"} → ${fechaInput}`);
  console.log(`  Hora      : ${lead.hora || "—"} → ${horaInput}`);
  console.log(`  Notas     : ${notas}`);
  console.log("");

  const confirm = (await ask("¿Guardar en Google Sheets? (s/n): ")).trim().toLowerCase();

  if (confirm !== "s" && confirm !== "si" && confirm !== "sí") {
    console.log("Cancelado. No se guardó nada.");
    rl.close();
    return;
  }

  console.log("\nGuardando...");
  const sheets = await getSheets();
  await writeRow(sheets, lead.tab, lead.rowIndex, {
    estado: nuevoEstado,
    intento: nuevoIntento,
    fechaLlamada: fechaInput,
    hora: horaInput,
    notas,
  });

  console.log(`✓ Fila ${lead.rowIndex} actualizada correctamente.`);
  rl.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  rl.close();
  process.exit(1);
});
