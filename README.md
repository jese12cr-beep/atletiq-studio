# ATLETIQ Custom Engine — Repositorio de Arquitectura & Prototipo

Repositorio oficial de diseño, ingeniería y código base para nuestra plataforma de personalización deportiva en tiempo real (**independiente y lista para integrarse en Shopify OS 2.0**).

---

## Mapa del Repositorio

### 1. Plano Maestro y Benchmark de los 5 Motores Líderes (`./blueprint/`)
Análisis de ingeniería de las 5 plataformas referentes y especificación exacta de cómo quedará nuestra versión v3.0:
* [`blueprint/00-ARQUITECTURA-OBJETIVO.md`](./blueprint/00-ARQUITECTURA-OBJETIVO.md) — **Documento Maestro**: Diagnóstico v1 vs. v3, UX Fullscreen en 5 pasos, motor gráfico dual (3D WebGL + 2.5D Faux-3D) y arquitectura de carpetas `src/engine/`.
* [`blueprint/01-owayo-3d-y-roster-json.md`](./blueprint/01-owayo-3d-y-roster-json.md) — **Owayo**: Modelo relacional `Single-Design-ID` para gestionar 20+ tallas, cortes, nombres y dorsales sin duplicar imágenes + auto-condensación tipográfica.
* [`blueprint/02-customink-bounding-boxes-dpi.md`](./blueprint/02-customink-bounding-boxes-dpi.md) — **CustomInk**: Geometría OBB/AABB de zonas seguras de impresión, imanes de centrado, cálculo de DPI en vivo y subida asíncrona sin Base64.
* [`blueprint/03-kitbuilder-svg-y-textura-mesh.md`](./blueprint/03-kitbuilder-svg-y-textura-mesh.md) — **Kit Builder**: Separación del patrón vectorial (SVG paramétrico) y la micro-textura física del tejido (*Dry-Fit* repetible + AO de costuras y pliegues).
* [`blueprint/04-zakeke-shopify-print-payload.md`](./blueprint/04-zakeke-shopify-print-payload.md) — **Zakeke**: Integración limpia con `/cart/add.js` (`_atletiq_design_id`) y generación de moldes vectoriales *Print-Ready* (300 DPI con sangrado) vía Webhook.
* [`blueprint/05-nike-faux3d-capas-webp.md`](./blueprint/05-nike-faux3d-capas-webp.md) — **Nike By You**: Apilamiento instantáneo (`< 50 ms`) de máscaras WebP transparentes + modos `multiply` / `screen` para vistas de catálogo y accesorios.

### 2. Contratos de Datos JSON (`./schemas/`)
* [`schemas/design-template.schema.json`](./schemas/design-template.schema.json) — Estado inmutable del diseño maestro.
* [`schemas/team-roster-payload.schema.json`](./schemas/team-roster-payload.schema.json) — Payload masivo de jugadores y tallas.
* [`schemas/shopify-production-payload.schema.json`](./schemas/shopify-production-payload.schema.json) — Contrato entre carrito Shopify y taller textil.

### 3. Espacio de Trabajo para Capturas con REA (`./rea-captures/` & `./tools/`)
* [`rea-captures/README-CAPTURAS-REA.md`](./rea-captures/README-CAPTURAS-REA.md) — Protocolo exacto de qué grabar en cada uno de los 5 sitios.
* [`tools/rea-har-analyzer.mjs`](./tools/rea-har-analyzer.mjs) — Script en Node.js que procesa tus archivos `.har`, elimina cookies privadas y extrae automáticamente los árboles JSON y el inventario de texturas/modelos.

---

## Comandos Rápidos

```bash
# Levantar prototipo interactivo actual
npm run dev

# Analizar capturas .har depositadas en ./rea-captures/
node tools/rea-har-analyzer.mjs ./rea-captures
```
