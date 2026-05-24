# Kuraianto – Outreach System

Scripts locales para gestionar leads, generar mensajes de WhatsApp personalizados, importar leads nuevos y preparar emails en frío.

**Ningún script envía mensajes automáticamente.** Todo es revisión manual antes de actuar.

---

## Rutina diaria de enriquecimiento de emails

Sigue estos pasos cada día para añadir emails de negocio de forma segura.

### Checklist

- [ ] **1. Abre el dashboard en vivo**
  ```bash
  node scripts/batch-mode.js
  ```
  → http://localhost:3333

- [ ] **2. Filtra por los mejores leads**
  Busca leads con estado **Interesado** o **Volver a llamar**.
  Estos ya han tenido contacto previo — son prioridad.

- [ ] **3. Selecciona 10–15 leads**
  Elige los que tienen web en la columna L. Sin web, es más difícil encontrar email de negocio.

- [ ] **4. Busca el email de negocio en su web**
  Visita la web del negocio y busca en: página de contacto, pie de página, sección "Sobre nosotros".

  Prefiere estas direcciones (en este orden):
  ```
  info@        contacto@     reservas@
  hola@        admin@        ventas@
  tienda@      web@
  ```

- [ ] **5. Añade el email en la columna K del Google Sheet**
  Escribe el email directamente en la fila del lead correspondiente.

- [ ] **6. Añade la fuente en la columna O**
  Anota de dónde sacaste el email:
  ```
  web manual      → lo encontraste en su web
  Apollo          → viene de un CSV de Apollo
  directorio      → Páginas Amarillas, Infobel, etc.
  otro            → cualquier otra fuente
  ```

- [ ] **7. Genera el CSV de emails en frío**
  ```bash
  node scripts/generate-cold-emails.js
  ```

- [ ] **8. Abre el dashboard de email**
  ```
  data/email-dashboard.html
  ```
  (doble clic o ábrelo desde el explorador de archivos)

- [ ] **9. Revisa cada email antes de enviarlo**
  - Expande el cuerpo del email haciendo clic en la tarjeta
  - Usa **"Abrir email"** para enviarlo desde tu cliente de correo
  - Marca como **Enviado** o **Descartado** en el dashboard

- [ ] **10. Actualiza el estado en el sheet si hay respuesta**
  ```bash
  node scripts/update-lead.js
  ```

---

### Recordatorios

- **Prioriza emails de negocio** (`info@`, `contacto@`, etc.) sobre personales (gmail, hotmail)
- **No envíes a emails sospechosos** (`outlook.cm`, `gmial.com`, etc.) sin verificarlos primero
- **No envíes a `noreply@`** ni `no-reply@` — nadie los lee
- **No contactes** a leads marcados como **No interesado** o **Descartado**
- **No se envía nada automáticamente** — todo pasa por tu revisión manual

---

## Scripts disponibles

