import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LangContext";

const TABS = ["privacidad", "cookies", "legal", "terminos"];

const content = {
  es: {
    privacidad: {
      title: "Política de privacidad",
      sections: [
        {
          h: "1. Responsable del tratamiento",
          p: "Kuraianto, con correo de contacto en kuraianto.com y teléfono +32 485 25 11 10, es el responsable del tratamiento de los datos personales que el usuario facilite a través de este sitio web.",
        },
        {
          h: "2. Datos que recopilamos",
          p: "Recopilamos únicamente los datos que el usuario facilita voluntariamente a través del formulario de contacto: nombre, teléfono (opcional) y el mensaje enviado. No recopilamos datos de forma automática salvo los inherentes a cualquier conexión web (IP, navegador, sistema operativo) registrados de forma anónima.",
        },
        {
          h: "3. Finalidad del tratamiento",
          p: "Los datos facilitados se utilizan exclusivamente para responder a las consultas del usuario y gestionar la relación comercial derivada del interés en nuestros servicios. No utilizamos los datos para ninguna otra finalidad.",
        },
        {
          h: "4. Base legal",
          p: "El tratamiento se basa en el consentimiento del usuario, otorgado al enviar el formulario de contacto, y en el interés legítimo de Kuraianto para responder a consultas comerciales.",
        },
        {
          h: "5. Conservación de datos",
          p: "Los datos se conservan durante el tiempo necesario para gestionar la consulta o relación comercial y, en todo caso, no más de tres años desde el último contacto, salvo que la normativa aplicable exija un periodo distinto.",
        },
        {
          h: "6. Destinatarios",
          p: "No cedemos ni vendemos los datos a terceros. Únicamente podremos comunicarlos a proveedores de servicio que actúen como encargados del tratamiento (por ejemplo, plataformas de comunicación como WhatsApp/Meta y herramientas de mensajería), siempre bajo acuerdo de confidencialidad y dentro del marco legal vigente.",
        },
        {
          h: "7. Derechos del usuario",
          p: "El usuario tiene derecho a acceder, rectificar, suprimir, limitar, oponerse y solicitar la portabilidad de sus datos. Para ejercer estos derechos puede contactarnos en +32 485 25 11 10 o a través del formulario de la web. Asimismo, tiene derecho a presentar una reclamación ante la autoridad de control competente.",
        },
        {
          h: "8. Seguridad",
          p: "Adoptamos las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos y evitar su alteración, pérdida, tratamiento o acceso no autorizado.",
        },
      ],
    },
    cookies: {
      title: "Política de cookies",
      sections: [
        {
          h: "1. Qué son las cookies?",
          p: "Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten que el sitio recuerde información sobre la visita para mejorar la experiencia.",
        },
        {
          h: "2. Cookies que utilizamos",
          p: "Este sitio web utiliza un mínimo de cookies. En concreto:\n\n• Cookies técnicas esenciales: necesarias para el funcionamiento básico del sitio (sesión del usuario, preferencia de idioma). No requieren consentimiento.\n\n• Cookies de análisis (opcionales): si se activan, permiten obtener estadísticas anónimas sobre el uso del sitio para mejorar el servicio. Solo se activan con el consentimiento previo del usuario.",
        },
        {
          h: "3. Cookies de terceros",
          p: "Este sitio puede cargar recursos de terceros (fuentes tipográficas de Google Fonts, enlaces de pago a Stripe, enlace de WhatsApp). Estos terceros pueden establecer sus propias cookies sujetas a sus respectivas políticas de privacidad.",
        },
        {
          h: "4. Gestión de cookies",
          p: "El usuario puede configurar su navegador para rechazar todas las cookies, aceptar solo las esenciales o ser notificado cuando se almacene una cookie. Consulta la configuración de tu navegador para más información. La desactivación de cookies no técnicas no afecta al funcionamiento del sitio.",
        },
        {
          h: "5. Actualización",
          p: "Nos reservamos el derecho a actualizar esta política en cualquier momento. Cualquier cambio relevante se comunicará en esta página.",
        },
      ],
    },
    legal: {
      title: "Aviso legal",
      sections: [
        {
          h: "1. Identificación",
          p: "Titular: Kuraianto\nContacto: +32 485 25 11 10\nDominio: kuraianto.com\n\nEn cumplimiento del deber de información, se ponen a disposición del usuario los datos identificativos del titular del sitio web.",
        },
        {
          h: "2. Objeto",
          p: "El presente aviso legal regula el acceso y uso del sitio web kuraianto.com, así como los servicios de información y contratación disponibles en él.",
        },
        {
          h: "3. Condiciones de uso",
          p: "El acceso y uso del sitio web es libre y gratuito. El usuario se compromete a hacer un uso correcto del sitio web de conformidad con la legislación vigente y con el presente aviso legal, y a no realizar actividades ilícitas o contrarias a la buena fe.",
        },
        {
          h: "4. Propiedad intelectual e industrial",
          p: "Todos los contenidos del sitio web (textos, imágenes, diseño, código fuente, logotipos y marcas) son propiedad de Kuraianto o de terceros que han autorizado su uso, y están protegidos por la legislación de propiedad intelectual e industrial aplicable. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.",
        },
        {
          h: "5. Exclusión de garantías y responsabilidad",
          p: "Kuraianto no garantiza la disponibilidad continua del sitio ni la ausencia de errores en los contenidos. No se responsabiliza de los daños que puedan derivarse del uso o imposibilidad de uso del sitio web ni de los contenidos de sitios web de terceros enlazados.",
        },
        {
          h: "6. Legislación aplicable y jurisdicción",
          p: "Este aviso legal se rige por la normativa española y europea vigente. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales competentes según la normativa aplicable.",
        },
      ],
    },
    terminos: {
      title: "Términos y condiciones",
      sections: [
        {
          h: "1. Objeto",
          p: "Los presentes términos y condiciones regulan la contratación de los servicios ofrecidos por Kuraianto a través del sitio web kuraianto.com.",
        },
        {
          h: "2. Proceso de contratación",
          p: "El proceso de contratación se inicia cuando el cliente solicita información o una demo gratuita a través del formulario de contacto o WhatsApp. Una vez acordados los términos del proyecto, Kuraianto envía un contrato formal con los detalles del servicio, precio y plazos. El contrato queda formalizado con la aceptación del cliente y el pago de reserva.",
        },
        {
          h: "3. Pago de reserva",
          p: "Para confirmar un encargo, el cliente abona un pago de reserva cuyo importe se descuenta del precio total. Este pago confirma la disponibilidad de Kuraianto para iniciar el proyecto. En caso de cancelación por parte del cliente, el pago de reserva no es reembolsable salvo acuerdo expreso por escrito.",
        },
        {
          h: "4. Precios y forma de pago",
          p: "Los precios indicados en el sitio web están expresados en euros e incluyen los impuestos aplicables según la normativa vigente. Los pagos se realizan a través de los métodos habilitados en el sitio (Stripe) o por transferencia bancaria según se acuerde. Kuraianto se reserva el derecho a modificar los precios en cualquier momento; sin embargo, los precios vigentes en el momento de la formalización del contrato serán los aplicables al proyecto.",
        },
        {
          h: "5. Plazos de entrega",
          p: "Los plazos indicados son orientativos y dependen de la entrega de los materiales necesarios por parte del cliente (textos, imágenes, accesos, etc.). Los retrasos en la entrega de materiales por parte del cliente podrán implicar un ajuste en los plazos de entrega.",
        },
        {
          h: "6. Derechos de propiedad",
          p: "Una vez completado el pago total del proyecto, el cliente adquiere los derechos de uso del sitio web desarrollado. Kuraianto se reserva el derecho a mostrar el proyecto en su portfolio como referencia de trabajo, salvo indicación expresa en contrario del cliente.",
        },
        {
          h: "7. Garantía y soporte",
          p: "Kuraianto garantiza el correcto funcionamiento del sitio web entregado durante 30 días desde la entrega, cubriendo los errores técnicos imputables al desarrollo. Pasado este periodo, las modificaciones o el soporte continuado están sujetos al servicio de mantenimiento.",
        },
        {
          h: "8. Limitación de responsabilidad",
          p: "Kuraianto no se responsabiliza de los resultados de negocio derivados del uso de los servicios contratados, incluyendo posicionamiento en buscadores, captación de clientes o incremento de ventas, ya que estos dependen de múltiples factores externos.",
        },
        {
          h: "9. Legislación aplicable",
          p: "Estos términos se rigen por la normativa española y de la Unión Europea. Cualquier discrepancia se resolverá en los tribunales competentes según la normativa vigente.",
        },
      ],
    },
  },
  en: {
    privacidad: {
      title: "Privacy Policy",
      sections: [
        {
          h: "1. Data Controller",
          p: "Kuraianto, reachable at kuraianto.com and +32 485 25 11 10, is the data controller for personal data provided by users through this website.",
        },
        {
          h: "2. Data we collect",
          p: "We only collect data that the user voluntarily provides through the contact form: name, phone number (optional), and the message sent. We do not automatically collect data beyond what is inherent to any web connection (IP, browser, operating system), recorded anonymously.",
        },
        {
          h: "3. Purpose of processing",
          p: "The data provided is used exclusively to respond to user enquiries and manage the commercial relationship arising from interest in our services. We do not use the data for any other purpose.",
        },
        {
          h: "4. Legal basis",
          p: "Processing is based on the user's consent, given by submitting the contact form, and on Kuraianto's legitimate interest in responding to commercial enquiries.",
        },
        {
          h: "5. Data retention",
          p: "Data is retained for as long as necessary to manage the enquiry or commercial relationship, and in any case no longer than three years from the last contact, unless applicable regulations require a different period.",
        },
        {
          h: "6. Recipients",
          p: "We do not share or sell data to third parties. We may only communicate them to service providers acting as data processors (e.g., communication platforms such as WhatsApp/Meta and messaging tools), always under a confidentiality agreement and within the current legal framework.",
        },
        {
          h: "7. User rights",
          p: "Users have the right to access, rectify, erase, restrict, object to, and request portability of their data. To exercise these rights, contact us at +32 485 25 11 10 or through the website form. You also have the right to lodge a complaint with the competent supervisory authority.",
        },
        {
          h: "8. Security",
          p: "We implement the necessary technical and organisational measures to ensure the security of data and prevent its alteration, loss, processing, or unauthorised access.",
        },
      ],
    },
    cookies: {
      title: "Cookies Policy",
      sections: [
        {
          h: "1. What are cookies?",
          p: "Cookies are small text files stored on the user's device when visiting a website. They allow the site to remember information about the visit to improve the experience.",
        },
        {
          h: "2. Cookies we use",
          p: "This website uses a minimum number of cookies. Specifically:\n\n• Essential technical cookies: required for the basic operation of the site (user session, language preference). No consent required.\n\n• Analytics cookies (optional): if enabled, they allow us to obtain anonymous statistics about site usage to improve the service. These are only activated with the user's prior consent.",
        },
        {
          h: "3. Third-party cookies",
          p: "This site may load resources from third parties (Google Fonts typefaces, Stripe payment links, WhatsApp link). These third parties may set their own cookies subject to their respective privacy policies.",
        },
        {
          h: "4. Managing cookies",
          p: "Users can configure their browser to reject all cookies, accept only essential ones, or be notified when a cookie is stored. Check your browser settings for more information. Disabling non-technical cookies does not affect the functionality of the site.",
        },
        {
          h: "5. Updates",
          p: "We reserve the right to update this policy at any time. Any relevant changes will be communicated on this page.",
        },
      ],
    },
    legal: {
      title: "Legal Notice",
      sections: [
        {
          h: "1. Identification",
          p: "Owner: Kuraianto\nContact: +32 485 25 11 10\nDomain: kuraianto.com\n\nIn compliance with the duty to inform, the identifying details of the website owner are made available to users.",
        },
        {
          h: "2. Purpose",
          p: "This legal notice governs access to and use of the website kuraianto.com, as well as the information and contracting services available on it.",
        },
        {
          h: "3. Terms of use",
          p: "Access to and use of the website is free of charge. Users agree to use the website correctly in accordance with applicable legislation and this legal notice, and not to engage in any unlawful activities or activities contrary to good faith.",
        },
        {
          h: "4. Intellectual and industrial property",
          p: "All website content (texts, images, design, source code, logos, and trademarks) belongs to Kuraianto or to third parties who have authorised its use, and is protected by applicable intellectual and industrial property legislation. Reproduction, distribution, or modification without express authorisation is prohibited.",
        },
        {
          h: "5. Disclaimer",
          p: "Kuraianto does not guarantee continuous availability of the site or the absence of errors in the content. We are not responsible for any damage arising from the use or inability to use the website or the content of linked third-party websites.",
        },
        {
          h: "6. Applicable law and jurisdiction",
          p: "This legal notice is governed by applicable Spanish and European regulations. For the resolution of any dispute, the parties submit to the competent courts and tribunals under applicable law.",
        },
      ],
    },
    terminos: {
      title: "Terms & Conditions",
      sections: [
        {
          h: "1. Purpose",
          p: "These terms and conditions govern the contracting of services offered by Kuraianto through the website kuraianto.com.",
        },
        {
          h: "2. Contracting process",
          p: "The contracting process begins when the client requests information or a free demo via the contact form or WhatsApp. Once the project terms are agreed, Kuraianto sends a formal contract with service details, price, and timelines. The contract is formalised upon the client's acceptance and reservation payment.",
        },
        {
          h: "3. Reservation payment",
          p: "To confirm an order, the client pays a reservation fee which is deducted from the total price. This payment confirms Kuraianto's availability to start the project. In the event of cancellation by the client, the reservation payment is non-refundable unless expressly agreed otherwise in writing.",
        },
        {
          h: "4. Prices and payment",
          p: "Prices shown on the website are in euros and include applicable taxes under current regulations. Payments are made through the methods enabled on the site (Stripe) or by bank transfer as agreed. Kuraianto reserves the right to modify prices at any time; however, the prices in effect at the time of contract formalisation will apply to the project.",
        },
        {
          h: "5. Delivery timelines",
          p: "Timelines shown are approximate and depend on the client's timely delivery of required materials (texts, images, access credentials, etc.). Delays in the client's delivery of materials may result in an adjustment to delivery timelines.",
        },
        {
          h: "6. Ownership rights",
          p: "Once full payment for the project is complete, the client acquires usage rights to the developed website. Kuraianto reserves the right to display the project in its portfolio as a work reference, unless explicitly requested otherwise by the client.",
        },
        {
          h: "7. Warranty and support",
          p: "Kuraianto guarantees the correct functioning of the delivered website for 30 days from delivery, covering technical errors attributable to the development. After this period, modifications or ongoing support are subject to the maintenance service.",
        },
        {
          h: "8. Limitation of liability",
          p: "Kuraianto is not responsible for business results arising from the use of contracted services, including search engine ranking, client acquisition, or sales growth, as these depend on multiple external factors.",
        },
        {
          h: "9. Applicable law",
          p: "These terms are governed by Spanish and European Union law. Any dispute shall be resolved before the competent courts under applicable regulations.",
        },
      ],
    },
  },
};

