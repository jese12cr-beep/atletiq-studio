# 02. Análisis Técnico: CustomInk (`customink.com` — Design Lab)

**Rol en nuestra arquitectura:** El referente definitivo en **usabilidad 2D**, **matemática de áreas seguras de impresión (*Bounding Boxes*)**, **guías magnéticas (*Smart Snapping*)** y **gestión eficiente de imágenes subidas por el usuario**.

---

## 1. Arquitectura de Coordenadas y "Printable Safe Zones"

CustomInk nunca deja que el usuario diseñe en "píxeles arbitrarios de pantalla", porque una pantalla móvil mide `360px` y un monitor 4K mide `3840px`. Todo el motor interno trabaja en **unidades físicas reales (pulgadas o milímetros)** proyectadas sobre la prenda base (talla `L` de referencia):

* **Garment Canvas (`ViewBox` Maestro)**: p.ej. `500 × 600 mm`.
* **Safe Print Box (Caja de Impresión Segura)**: Sub-rectángulo o polígono donde las agujas de bordado o la plancha/costura garantizan perfección visual.
  * *Frente Completo*: `x: 100mm, y: 110mm, width: 300mm, height: 380mm`
  * *Escudo Pecho Izquierdo*: `x: 295mm, y: 135mm, width: 90mm, height: 90mm`
  * *Manga Izquierda*: `x: 40mm, y: 150mm, width: 85mm, height: 85mm`

---

## 2. Matemática Exacta de Bounding Boxes (OBB vs. AABB)

Cuando el usuario sube un logo de dimensiones $(w, h)$, lo escala con factor $s$ y lo rota un ángulo $\theta$ alrededor de su centro $(c_x, c_y)$, su caja orientada (**OBB**) genera una envolvente alineada a los ejes (**AABB**) cuyos semi-ejes son:

$$E_x = \frac{w \cdot s \cdot |\cos\theta| + h \cdot s \cdot |\sin\theta|}{2}$$

$$E_y = \frac{w \cdot s \cdot |\sin\theta| + h \cdot s \cdot |\cos\theta|}{2}$$

### Comportamiento Dual al Arrastrar Fuera del Área (El Secreto UX de CustomInk)
En lugar de bloquear bruscamente el ratón (que se siente "tosco"), CustomInk combina **dos capas visuales**:
1. **Durante el arrastre (`pointermove`)**:
   * Se enciende el borde punteado de la `SafePrintZone`.
   * La parte del logo dentro de la caja se muestra al `100%` de opacidad mediante un `<clipPath id="safe-zone">`, mientras que una copia fantasma fuera del `<clipPath>` se tiñe en rojo/transparente al `30%` de opacidad con un badge flotante: *"Fuera del área de impresión"*.
2. **Al soltar (`pointerup`) o activar modo estricto**:
   * Si más del `80%` del objeto salió, o si la prenda es de serigrafía/bordado estricto, aplica un *elastic snap-back* suave hacia adentro:
     $$c_x' = \min\big(\max(c_x,\; B_{\min X} + E_x),\; B_{\max X} - E_x\big)$$
     $$c_y' = \min\big(\max(c_y,\; B_{\min Y} + E_y),\; B_{\max Y} - E_y\big)$$
   * **Nota clave para Sublimación Full-Print**: En sublimación total (donde se imprime el rollo de tela antes de coser), permitiremos **2 modos de Bounding Box**:
     * `Modo Full-Bleed (Patrones/Fondos)`: Permite cruzar hasta el sangrado de costura (`+15 mm` fuera del corte).
     * `Modo Safe-Logo (Escudos/Patrocinadores)`: Aplica la restricción de CustomInk para que ningún escudo quede cortado por la costura de la axila o doblado en el dobladillo.

### Imanes Inteligentes (*Smart Guides*)
Cuando $|c_x - X_{\text{centro\_pecho}}| < 4\text{ mm}$, el objeto hace *snap* exacto a $X_{\text{centro\_pecho}}$ y dibuja una línea guía vertical cian/magenta indicando **"Centrado"**.

---

## 3. Pipeline de Peso, Resolución (DPI) y Subida Asíncrona

Uno de los fallos más comunes en configuradores caseros es incrustar un PNG de `12 MB` como `data:image/png;base64,...` dentro del estado de React o mandarlo así al carrito. CustomInk lo resuelve en 4 pasos:

1. **Inspección Instantánea en un Web Worker**:
   * Lee cabecera `widthPx`, `heightPx`, canal alpha y recorta bordes transparentes vacíos (*auto-trim transparent pixels*) para que el Bounding Box abrace exactamente al escudo real y no al aire transparente alrededor.
2. **Semáforo Matemático de DPI**:
   $$\text{DPI} = \frac{\text{widthPx}}{\text{anchoFísicoEnMm} / 25.4}$$
   * Si el usuario estira un logo pequeño de `200px` a todo el pecho (`280mm` = `11 in`), el motor calcula `18 DPI` y lanza alerta inmediata antes de pasar al carrito.
3. **Proxy Ligero en Memoria (`ImageBitmap` / `blob:` URL)**:
   * Crea un *downscale* en cliente a `max 1024px` en formato WebP para moverlo a 60 FPS en el canvas sin gastar RAM.
4. **Subida Asíncrona Desacoplada (*Pre-Signed Upload*)**:
   * Mientras el usuario sigue eligiendo colores, el archivo original intacto se sube en segundo plano a Cloud Storage y recibe un `artworkId` corto (`art_89f2a`). Al llegar al carrito, la subida **ya terminó** (latencia cero al comprar).

---

## 4. Qué Inspeccionar con REA en CustomInk

1. **Endpoint de subida de arte (`POST /artwork` o similar)**:
   * Ver qué metadatos devuelve su API tras subir un PNG (¿devuelve el *bounding box* recortado sin píxeles transparentes, colores dominantes detectados y DPI?).
2. **Estructura JSON de las Zonas Imprimibles por Producto**:
   * Capturar el JSON de configuración inicial de una camiseta para ver cómo definen las coordenadas de pecho, escudo izquierdo, manga y espalda respecto a la imagen base.
