# 05. Análisis Técnico: Nike By You (`nike.com`)

**Rol en nuestra arquitectura:** La cima de la **velocidad percibida (< 50 ms)** mediante **arquitectura "Falso 3D" (2.5D de capas WebP transparentes apiladas en Canvas)** para vistas de catálogo, móviles de gama media y accesorios complejos (gorras, mochilas, termos, espinilleras).

---

## 1. Por Qué el "Falso 3D" (2.5D Multicapa) de Nike Es Tan Brillante

Un modelo 3D en tiempo real es insuperable para uniformes con texto libre envolvente (como un jersey de ciclismo o fútbol). Sin embargo, en productos con materiales complejos (bordado 3D en una gorra *Snapback*, reflejos metálicos anisotrópicos de un termo de acero, fibra de carbono de espinilleras) o en el **Hero principal de la tienda**, cargar una escena WebGL + HDRI tarda varios segundos.

Nike demuestra que con **4 a 6 ángulos pre-renderizados en calidad fotográfica Cycles/Octane**, divididos en máscaras WebP ultraligeras, el usuario siente que está rotando un objeto real en 3D con **cero tiempo de carga y calidad de estudio fotográfico imposible en WebGL móvil**.

---

## 2. Anatomía de la Pila de Capas en el Canvas (`Layer Stack`)

Para cada ángulo de cámara $A_k \in \{0^\circ, 45^\circ, 90^\circ, 180^\circ\}$, se preparan pases transparentes WebP perfectamente registrados a la misma dimensión (ej. `1200×1200 px`, pesando apenas `25 KB - 50 KB` cada uno):

| Orden Z | Capa (`WebP Lossless/Alpha`) | Operación en HTML5 Canvas (`globalCompositeOperation`) | Función Visual |
| :---: | :--- | :--- | :--- |
| **0** | `shadow_floor.webp` | `source-over` | Sombra suave de contacto en el suelo. |
| **1** | `mask_panel_primary.webp` | Tintado offscreen (`source-in` con hex) -> `source-over` | Color exacto elegido para el cuerpo/corona. |
| **2** | `mask_panel_secondary.webp` | Tintado offscreen (`source-in` con hex) -> `source-over` | Color exacto de visera / mangas / tapa. |
| **3** | `mask_panel_accents.webp` | Tintado offscreen (`source-in` con hex) -> `source-over` | Ojales, costuras de contraste, botones. |
| **4** | `Dynamic Decal Projection` | Matriz afín / perspectiva `ctx.setTransform(...)` | Escudo o grabado láser del usuario adaptado al ángulo $A_k$. |
| **5** | `pass_ao_creases.webp` | **`multiply`** | Sombras reales de pliegues, textura de tela/metal y profundidad interior. |
| **6** | `pass_specular_threads.webp` | **`screen`** (opacidad `0.35 - 0.70`) | Brillo de hilos de bordado, reflejo metálico o barniz de carbono. |

---

## 3. Algoritmo de Renderizado Instantáneo en `< 2 ms`

1. **Precarga Progresiva Inteligente**:
   * Al entrar a la página sólo se descargan los ~180 KB del **Ángulo 0° (Frente)**. La prenda aparece de inmediato.
   * En `requestIdleCallback`, el navegador precarga silenciosamente los ángulos `45°`, `90°` y `180°` decodificándolos como objetos nativos `ImageBitmap` en GPU.
2. **Cambio de Color Sin Peticiones de Red**:
   * A diferencia de sistemas antiguos que pedían al servidor `shoe_red_sole_black.png`, nuestro compositor reutiliza el `ImageBitmap` blanco de cada máscara en un buffer temporal y aplica el color hexadecimal localmente a **60 fotogramas por segundo**, permitiendo incluso un selector de rueda cromática continua.

---

## 4. Qué Inspeccionar con REA en Nike By You

1. **Secuencia de peticiones en la pestaña Network (`Img`) al cambiar colores y girar el producto**:
   * Observar los parámetros de URL de su CDN de imágenes, el peso medio en KB de cada capa WebP/AVIF y el orden exacto de apilamiento en su `<canvas>` principal.
2. **Transición UX Móvil**:
   * Fijarse en cómo diseñan la barra inferior compacta (*swatches* horizontales deslizables que ocupan menos del `28%` de la altura de la pantalla móvil para que el producto siempre sea el protagonista).