function Section({ h, p }) {
  return (
    <div className="mb-8">
      <h2 className="text-white font-semibold text-base mb-2">{h}</h2>
      <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{p}</p>
    </div>
  );
}

function Politicas() {
  const { lang, t } = useLang();
  const tabs = t.policies.tabs;

  const [active, setActive] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return TABS.includes(hash) ? hash : TABS[0];
  });

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (TABS.includes(hash)) setActive(hash);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleTab = (id) => {
    window.location.hash = id;
    setActive(id);
  };

  const pol = (content[lang] || content.en)[active];

  const metaTitles = {
    es: {
      privacidad: "Política de Privacidad | Kuraianto",
      cookies: "Política de Cookies | Kuraianto",
      legal: "Aviso Legal | Kuraianto",
      terminos: "Términos y Condiciones | Kuraianto",
    },
    en: {
      privacidad: "Privacy Policy | Kuraianto",
      cookies: "Cookies Policy | Kuraianto",
      legal: "Legal Notice | Kuraianto",
      terminos: "Terms & Conditions | Kuraianto",
    },
    nl: {
      privacidad: "Privacybeleid | Kuraianto",
      cookies: "Cookiebeleid | Kuraianto",
      legal: "Juridische mededeling | Kuraianto",
      terminos: "Algemene voorwaarden | Kuraianto",
    },
    fr: {
      privacidad: "Politique de confidentialité | Kuraianto",
      cookies: "Politique de cookies | Kuraianto",
      legal: "Mentions légales | Kuraianto",
      terminos: "Conditions générales | Kuraianto",
    },
  };

  return (
    <div className="bg-neutral-950 min-h-screen">
      <Helmet>
        <title>{metaTitles[lang][active]}</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://kuraianto.com/politicas" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-3">{t.footer.legal_title}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">{pol.title}</h1>

        <div className="flex flex-wrap gap-2 mb-12 border-b border-white/5 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === tab.id
                  ? "bg-orange-500 text-white"
                  : "text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div key={active + lang}>
          {pol.sections.map((s) => (
            <Section key={s.h} h={s.h} p={s.p} />
          ))}
        </div>

        <p className="text-neutral-600 text-xs mt-12 border-t border-white/5 pt-6">
          {{ es: "Última actualización: mayo de 2026", en: "Last updated: May 2026", nl: "Laatste update: mei 2026", fr: "Dernière mise à jour : mai 2026" }[lang] || "Last updated: May 2026"} · Kuraianto · kuraianto.com
        </p>
      </div>
    </div>
  );
}

export default Politicas;