| Script | Uso |
|--------|-----|
| `node scripts/batch-mode.js` | Dashboard en vivo (http://localhost:3333) — manda WA manualmente |
| `node scripts/find-new-leads.js` | Importa leads desde CSV, detecta duplicados, añade al sheet |
| `node scripts/generate-cold-emails.js` | Genera CSV de emails en frío para revisión manual |
| `node scripts/update-lead.js [fila]` | Actualiza estado, intento y notas de un lead |
| `node scripts/generate-whatsapp-links.js` | Genera outreach-ready.csv + dashboard estático |
| `node scripts/read-leads.js` | Módulo compartido (no se ejecuta directamente) |

---

## Estructura del Google Sheet

Dos pestañas: **NEGOCIOS ESPAÑA** · **NEGOCIOS BÉLGICA**

| Col | Campo | Descripción |
|-----|-------|-------------|
| A | Restaurante | Nombre del negocio |
| B | Teléfono | Número de contacto |
| C | Dirección | Dirección del negocio |
| D | Estado | Interesado / Volver a llamar / Sin respuesta / No contesta / Sin contactar / Cliente / Descartado |
| E | Contestado | Libre |
| F | Intento | Número de intentos de contacto |
| G | Agente | Libre |
| H | Fecha llamada | DD/MM/YYYY |
| I | Hora | HH:MM |
| J | Notas de llamada | Notas libres |
| K | Email | Email de negocio (para cold email) |
| L | Web | URL de su web actual (si tiene) |
| M | Sector | Restaurante / Clínica / Taller / Belleza / etc. |
| N | Ciudad | Ciudad del negocio |
| O | Fuente | De dónde viene el lead (Apollo, manual, Google Maps, etc.) |
| P | Fecha añadido | DD/MM/YYYY — cuándo entró al sistema |

---

## Dashboard en vivo — batch-mode.js

```bash
node scripts/batch-mode.js
```

Abre http://localhost:3333 en el navegador.

- Muestra 3 leads por lote, priorizados: Interesado → Volver a llamar → Sin contactar
- Excluye automáticamente: Descartado, No interesado, contactados hoy, duplicados
- Muestra: teléfono, email (si existe), web (si existe), sector, ciudad, fuente
- Badge de canal recomendado: **Solo WhatsApp** / **Solo Email** / **WA + Email**
- Botón WhatsApp abre `wa.me` con mensaje prellenado — tú decides si enviarlo
- "Marcar lote como contactado" actualiza Intento + Fecha en el sheet
- "Ver no interesados" permite descartar leads de notas con indicios negativos

---

## Cómo añadir emails a leads existentes

La columna K del Google Sheet es donde se guardan los emails. Existen varias formas de rellenarla:

### Opción A — Manual desde la web del negocio

1. Abre el Google Sheet y ordena por columna L (Web) para ver qué negocios tienen web
2. Visita cada web y busca la dirección de email de contacto
3. Escribe el email directamente en la columna K del mismo lead
4. Prioriza emails de dominio propio (ej: `info@restauranteelmar.es`) sobre personales

### Opción B — Importar desde CSV de Apollo u otra fuente

Si tienes un CSV exportado de Apollo, Google Maps o cualquier directorio:

1. Asegúrate de que el CSV tiene una columna de email
2. Guárdalo como `data/new-leads.csv` siguiendo el formato del ejemplo:

```csv
Business name,Phone,Email,Address,City,Country,Website,Sector,Source,Notes
Restaurante El Mar,600123456,info@elmar.es,Calle del Mar 12,Marbella,España,https://elmar.es,Restaurante,Apollo CSV,
```

3. Ejecuta `node scripts/find-new-leads.js`
4. El script detecta duplicados y crea `data/new-leads-review.csv` para revisión
5. Confirma con `s` si quieres añadirlos al sheet

El email que venga en el CSV se guardará automáticamente en la columna K.

### Opción C — Añadir emails directamente en el sheet

Abre el Google Sheet y edita la columna K manualmente para cualquier lead existente. Funciona igual que una hoja de cálculo normal.

### Opción D — APIs oficiales (bajo demanda)

Si en el futuro necesitas enriquecimiento masivo, puedes usar:
- **Apollo.io API** (plan de pago) — devuelve email de negocio para empresas
- **Hunter.io API** — busca emails por dominio corporativo
- **Clearbit API** — enriquecimiento de contactos

Estas opciones requieren cuenta y API key. No están implementadas ahora. No uses scrapers ni herramientas no autorizadas.

---

## Cómo importar nuevos leads con emails — find-new-leads.js

### 1. Preparar el CSV

Crea el archivo `data/new-leads.csv` con tus leads. Consulta `data/new-leads.csv.example` para el formato.

Columnas esperadas (los nombres de cabecera son flexibles):

```
Business name, Phone, Email, Address, City, Country, Website, Sector, Source, Notes
```

### 2. Ejecutar

```bash
node scripts/find-new-leads.js
```

El script:
1. Lee `data/new-leads.csv`
2. Carga todos los leads del sheet para detectar duplicados
3. Clasifica cada lead: **NUEVO** / **DUPLICADO** / **INVÁLIDO**
4. Genera `data/new-leads-review.csv` con el informe completo
5. Muestra resumen y **pide confirmación antes de escribir nada**
6. Solo añade leads NUEVOS al sheet si confirmas con `s`

### 3. Revisar el resultado

Abre `data/new-leads-review.csv` para ver qué se importó, qué se saltó y por qué.

### Duplicados detectados por:
- Teléfono (normalizado)
- Email (normalizado a minúsculas)
- Nombre del negocio (normalizado, sin signos)

### Pestaña destino

Por defecto usa la primera pestaña definida en `SHEET_TAB_NAME`. Para cambiarla:

```bash
# En .env:
IMPORT_TARGET_TAB=NEGOCIOS BÉLGICA
```

---

## Emails en frío — generate-cold-emails.js

```bash
node scripts/generate-cold-emails.js
```

Genera `data/cold-email-ready.csv` y `data/email-dashboard.html`. **No envía ningún email.**

### Clasificación de emails

El script clasifica cada email en una de estas categorías:

| Categoría | Descripción | Prioridad |
|-----------|-------------|-----------|
| **Negocio** | Dominio propio del negocio (`info@restaurante.es`) | Alta — enviar primero |
| **Personal** | Gmail, Hotmail, Yahoo, Outlook, iCloud, etc. | Media — revisar antes |
| **Sospechoso** | Dominio con posible error tipográfico | Baja — verificar email antes de enviar |
| **Inválido** | Formato incorrecto, dirección automática | Excluido — no aparece en el output |

### Ejemplos de emails sospechosos detectados

```
safouanabarkan@outlook.cm   → TLD .cm, probablemente .com
nombre@gmial.com            → typo de gmail.com
contacto@hotmial.com        → typo de hotmail.com
info@yaho.com               → typo de yahoo.com
info@outlook.con            → TLD .con, probablemente .com
info@gmail.con              → TLD .con, probablemente .com
```

**El script NO corrige estos emails automáticamente.** Solo los señala para que tú los verifiques manualmente.

### Solo procesa leads que:
- Tienen email en columna K
- Estado no es Descartado / No interesado / Cliente
- Notas no contienen "no molestar", "no contactar", etc.

### El CSV incluye estas columnas:
- Nombre del negocio
- Email
- **Categoría email** (Negocio / Personal / SOSPECHOSO)
- Asunto sugerido
- Cuerpo del email
- Sector, ciudad, web, fuente
- Motivo de personalización
- Template usado
- Acción recomendada
- Estado (Pendiente — para actualizar manualmente)

---

## Cómo revisar emails sospechosos

Cuando el script detecta emails sospechosos, los muestra en la consola y los marca en el dashboard:

```
⚠ Emails sospechosos — verificar antes de enviar:
   Nombre Negocio <contacto@outlook.cm>
   → TLD sospechoso (¿quiso escribir .com?): outlook.cm
```

### Pasos para corregirlos:

1. Abre `data/email-dashboard.html` en el navegador
2. Usa el filtro **"Solo sospechosos"** para verlos todos
3. Para cada uno: verifica manualmente el email en la web del negocio o en Google
4. Si encuentras el email correcto, actualízalo en la columna K del Google Sheet
5. Vuelve a ejecutar `node scripts/generate-cold-emails.js` para regenerar el CSV
6. Si el email era correcto tal como está, simplemente envíalo — el dashboard lo permite igualmente

---

## Cómo usar email-dashboard.html

```bash
node scripts/generate-cold-emails.js
# Luego abre manualmente:
# data/email-dashboard.html
```

### Funciones del dashboard:

- **Stats**: total, pendientes, enviados, descartados — y desglose por tipo de email (negocio / personal / sospechoso)
- **Filtros**: por estado, tipo de email, plantilla, o búsqueda de texto
- **Tarjetas**: nombre, email, badge de categoría, asunto, cuerpo del email (expandible al hacer clic)
- **Emails sospechosos**: borde rojo + aviso visible con la razón del flag
- **Emails personales**: borde amarillo + nota de revisión
- **Copiar asunto** / **Copiar mensaje**: copian al portapapeles con un clic
- **Abrir email**: abre tu cliente de correo con asunto y cuerpo prellenados (usa `mailto:`)
- **Estados**: marca cada lead como Pendiente / Enviado / Descartado — se guarda en localStorage

### Flujo recomendado:

1. Filtra por **"Solo sospechosos"** primero y verifica o descarta cada uno
2. Filtra por **"Solo negocio"** y envía esos primero (mejor calidad)
3. Filtra por **"Solo personal"** y decide si los incluyes
4. Marca cada email como Enviado o Descartado a medida que avanzas

---

## Actualizar un lead — update-lead.js

```bash
# Modo interactivo
node scripts/update-lead.js

# Ir directamente a una fila
node scripts/update-lead.js 42
```

Actualiza en el sheet: Estado, Intento, Fecha, Hora, Notas.
Siempre pide confirmación antes de escribir.

---

## Configuración (.env)

```
SPREADSHEET_ID=1lMwQ6pGOxyZWowWkGlD10FH5jMi_fQ28VGj-1IUrnqg
GOOGLE_CREDENTIALS_PATH=./credentials.json
SHEET_TAB_NAME=NEGOCIOS ESPAÑA,NEGOCIOS BÉLGICA
IMPORT_TARGET_TAB=NEGOCIOS ESPAÑA
```

---

## Archivos locales (no se publican)

| Archivo | Descripción |
|---------|-------------|
| `credentials.json` | Credenciales Google (en .gitignore) |
| `.env` | Variables de entorno (en .gitignore) |
| `data/new-leads.csv` | Leads a importar (en .gitignore) |
| `data/new-leads-review.csv` | Informe de última importación (en .gitignore) |
| `data/cold-email-ready.csv` | Emails generados para revisión manual (en .gitignore) |
| `data/email-dashboard.html` | Dashboard de email generado (en .gitignore) |
| `scripts/outreach-ready.csv` | Output de generate-whatsapp-links.js |
| `scripts/dashboard.html` | Dashboard estático generado |
| `scripts/.batch-state.json` | Estado de sesión del dashboard en vivo |

---

## Compliance y seguridad

- Ningún script envía mensajes ni emails automáticamente
- Los leads con "no molestar", "no contactar" o "no interesa" en notas se excluyen
- Los leads Descartado / No interesado / Cliente se excluyen del dashboard y del generador de emails
- Los emails inválidos (formato incorrecto, direcciones automáticas tipo noreply) se excluyen del output
- Los emails personales (gmail, hotmail, etc.) se incluyen pero marcados como revisión manual
- Los emails sospechosos (typos de dominio) se incluyen pero con aviso destacado en rojo
- Todos los datos permanecen en local y en tu Google Sheet privado
- Los archivos `data/` generados están en .gitignore y nunca se publican
- Nunca se envía, sube ni despliega nada automáticamente
