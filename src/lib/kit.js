export const KIT_PRECIO = 29;
export const KIT_STRIPE = "https://buy.stripe.com/14AdR25oV7x21HK2Clc7u0c";
export const PROMPTS_PDF = "/descargas/10-prompts-kuraianto.pdf";
export const WA = "https://wa.me/32485251110";

const SB_URL = "https://eskbissmbhfsnypyugqa.supabase.co";
const SB_KEY = "sb_publishable_9rNW6IW7n2ZEHaWFPVKjzg_lubhaqGp";
const UTM_KEY = "kurai_utm";
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

export function guardarUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    CAMPOS.forEach((c) => {
      const v = params.get(c);
      if (v) utm[c] = v.slice(0, 140);
    });
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    return;
  }
}

export function leerUtm() {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

export function evento(nombre, datos = {}, opciones) {
  if (window.fbq) window.fbq("track", nombre, datos, opciones);
  if (window.dataLayer) window.dataLayer.push({ event: "kit_" + nombre.toLowerCase(), ...datos });
}

export function enlaceCompra() {
  if (!KIT_STRIPE) return `${WA}?text=${encodeURIComponent("Hola, quiero comprar el Kit IA para mi negocio (29€).")}`;
  guardarUtm();
  const utm = leerUtm();
  const ref = [utm.utm_source, utm.utm_campaign, utm.utm_content].filter(Boolean).join("_").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 200);
  return ref ? `${KIT_STRIPE}?client_reference_id=${encodeURIComponent(ref)}` : KIT_STRIPE;
}

export function clickCompra(origen) {
  evento("InitiateCheckout", { value: KIT_PRECIO, currency: "EUR", content_name: "Kit IA", content_ids: ["kit-ia"], content_type: "product", origen });
}

export async function guardarLead(email, sector) {
  const r = await fetch(`${SB_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email, sector: sector || null, origen: "10-prompts", consentimiento: true, ...leerUtm() }),
  });
  if (!r.ok) throw new Error("lead " + r.status);
}

export async function pedirDescarga(sessionId) {
  const r = await fetch(`${SB_URL}/functions/v1/kit-descarga`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok || !datos.url) throw new Error(datos.error || "error");
  return datos;
}
