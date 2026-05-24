# Kuraianto · LinkedIn Content System

Sistema local para generar, revisar y organizar posts de LinkedIn sin publicar automáticamente.

---

## Estructura de archivos

```
scripts/generate-linkedin-posts.js   ← generador principal
content/
  linkedin-posts.csv                 ← todos los posts en tabla
  linkedin/
    YYYY-MM-DD-categoria.md          ← un archivo por post
  linkedin-dashboard.html            ← panel de revisión visual
LINKEDIN_CONTENT_README.md           ← este archivo
```

---

## Generar los posts

```bash
node scripts/generate-linkedin-posts.js
```

Genera:
- `content/linkedin-posts.csv` — 30 posts en formato tabla
- `content/linkedin/*.md` — un archivo markdown por post
- Muestra 5 ejemplos en consola

---

## Revisar posts con el dashboard

Abre el archivo directamente en tu navegador:

```
content/linkedin-dashboard.html
```

El dashboard permite:
- Ver todos los posts con fecha, categoría, formato y estado
- Filtrar por estado / categoría / formato / búsqueda libre
- Expandir el cuerpo completo de cada post
- Copiar el post completo listo para pegar en LinkedIn
- Copiar solo los hashtags
- Marcar como: Reviewed / Scheduled / Published / Draft
- Añadir notas por post

Los estados se guardan en `localStorage` del navegador. Son persistentes
mientras uses el mismo navegador y no borres el almacenamiento.

---

## Flujo de trabajo recomendado

1. Ejecuta el script para generar los posts
2. Abre el dashboard en el navegador
3. Revisa cada post, ajusta el texto si quieres (edita el `.md`)
4. Marca los aprobados como **Reviewed**
5. El día de publicación: copia el post, pégalo en LinkedIn manualmente
6. Márcalo como **Published** en el dashboard

---

## Categorías cubiertas

| Categoría | Posts |
|---|---|
| Web design tips | 3 |
| SEO local tips | 3 |
| Google Ads tips | 3 |
| Meta Ads tips | 2 |
| Common website mistakes | 3 |
| Lead generation | 3 |
| AI for small businesses | 2 |
| Lessons from building Kuraianto | 3 |
| Outreach / sales lessons | 2 |
| Case-style posts | 1 |
| Advice for restaurants | 2 |
| Advice for clinics | 2 |
| Advice for local businesses | 2 |
| Soft sales post | 1 |

---

## Formatos de posts

- **short-educational** — idea concisa, directa, sin rodeos
- **story** — algo que pasó, qué aprendiste
- **mistake** — lista de errores comunes
- **checklist** — lista accionable con ✓
- **opinion** — postura clara sobre un tema
- **soft-sales** — presentación de Kuraianto sin vender a presión

---

## CTAs en rotación

1. "Si tienes un negocio y quieres una demo gratis de tu web, escríbeme."
2. "Si quieres que revise tu web, mándamela y te digo qué mejoraría."
3. "Si tienes un negocio local, puedo prepararte una primera idea sin compromiso."
4. "Puedes ver más en kuraianto.com"

---

## Añadir más posts

Edita el array `POSTS` en `scripts/generate-linkedin-posts.js` y vuelve a ejecutar el script.

Los archivos existentes **no se borran** — el script sobreescribe CSV y `.md` files con las mismas fechas.
Si quieres añadir posts sin tocar los ya publicados, ajusta la constante `START` para que empiece desde el día siguiente al último post generado.

---

## Fase futura: publicación (cuando estés listo)

Opciones seguras sin riesgo para tu cuenta:

### Herramientas manuales con programación
- **Buffer** (buffer.com) — colas de publicación, gratuito para 1 canal
- **Metricool** (metricool.com) — gestión multicanal, tiene plan gratuito limitado
- **Taplio** (taplio.com) — específico para LinkedIn, con análisis de rendimiento

### Sin herramientas de terceros
- **LinkedIn Creator Mode** — actívalo en tu perfil para más alcance orgánico
- Publica manualmente: copia del dashboard, pega en LinkedIn, listo

### Lo que NO usar
- Bots de automatización (Phantombuster en modo agresivo, Dux-Soup con acciones masivas)
- Herramientas que simulan clics humanos o scraping de LinkedIn
- Auto-posting sin revisión humana

---

## Reglas de calidad aplicadas

Los posts evitan:
- Frases genéricas de IA ("en el mundo digital actual", "potenciar tu presencia digital")
- Promesas de resultados ("consigue X clientes garantizados")
- Párrafos largos sin saltos de línea
- Emojis en exceso (máximo 1 por post, preferiblemente ninguno)
- Estadísticas inventadas o sin fuente

---

## Idioma

Los 30 posts generados están en español.
Para añadir versiones en inglés: duplica el array `POSTS` en el script,
traduce los textos y genera un segundo CSV con sufijo `-en`.
