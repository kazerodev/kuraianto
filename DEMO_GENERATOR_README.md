# Demo Generator – Kuraianto

Genera páginas de demostración para clientes potenciales en segundos.

## Uso rápido

```bash
node scripts/demo-generator.js
```

El script te preguntará:
1. Nombre del negocio
2. Sector (1-5)
3. Ciudad
4. Teléfono / WhatsApp
5. Dirección (opcional)
6. Servicio principal u oferta (opcional)

La demo se guarda en `demos/<nombre-negocio>/index.html`.

## Usar un lead del sheet

```bash
node scripts/demo-generator.js --row 15
```

Carga automáticamente el nombre, teléfono y dirección de la fila 15.
Requiere que `.env` tenga configurado `SPREADSHEET_ID` y `GOOGLE_CREDENTIALS_PATH`.

## Sectores disponibles

| # | Clave | Tipo |
|---|-------|------|
| 1 | restaurante | Restaurante / Bar / Café |
| 2 | clinica | Clínica dental |
| 3 | belleza | Peluquería / Salón de belleza |
| 4 | taller | Taller mecánico |
| 5 | generico | Negocio local (genérico) |

## Abrir la demo

**Windows:**
```
start demos\<nombre-negocio>\index.html
```

O arrastra el archivo `index.html` al navegador.

## Estructura del demo

Cada demo incluye:
- Barra superior "Demo generada por Kuraianto"
- Navbar fijo con link a WhatsApp
- Hero con headline, CTA y oferta especial
- Sección de servicios (adaptada al sector)
- Sección "Por qué elegirnos"
- Sección sobre el negocio
- Sección de contacto con mapa placeholder
- Footer
- Botón flotante de WhatsApp (esquina inferior derecha)

## Colores por sector

| Sector | Color principal |
|--------|----------------|
| Restaurante | Naranja cálido `#e85d04` |
| Clínica dental | Azul médico `#0077b6` |
| Belleza | Rosa `#be185d` |
| Taller | Azul industrial `#1d4ed8` |
| Genérico | Verde teal `#0f766e` |

## Notas

- Las demos son archivos HTML completamente standalone (sin dependencias externas).
- Los archivos en `demos/` están en `.gitignore`.
- El banner superior siempre incluye el link a kuraianto.com y WhatsApp.
- Los mensajes de WhatsApp están prellenados con el nombre del negocio y una frase natural.
