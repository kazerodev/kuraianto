export const STORAGE_KEY = "kurai_cookie_consent";

const GTM_ID = "GTM-N3RHTTF3";
const PIXEL_ID = "1459119875967522";

let cargado = false;

export function leerConsentimiento() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function guardarConsentimiento(valor) {
  try {
    localStorage.setItem(STORAGE_KEY, valor);
  } catch {
    /* navegador con almacenamiento bloqueado */
  }
}

export function cargarEtiquetas() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const gtm = document.createElement("script");
  gtm.async = true;
  gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  document.head.appendChild(gtm);

  if (!window.fbq) {
    const n = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    window._fbq = n;
    const px = document.createElement("script");
    px.async = true;
    px.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(px);
  }
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

export function iniciarEtiquetasSiHayConsentimiento() {
  if (leerConsentimiento() === "accepted") cargarEtiquetas();
}
