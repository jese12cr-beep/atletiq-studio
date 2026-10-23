# 01. Análisis Técnico: Owayo (`owayo.es` / `owayo.com`)

**Rol en nuestra arquitectura:** Estándar de oro en **configuradores 3D de uniformes de equipo** y **estructura relacional de Roster (`Single-Design-ID`)** sin duplicación de archivos gráficos.

---

## 1. El Problema Técnico que Resuelve Owayo

Cuando un club deportivo pide **25 equipaciones** con nombres distintos (`RODRÍGUEZ`, `FERNÁNDEZ`, `LI`), dorsales distintos (`1` al `25`) y tallas/patronajes mezclados (`Hombre Slim M`, `Mujer L`, `Niño 140`), un configurador mal diseñado:
1. Renderiza y sube 25 imágenes o texturas pesadas al servidor (50 MB+ de subida, bloqueando el navegador móvil).
2. Crea 25 ítems desvinculados donde cambiar el color del cuello a última hora obliga a rehacer las 25 camisetas.

**La solución de Owayo:** Desacoplar el **Documento Maestro de Diseño (`DesignDocument`)** de la **Matriz Paramétrica de Jugadores (`RosterMatrix`)**.

---

## 2. Arquitectura del JSON Maestro vs. Roster

### A. El Documento Maestro (`design_id` único)
Guarda únicamente la geometría base, zonas de color, escudos fijos y las **reglas de los *Text Slots* (campos variables)**:

```json
{
  "designId": "OWY-2026-884192",
  "sport": "football",
  "baseModelId": "f5_pro_vneck",
  "colorZones": {
    "zone_1_body": "C_ROYAL_BLUE_04",
    "zone_2_sleeves": "C_CARBON_BLACK_01",
    "zone_3_collar": "C_PURE_WHITE_00",
    "zone_4_accents": "C_GOLD_12"
  },
  "staticDecals": [
    {
      "id": "decal_crest_01",
      "assetId": "usr_img_99120",
      "panel": "front_torso",
      "uvPosition": { "u": 0.642, "v": 0.285 },
      "sizeMm": { "width": 75, "height": 75 },
      "rotationDeg": 0
    }
  ],
  "variableSlots": {
    "playerNameBack": {
      "enabled": true,
      "panel": "back_torso",
      "uvAnchor": { "u": 0.50, "v": 0.22 },
      "maxWidthMm": 280,
      "capHeightMm": 55,
      "autoCondense": true,
      "fontId": "athletic_block_pro",
      "fillColor": "#FFFFFF",
      "outlineColor": "#0F172A",
      "outlineWidthMm": 2.5,
      "previewSample": "RODRÍGUEZ"
    },
    "playerNumberBack": {
      "enabled": true,
      "panel": "back_torso",
      "uvAnchor": { "u": 0.50, "v": 0.48 },
      "heightMm": 250,
      "fontId": "athletic_block_pro",
      "fillColor": "#FFFFFF",
      "outlineColor": "#0F172A",
      "outlineWidthMm": 4.0,
      "previewSample": "10"
    }
  },
  "thumbnails": {
    "frontWebp": "https://cdn.ejemplo.com/previews/OWY-2026-884192-front.webp",
    "backWebp": "https://cdn.ejemplo.com/previews/OWY-2026-884192-back.webp"
  }
}
```

### B. El Payload de Tallas y Jugadores (`RosterOrderPayload`)
Al avanzar al paso final de tallas y guardar/añadir al carrito, **no se envía ninguna imagen nueva**. Sólo se envía la referencia al `designId` y el array compacto de variables:

```json
{
  "designId": "OWY-2026-884192",
  "pricingTier": "TIER_12_TO_24",
  "totalQuantity": 20,
  "items": [
    { "row": 1, "cut": "MEN_SLIM", "size": "L",  "qty": 1, "vars": { "playerNameBack": "RODRÍGUEZ", "playerNumberBack": "10" } },
    { "row": 2, "cut": "MEN_SLIM", "size": "M",  "qty": 1, "vars": { "playerNameBack": "FERNÁNDEZ-GARCÍA", "playerNumberBack": "7" } },
    { "row": 3, "cut": "WOMEN_FIT","size": "S",  "qty": 1, "vars": { "playerNameBack": "VALERIA", "playerNumberBack": "9" } },
    { "row": 4, "cut": "KIDS",     "size": "152","qty": 2, "vars": { "playerNameBack": "", "playerNumberBack": "12" } }
  ]
}
```

---

## 3. Regla Matemática de Auto-Ajuste Tipográfico (`autoCondense`)

Cuando un jugador tiene un apellido largo (`FERNÁNDEZ-GARCÍA`, 16 caracteres) y otro corto (`LI`, 2 caracteres):
* **No se reduce la altura de la letra** (debe mantenerse en p.ej. `55 mm` reglamentarios), sino que se aplica compresión horizontal (`scaleX`) únicamente si el ancho natural $W_{\text{natural}}$ supera `maxWidthMm` ($W_{\max} = 280\text{ mm}$):
  $$s_x = \min\left(1.0,\; \frac{W_{\max}}{W_{\text{natural}}}\right)$$
* Si el corte es infantil (`KIDS 152`), el motor aplica un factor proporcional de patrón ($k_{\text{talla}} \approx 0.78$) para que el dorsal de `25 cm` no desborde la espalda de un niño.

---

## 4. Qué Inspeccionar con REA en Owayo

1. **Petición XHR/Fetch al pulsar "Guardar Diseño" o pasar a "Lista de Tallas"**:
   * Identificar el nombre exacto de los nodos JSON que separan `texts` fijos (ej. nombre del club en el pecho) de `individualTexts` / `roster` (nombre/número por jugador).
2. **Estructura del UV Atlas del modelo 3D**:
   * Ver en la pestaña *Network -> Img / Fetch* cómo están distribuidas las piezas de la camiseta (delantero, espalda, manga izq, manga der, cuello) dentro del cuadrado UV `0..1`.
3. **Validaciones de la tabla de equipo**:
   * Cómo agrupa el resumen de carrito cuando hay líneas con personalización individual y líneas "sin nombre" (para repuestos del club).
