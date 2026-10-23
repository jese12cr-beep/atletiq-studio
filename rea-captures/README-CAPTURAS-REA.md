# Guía de Capturas con REA (Protocolo Paso a Paso)

Coloca en las subcarpetas de este directorio los archivos `.har`, `.json` o capturas de red obtenidas con **REA** en cada una de las 5 plataformas de referencia.

Luego ejecuta desde la raíz del proyecto:
```bash
node tools/rea-har-analyzer.mjs ./rea-captures
```
*(El analizador limpiará automáticamente cualquier cookie/token de sesión y extraerá los esquemas JSON, dimensiones de texturas, fórmulas de límites y payloads de carrito en un reporte técnico limpio).*

---

## Checklist Exacto por Plataforma

### 1. `./owayo/` — Owayo (`owayo.es` / `owayo.com`)
* **Flujo a grabar:** Abrir Configurador 3D → Elegir camiseta de fútbol o ciclismo → Añadir texto de equipo y dorsal → Pasar a **Lista de Tallas / Pedido** → Rellenar 5–10 jugadores con diferentes tallas, nombres y números → Pulsar **Guardar Diseño**.
* **Archivo esperado:** `rea-captures/owayo/save-roster.har`
* **Objetivo:** Extraer la relación `1 Design ID -> N Filas de Roster` y el layout de su mapa UV.

### 2. `./customink/` — CustomInk (`customink.com` -> Design Lab)
* **Flujo a grabar:** Entrar al Design Lab → Subir un logo PNG → Arrastrarlo hasta tocar y cruzar el borde del área imprimible → Escalarlo en exceso para disparar el aviso de resolución → Pulsar guardar/cotizar.
* **Archivo esperado:** `rea-captures/customink/bounding-box-upload.har`
* **Objetivo:** Extraer el JSON de definición de `printableAreas` (cajas seguras), respuesta del procesador de imágenes (`trim`, `dpi`, `dimensions`) y payload de guardado.

### 3. `./kitbuilder/` — Kit Builder (`kitbuilder.co.uk` -> Demos)
* **Flujo a grabar:** Abrir Demo de Fútbol o Rugby con las herramientas de red limpias → Esperar carga del modelo 3D → Cambiar el diseño base (patrón) y cambiar 3 colores.
* **Archivo esperado:** `rea-captures/kitbuilder/svg-mesh-layers.har`
* **Objetivo:** Extraer los archivos `.svg` de patrones multicapa y medir las resoluciones/formatos de sus mapas estáticos de tejido (`normal`, `ao`, `mesh`, `stitches`).

### 4. `./zakeke/` — Zakeke (`zakeke.com/demo` en tienda Shopify)
* **Flujo a grabar:** Abrir producto demo en Shopify → Personalizar texto y logo → Hacer clic en **Add to Cart** y esperar a ver el carrito de Shopify actualizado.
* **Archivo esperado:** `rea-captures/zakeke/add-to-cart-shopify.har`
* **Objetivo:** Aislar la petición previa a la API de diseño y el `POST /cart/add.js` exacto con sus `properties` ocultas y referencias *Print-Ready*.

### 5. `./nike/` — Nike By You (`nike.com`)
* **Flujo a grabar:** Abrir un producto Nike By You → Alternar entre 4 colores distintos de paneles → Cambiar entre 3 ángulos de cámara distintos.
* **Archivo esperado:** `rea-captures/nike/layer-stack-angles.har`
* **Objetivo:** Analizar el grafo de capas WebP/AVIF por ángulo, tamaños en KB y parámetros de composición en el `<canvas>`.
