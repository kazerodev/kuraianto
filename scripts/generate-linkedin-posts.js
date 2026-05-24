const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const LI_DIR  = path.join(CONTENT, 'linkedin');
const CSV_PATH = path.join(CONTENT, 'linkedin-posts.csv');

// ── Start date: 2026-05-13 ───────────────────────────────────────────────────
const START = new Date('2026-05-13');

function dateStr(offset) {
  const d = new Date(START);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

// ── Post bank (30 curated Spanish posts) ────────────────────────────────────
const POSTS = [
  {
    category: 'Web design tips',
    format: 'short-educational',
    hook: 'Tu web no tiene que ser bonita. Tiene que convertir.',
    body: `La mayoría de los negocios locales tienen una web que parece un folleto.

Se ve bien, pero no hace nada.

Una web que convierte tiene una cosa clara: le dice al visitante qué tiene que hacer y por qué hacerlo ahora.

Sin eso, el diseño da igual.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#DiseñoWeb #MarketingDigital #NegociosLocales',
  },
  {
    category: 'SEO local tips',
    format: 'checklist',
    hook: 'Antes de hacer publicidad, asegúrate de que te encuentren gratis.',
    body: `Si tienes un negocio local, esto es lo mínimo que necesitas en Google:

✓ Ficha de Google Business actualizada
✓ Nombre, dirección y teléfono iguales en todos sitios
✓ Categoría correcta
✓ Al menos 10 fotos reales del negocio
✓ Responder a las reseñas

Sin esto, los anuncios de pago tienen menos impacto del que esperarías.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#SEOLocal #GoogleBusiness #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Common website mistakes',
    format: 'mistake',
    hook: '3 errores que veo en webs de negocios locales casi siempre.',
    body: `1. El número de teléfono no se puede pulsar en móvil.
2. La web tarda más de 3 segundos en cargar.
3. No hay ningún botón claro de "contactar" o "reservar".

Son cosas pequeñas, pero cuestan clientes reales.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#DiseñoWeb #ErroresWeb #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Google Ads tips',
    format: 'short-educational',
    hook: 'Google Ads no es tirar dinero. Pero puede serlo si no sabes lo que miras.',
    body: `Lo que más veo en cuentas de pequeños negocios:

— Palabras clave demasiado genéricas
— Sin lista de palabras negativas
— Landing page que no tiene nada que ver con el anuncio

El problema no suele ser el presupuesto. Es a dónde va ese presupuesto.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#GoogleAds #PublicidadOnline #MarketingDigital #NegociosLocales',
  },
  {
    category: 'Lessons from building Kuraianto',
    format: 'story',
    hook: 'Lo que aprendí las primeras semanas contactando negocios locales.',
    body: `Pensé que la parte difícil iba a ser el servicio. Resulta que es llegar a la persona que decide.

La mayoría de los contactos van a quien responde el teléfono o Instagram, no al dueño.

Cambié el enfoque: mensajes directos, cortos, con algo concreto que ofrecerles. Sin rodeos.

Aún estoy aprendiendo, pero ese cambio marcó la diferencia.`,
    cta: 'Puedes ver más en kuraianto.com',
    hashtags: '#Emprendimiento #Ventas #MarketingDigital #Agencia',
  },
  {
    category: 'Meta Ads tips',
    format: 'short-educational',
    hook: 'Un anuncio de Meta bien hecho no parece un anuncio.',
    body: `Los mejores resultados en Meta Ads son de creatividades que parecen contenido normal.

Una foto real del negocio. Una situación cotidiana. Una frase directa.

Nada de stock photos con letras en Comic Sans.

La gente no para el scroll por un banner. Para por algo que le resulta familiar o relevante.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#MetaAds #FacebookAds #PublicidadDigital #MarketingDigital',
  },
  {
    category: 'Advice for restaurants',
    format: 'opinion',
    hook: 'Instagram no reemplaza una web para tu restaurante.',
    body: `Instagram es para descubrir. Una web es para decidir.

Cuando alguien ve tu restaurante en Instagram y le interesa, lo primero que hace es buscarte en Google.

Si no te encuentra, o lo que ve no le convence, va al siguiente.

No tienes que elegir entre Instagram y una web. Las dos hacen cosas distintas.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#Restaurantes #MarketingDigital #DiseñoWeb #NegociosLocales',
  },
  {
    category: 'Lead generation',
    format: 'checklist',
    hook: 'Antes de pagar por publicidad, revisa esto.',
    body: `Si vas a invertir en anuncios, estas cosas tienen que estar en orden primero:

✓ Tu web carga bien en móvil
✓ Hay un formulario o botón de contacto visible
✓ Tienes claro qué quieres que haga el visitante
✓ Alguien va a responder los mensajes que lleguen

Publicidad en una web rota es como llenar agua en un cubo con agujeros.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#GeneraciónDeLeads #MarketingDigital #PublicidadOnline #NegociosLocales',
  },
  {
    category: 'AI for small businesses',
    format: 'short-educational',
    hook: 'La IA no va a sustituir tu negocio. Pero puede ahorrarte horas.',
    body: `Cosas que uso con IA en el día a día:

— Responder correos difíciles más rápido
— Hacer resúmenes de reuniones
— Crear primeros borradores de textos para webs
— Revisar presupuestos antes de enviarlos

No hace magia. Pero sí reduce el tiempo en tareas que antes quitaban la mañana.`,
    cta: 'Puedes ver más en kuraianto.com',
    hashtags: '#InteligenciaArtificial #Productividad #Emprendimiento #NegociosLocales',
  },
  {
    category: 'Outreach / sales lessons',
    format: 'story',
    hook: 'Mandé 50 mensajes a negocios locales. Esto es lo que pasó.',
    body: `La mayoría no respondió. Algunos dijeron que ya tenían web.

Pero unos pocos contestaron con algo interesante: "¿qué me ofrecerías exactamente?"

Eso me enseñó que el mensaje no puede ser "tengo una agencia". Tiene que ser "esto es lo que puedo hacer por ti, específicamente".

La personalización no es opcional. Es lo único que funciona.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#Ventas #Outreach #Emprendimiento #MarketingDigital',
  },
  {
    category: 'SEO local tips',
    format: 'opinion',
    hook: 'Google no posiciona webs. Posiciona respuestas.',
    body: `Cuando alguien busca "dentista en Valencia", Google le quiere dar la mejor respuesta posible.

Si tu web habla de ti pero no responde lo que la gente pregunta, tendrás problemas para aparecer.

¿Tu web responde: dónde estás, qué haces, a quién ayudas, cómo contactar?

Si no, eso es lo primero que cambiaría.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#SEOLocal #MarketingDigital #DiseñoWeb #NegociosLocales',
  },
  {
    category: 'Advice for clinics',
    format: 'short-educational',
    hook: 'Una clínica sin web actualizada parece que ya no existe.',
    body: `No lo digo yo. Lo dice el paciente que te busca en Google y no encuentra nada reciente.

Una web básica pero actualizada transmite:
— Que sigues abierto
— Que eres profesional
— Que te pueden encontrar fácilmente

No hace falta que sea cara. Hace falta que esté.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#Clinicas #MarketingDigital #DiseñoWeb #NegociosLocales',
  },
  {
    category: 'Common website mistakes',
    format: 'mistake',
    hook: 'Tu web tiene menos de 5 segundos para convencerme.',
    body: `En serio. Los estudios dicen 3. Yo te doy 5 por generoso.

Si en ese tiempo no entiendo qué haces, para quién lo haces y qué tengo que hacer a continuación, me voy.

Revisa tu web ahora mismo.

¿Está claro desde el primer vistazo?`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#DiseñoWeb #UX #MarketingDigital #NegociosLocales',
  },
  {
    category: 'Google Ads tips',
    format: 'checklist',
    hook: 'Si usas Google Ads, asegúrate de tener esto configurado.',
    body: `Lista básica antes de activar ninguna campaña:

✓ Conversiones de formulario configuradas
✓ Seguimiento de llamadas activado
✓ Lista de palabras negativas mínima
✓ Extensiones de llamada y ubicación activas
✓ Presupuesto diario que puedes mantener al menos 30 días

Sin esto, gastarás dinero sin saber qué está funcionando.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#GoogleAds #MarketingDigital #PublicidadOnline #Emprendimiento',
  },
  {
    category: 'Lessons from building Kuraianto',
    format: 'story',
    hook: 'Por qué empecé ofreciendo demos gratis antes de cobrar nada.',
    body: `Cuando monté Kuraianto, me di cuenta de algo: pedir confianza sin dar nada primero es difícil.

Entonces decidí que antes de hablar de precios, mostraría el producto. Una demo real del sitio web que podría tener ese negocio.

No para regalar trabajo. Sino para que la conversación parta de algo concreto.

Es más fácil decir sí a algo que ya puedes ver.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#Emprendimiento #Ventas #DiseñoWeb #NegociosLocales',
  },
  {
    category: 'Meta Ads tips',
    format: 'checklist',
    hook: 'Antes de crear un anuncio en Meta, responde estas preguntas.',
    body: `¿A quién le estoy hablando exactamente?
¿Qué problema tiene esa persona?
¿Qué quiero que haga al ver el anuncio?
¿La imagen o vídeo capta la atención en los primeros 2 segundos?
¿El texto es claro sin tener que leerlo todo?

Si no tienes respuesta para alguna de estas, para antes de gastar presupuesto.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#MetaAds #PublicidadDigital #MarketingDigital #FacebookAds',
  },
  {
    category: 'Lead generation',
    format: 'opinion',
    hook: 'La mejor fuente de clientes para un negocio local sigue siendo Google.',
    body: `Las redes sociales son buenas para visibilidad. Google es donde la gente va cuando ya quiere comprar o contratar.

Está buscando activamente. Tiene intención. Solo necesitas aparecer delante de él en el momento correcto.

Por eso SEO local y Google Ads bien configurados suelen dar mejor retorno que Meta para la mayoría de negocios locales.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#SEOLocal #GoogleAds #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Advice for local businesses',
    format: 'short-educational',
    hook: 'El boca a boca está bien. Hasta que necesitas más clientes.',
    body: `Hay negocios que llevan años funcionando solo por recomendaciones. Y funciona, hasta que no funciona.

Una temporada floja, un verano raro, un competidor nuevo cerca.

Tener una web y un perfil de Google bien puesto es el seguro básico.

No reemplaza el boca a boca. Lo complementa.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#NegociosLocales #MarketingDigital #DiseñoWeb #Emprendimiento',
  },
  {
    category: 'AI for small businesses',
    format: 'checklist',
    hook: 'Estas herramientas de IA te pueden ahorrar horas cada semana.',
    body: `Sin complicaciones:

✓ ChatGPT o Claude para textos y correos
✓ Canva con IA para imágenes rápidas
✓ Notion AI para organizar notas y ideas
✓ Otter.ai para transcribir reuniones

Ninguna cuesta más de 20€ al mes. Todas hacen cosas que antes tardaban horas.`,
    cta: 'Puedes ver más en kuraianto.com',
    hashtags: '#InteligenciaArtificial #Productividad #NegociosLocales #Herramientas',
  },
  {
    category: 'Case-style posts',
    format: 'story',
    hook: 'Qué cambia en un negocio cuando arreglan su web.',
    body: `Sin dar nombres, he visto negocios que:

— Pasaron de no aparecer en Google a salir en los primeros resultados de su ciudad.
— Dejaron de recibir llamadas confusas porque la web ya explicaba bien los servicios.
— Empezaron a recibir mensajes de personas que "vieron la web".

No son milagros. Son consecuencias lógicas de tener presencia digital que funciona.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#DiseñoWeb #SEOLocal #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Outreach / sales lessons',
    format: 'opinion',
    hook: 'El mayor error al vender servicios digitales a negocios locales.',
    body: `Hablar de tecnología cuando el cliente habla de clientes.

A un restaurante no le importa si tu web usa React o WordPress. Le importa si va a conseguir más reservas.

El lenguaje tiene que ser el de su problema, no el de tu solución.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#Ventas #MarketingDigital #Emprendimiento #Agencia',
  },
  {
    category: 'Web design tips',
    format: 'opinion',
    hook: 'Una web en Wix puede funcionar. Una web mal estructurada, no.',
    body: `He visto webs caras que no funcionan y webs simples que sí.

La herramienta importa menos de lo que parece. Lo que importa es:

— Que cargue rápido
— Que sea clara en móvil
— Que tenga una llamada a la acción visible
— Que el contenido responda las preguntas del visitante

El resto es secundario.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#DiseñoWeb #MarketingDigital #NegociosLocales',
  },
  {
    category: 'Advice for local businesses',
    format: 'short-educational',
    hook: 'En el sector inmobiliario, la primera impresión digital lo es todo.',
    body: `El comprador o arrendatario ya ha visto 10 opciones antes de contactarte.

Si tu web no muestra las propiedades de forma clara, si las fotos son malas, si no hay forma fácil de contactar...

Has perdido al cliente antes de hablar con él.

La presentación digital en este sector no es opcional. Es parte del servicio.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#Inmobiliaria #MarketingDigital #DiseñoWeb #NegociosLocales',
  },
  {
    category: 'SEO local tips',
    format: 'checklist',
    hook: '¿Apareces cuando buscan lo que haces en tu ciudad?',
    body: `Prueba esto ahora:

Abre Google en modo incógnito y busca tu servicio + tu ciudad.

¿Apareces en los primeros resultados?
¿Tienes tu ficha de Google Business completa?
¿Tu web menciona tu ciudad y tu servicio juntos?

Si la respuesta es no a alguna de estas, hay trabajo por hacer. Y no es tan complicado como parece.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#SEOLocal #GoogleBusiness #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Lessons from building Kuraianto',
    format: 'story',
    hook: 'Por qué monté Kuraianto.',
    body: `Vi que muchos negocios locales están perdiendo clientes sin saberlo.

No es que no quieran tener presencia digital. Es que no tienen tiempo, no saben por dónde empezar, o les han pedido precios que no tienen sentido para su tamaño.

El servicio que quería construir tenía que ser concreto, honesto y sin rodeos.

Todavía estoy construyéndolo. Pero eso es lo que guía cada decisión.`,
    cta: 'Puedes ver más en kuraianto.com',
    hashtags: '#Emprendimiento #Kuraianto #MarketingDigital #NegociosLocales',
  },
  {
    category: 'Google Ads tips',
    format: 'opinion',
    hook: 'Pagar por clics no es lo mismo que pagar por clientes.',
    body: `Google Ads te cobra por el clic, no por el resultado.

Si mandas ese clic a una web que no convierte, estás pagando para que alguien se vaya.

Por eso lo primero siempre es la landing page. El anuncio viene después.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#GoogleAds #MarketingDigital #PublicidadOnline #NegociosLocales',
  },
  {
    category: 'Common website mistakes',
    format: 'mistake',
    hook: '5 cosas que tu web puede estar haciendo mal en móvil.',
    body: `1. El texto es demasiado pequeño para leer.
2. Los botones están demasiado juntos para pulsar.
3. El formulario tiene demasiados campos.
4. Las imágenes tardan demasiado en cargar.
5. No hay número de teléfono visible sin hacer scroll.

Revisa tu web desde el móvil ahora mismo. Probablemente algo de esto está pasando.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#DiseñoWeb #MovilFirst #UX #NegociosLocales',
  },
  {
    category: 'Advice for clinics',
    format: 'opinion',
    hook: 'Las reseñas en Google valen más que un anuncio para una clínica.',
    body: `Cuando alguien busca un dentista o médico, lo primero que mira son las reseñas.

Una clínica con 30 reseñas reales y una media de 4.5 gana a cualquier anuncio.

Pedir reseñas a pacientes satisfechos es incómodo. Pero es probablemente la mejor inversión en marketing que puede hacer una clínica pequeña.`,
    cta: 'Si tienes un negocio local, puedo prepararte una primera idea sin compromiso.',
    hashtags: '#Clinicas #Dentistas #SEOLocal #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Lead generation',
    format: 'short-educational',
    hook: 'La diferencia entre visitas y clientes está en un botón.',
    body: `He visto webs con tráfico decente que no generan contactos.

El problema casi siempre es el mismo: no hay una acción clara que hacer.

Un botón de WhatsApp visible. Un formulario corto. Un número de teléfono que se puede pulsar.

Son cosas simples. Pero sin ellas, las visitas se van sin dejar rastro.`,
    cta: 'Si quieres que revise tu web, mándamela y te digo qué mejoraría.',
    hashtags: '#GeneraciónDeLeads #DiseñoWeb #MarketingDigital #NegociosLocales',
  },
  {
    category: 'Advice for restaurants',
    format: 'checklist',
    hook: 'Si tienes un restaurante, esto es lo mínimo que necesitas online.',
    body: `✓ Ficha de Google Business con horarios y fotos actualizadas
✓ Menú visible (PDF o página, lo que sea, pero que esté)
✓ Número de teléfono o enlace de reserva claro
✓ Al menos 20 fotos reales de platos y del local
✓ Responder a todas las reseñas, buenas y malas

Con esto bien hecho ya estás por encima de muchos competidores.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#Restaurantes #SEOLocal #NegociosLocales #MarketingDigital',
  },
  {
    category: 'Soft sales post',
    format: 'soft-sales',
    hook: 'Si tienes un negocio local y quieres mejorar tu presencia online, esto es lo que hago.',
    body: `En Kuraianto trabajo con negocios locales que quieren:

— Una web que les ayude a conseguir clientes
— Aparecer en Google cuando les buscan en su ciudad
— Anuncios que tengan sentido para su presupuesto

No prometo resultados mágicos. Trabajo con honestidad y con foco en lo que realmente importa para tu negocio.

Si quieres, puedo prepararte una demo o una primera revisión sin compromiso.`,
    cta: 'Si tienes un negocio y quieres una demo gratis de tu web, escríbeme.',
    hashtags: '#Kuraianto #MarketingDigital #DiseñoWeb #NegociosLocales #SEOLocal',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function csvCell(s) {
  const str = String(s == null ? '' : s);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildMarkdown(p, date) {
  return `# ${p.hook}

**Date:** ${date}
**Category:** ${p.category}
**Format:** ${p.format}
**Status:** Draft

---

## Hook

${p.hook}

---

## Post

${p.body}

---

**CTA:** ${p.cta}

**Hashtags:** ${p.hashtags}

---

## Notes

_Añade tus notas aquí antes de publicar._
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(LI_DIR, { recursive: true });

  const csvRows = [
    ['Date','Category','Format','Hook','Post body','CTA','Hashtags','Status','Notes']
      .map(csvCell).join(',')
  ];

  POSTS.forEach(function(p, i) {
    const date     = dateStr(i);
    const slug     = slugify(p.hook);
    const filename = date + '-' + slug + '.md';
    const mdPath   = path.join(LI_DIR, filename);

    fs.writeFileSync(mdPath, buildMarkdown(p, date), 'utf8');

    csvRows.push([
      date, p.category, p.format, p.hook, p.body, p.cta, p.hashtags, 'Draft', ''
    ].map(csvCell).join(','));
  });

  fs.writeFileSync(CSV_PATH, csvRows.join('\n'), 'utf8');

  console.log('\n✓ Generated ' + POSTS.length + ' posts');
  console.log('  CSV  → content/linkedin-posts.csv');
  console.log('  MD   → content/linkedin/ (' + POSTS.length + ' files)');
  console.log('\n── 5 examples ──────────────────────────────────────────────\n');

  [0, 4, 9, 14, 29].forEach(function(i) {
    const p = POSTS[i];
    console.log('[' + dateStr(i) + '] ' + p.category + ' (' + p.format + ')');
    console.log('HOOK: ' + p.hook);
    console.log('CTA:  ' + p.cta);
    console.log('TAGS: ' + p.hashtags);
    console.log('────────────────────────────────────────────────────────────\n');
  });
}

main();
