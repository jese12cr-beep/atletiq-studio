# 01. Análisis Técnico & REA Real: Owayo (`owayo.es` — Configurador v6)

**Estado:** ✅ **CAPTURA HAR DECODIFICADA AL 100%** (`222m-Hero` / `Camiseta de baloncesto B6 Hero`, 482 peticiones HTTP inspeccionadas).  
**Rol en nuestra arquitectura:** Estándar de oro en **topología 3D multi-pieza cosida**, **recoloreado GPU instantáneo mediante máscaras indexadas + LUT**, **zonas de bloqueo de costura (`sperrbezirke`)** y **estructura relacional de Roster (`einzelexemplare` + `textObjectUUID`)**.

---

## 1. Hallazgos Reales Extraídos por Ingeniería Inversa (HAR v6)

### A. Topología 3D Anatómica Multi-Pieza (`222m-Hero.mirl` + `parts.json`)
A diferencia de los configuradores básicos que usan un cilindro deformado de baja poligonización, Owayo descarga un contenedor binario comprimido en **GZIP** (`model/mirl`, versión `v1.1`, `884.8 KB` en red → `1.27 MB` descomprimido) con coordenadas cuantizadas a `uint16` (`word / factor` y `uv = word / 65535`).

El modelo `222m-Hero` suma **31,204 vértices y 60,593 triángulos** divididos en **7 sub-mallas (`THREE.Mesh`) independientes**:

| Sub-Malla (`objectname`) | Vértices | Triángulos | Lienzo UV (`groesseX × Y`) | Medida Física (`breiteCM × hoeheCM`) | Material (`Stoffe/v2`) | `isDroppable` |
| :--- | ---: | ---: | :---: | :---: | :--- | :---: |
| **`Front`** | 14,375 | 28,180 | `2048 × 2048` | `63.23 × 85.90 cm` | `K-Tex 2` | `true` |
| **`Back`** | 10,856 | 21,313 | `2048 × 2048` | `44.46 × 79.90 cm` | `K-Tex 2` | `true` |
| **`Krageneinfass`** (Cuello) | 1,819 | 3,392 | `2048 × 128` | `110.0 × 4.80 cm` | `Bandstoff_R-Tex-3_48mm` | `false` |
| **`Aermelbandlinks`** (Sisa Izq.) | 1,746 | 3,264 | `2048 × 128` | `110.0 × 4.80 cm` | `Bandstoff_R-Tex-3_48mm` | `false` |
| **`Aermelbandrechts`** (Sisa Der.) | 1,746 | 3,264 | `2048 × 128` | `110.0 × 4.80 cm` | `Bandstoff_R-Tex-3_48mm` | `false` |
| **`Etikett`** (Talla cuello int.) | 510 | 928 | `512 × 256` | Etiqueta interior tejida | `etikett.json` | `false` |
| **`EtikettFahne`** (Bandera cadera) | 152 | 252 | `256 × 128` | Etiqueta lateral costura | `etikettfahne.json` | `false` |

#### Compensación Matemática de Estiramiento UV (`partStauchungsFaktor`)
Como tanto `Front` (`63.23 × 85.90 cm`) como `Back` (`44.46 × 79.90 cm`) se mapean a texturas cuadradas `2048 × 2048`, un escudo cuadrado dibujado directamente en píxeles UV se vería estirado verticalmente. Owayo lo corrige leyendo `parts.json` y aplicando:
$$\text{partStauchungsFaktor} = \frac{\text{hoehenfaktor}}{\text{groesseY} / \text{groesseX}}$$
* En `Front`: $\text{hoehenfaktor} = 1.35839 \implies$ comprime el alto UV de cada logo un factor $1 / 1.35839$ para que un escudo de $7.5 \times 7.5\text{ cm}$ conserve circularidad exacta en 3D.
* En `Back`: $\text{hoehenfaktor} = 1.79704 \implies$ compensa el patrón más estrecho de la espalda atlética.

---

### B. Plantillas `.fish` (ZIP de Máscaras Indexadas) + Shader Sub-Píxel + Cara Interior Sublimada
Cada diseño (`Legend.fish`, `Triple.fish`, `Buzzer.fish`, etc.) pesa apenas **49–58 KB** porque es un archivo **ZIP estándar (`PK\x03\x04`)** con 5 PNGs (`Legend_Front.png` de `26 KB` a `2048×2048`, `Legend_Back.png` de `23 KB`, y 3 ribetes `2048×128` de `1.1 KB`):

1. **Interpolación Bilineal Manual sobre Índices (`En.blendPixels` en GLSL)**:
   * `ColorTextures[0]` almacena en el canal `.r` el índice de zona de color (`A`, `B`, `C`, `K`, `SLR`, `SLL`, `HF`) con `THREE.NearestFilter` (evitando que el filtrado hardware promedie el índice `0` con el `2` y cree halos del color `1`).
   * El *Fragment Shader* lee los 4 texels vecinos enteros `(x, y)`, `(x, y+1)`, `(x+1, y+1)`, `(x+1, y)`, traduce primero cada índice a su color real consultando una tabla 1D `ColorTextures[1]` (`texture2D(ColorTextures[1], vec2(index, 0.5))`), y **después** interpola bilinealmente los 4 colores resueltos usando la parte fraccionaria `fract(uv * textureSize)`. Resultado: cambio de color en **0.05 ms** sin re-rasterizar Canvas y bordes perfectamente suavizados.
2. **Reverso Interior de Poliéster Sublimado (`innenseiteAufhellen` + `gl_FrontFacing`)**:
   * En sublimación real sobre tejido blanco `K-Tex 2`, la tinta sólo penetra ~40% hacia el reverso interior. Owayo aplica en el *Fragment Shader*:
     ```glsl
     gl_FragColor = vec4(mix(ColorResult.xyz, vec3(1.0, 1.0, 1.0), 0.6 * (1.0 - float(gl_FrontFacing))), ColorResult.a);
     ```
   * Al mirar dentro del cuello o las sisas en 3D, el interior se ve **60% blanco textil** con la etiqueta tejida `Etikett` en la nuca.
3. **Dependencia Automática de Contraste (`ColorCodeAbhaengigkeiten`)**:
   * En `produkt.php`, el código `HF` (marca/detalle secundario) declara `"MasterColorcode": "A", "abhaengigkeitsArt": "Schwarz-Weiß im Kontrast"`, alternando automáticamente entre blanco y negro según la luminancia del color base `A`.

---

### C. Zonas Prohibidas de Costura (`sperrbezirke.json`), Imanes (`getSnapLines.php`) y Proxy CDN
* **`sperrbezirke.json`**: Declara `{"Front": {"VonUntenCm": 5.00}, "Back": {"VonUntenCm": 5.00}, ...}`. Bloquea los **5.0 cm inferiores (50 mm)** del faldón porque ahí pasa el dobladillo de máquina recubridora (`r.sperrBezirke.push({ dim: 'y', from: 0, to: VonUntenCm / partSizeCM.y })`).
* **`getSnapLines.php`**: Devuelve ejes magnéticos verticales normalizados por pieza:
  * `Front`: `x = 0.5`, `y ∈ [0.0348, 0.7524]`
  * `Back`: `x = 0.5`, `y ∈ [0.0329, 0.9382]`
* **`uploadFile.php` (Proxy CDN Progresivo)**: Al subir `El General V (1).png` (`1200×825`), el servidor asigna `id: 65182655` y sirve dos niveles Cloudflare Image Resizing sin incrustar Base64 en el JSON:
  * Miniatura UI: `.../cdn-cgi/image/fit=scale-down,width=256,height=256/..._65182655.png` (`11.7 KB`)
  * Textura 3D: `.../cdn-cgi/image/fit=scale-down,width=1024,height=1024/..._65182655.png` (`114.5 KB`)

---

## 2. Estructura Real del JSON de Diseño (`saveEntwurfAs.php`) y Roster (`einzelexemplare`)

### A. `designObj` Real Capturado en `saveEntwurfAs.php` (`SaveID: 53339105`)
```json
{
  "colors": [
    { "bezeichnung": "A", "colorRGB": 7154225, "nameImWeb": "Red 5", "palette": "CM5 owayo Farbsystem", "hatPattern": true },
    { "bezeichnung": "B", "colorRGB": 3889001, "nameImWeb": "Steel Blue 4", "palette": "CM5 owayo Farbsystem", "hatPattern": true },
    { "bezeichnung": "C", "colorRGB": 426605, "nameImWeb": "Mint 4", "palette": "CM5 owayo Farbsystem", "hatPattern": false },
    { "bezeichnung": "K", "colorRGB": 3428744, "nameImWeb": "Royal 3", "palette": "CM5 owayo Farbsystem", "hatPattern": false },
    { "bezeichnung": "SLR", "colorRGB": 3428744, "nameImWeb": "Royal 3", "palette": "CM5 owayo Farbsystem", "hatPattern": false },
    { "bezeichnung": "SLL", "colorRGB": 3428744, "nameImWeb": "Royal 3", "palette": "CM5 owayo Farbsystem", "hatPattern": false },
    { "bezeichnung": "HF", "colorRGB": 16777215, "nameImWeb": "White 1", "palette": "CM5 owayo Farbsystem", "hatPattern": false }
  ],
  "textobjects": [],
  "logos": [],
  "patterns": [
    { "stockLogoID": "2269", "forColorCode": "A", "tileWidthInCM": 17, "colors": [...] },
    { "stockLogoID": "686", "forColorCode": "B", "tileWidthInCM": 5.4, "colors": [...] }
  ],
  "patternAnker": [
    { "partname": "Back", "anker": { "x": 0.50000045, "y": 0.09113361 } },
    { "partname": "Front", "anker": { "x": 0.5, "y": 0.26534969 } }
  ]
}
```

### B. Esquema Relacional `einzelexemplare` (20+ Tallas, Nombres y Números sin Duplicar Texturas)
Decodificado de `loadEinzelexemplare` / `createEinzelExemplarTextArray` en el motor cliente:
* Cada objeto de texto en la prenda posee un `textObjectUUID` único (y un `masterID` cuando el número delantero es clon sincronizado del dorsal trasero).
* La lista de equipo (`einzelexemplare`) **jamás clona el diseño ni sube capturas por jugador**; únicamente envía `{ size, amount, texts }` referenciando `textObjectUUID`:

```json
{
  "saveID": 53339105,
  "einzelexemplare": [
    {
      "size": "L",
      "amount": 1,
      "texts": [
        { "isFixed": false, "value": "RODRÍGUEZ", "textObjectUUID": "uuid-back-name", "masterID": null },
        { "isFixed": false, "value": "10", "textObjectUUID": "uuid-back-num", "masterID": null },
        { "isFixed": false, "value": "10", "textObjectUUID": "uuid-front-num", "masterID": "uuid-back-num" }
      ]
    },
    {
      "size": "M-long",
      "amount": 1,
      "texts": [
        { "isFixed": false, "value": "FERNÁNDEZ-GARCÍA", "textObjectUUID": "uuid-back-name", "masterID": null },
        { "isFixed": false, "value": "7", "textObjectUUID": "uuid-back-num", "masterID": null },
        { "isFixed": false, "value": "7", "textObjectUUID": "uuid-front-num", "masterID": "uuid-back-num" }
      ]
    }
  ]
}
```

---

## 3. Mecánicas Incorporadas Directamente en ATLETIQ Engine v4.0 (Clon Binario 1:1)

1. **Decodificador Binario `.mirl` v1.1 Nativo (`mirlModelLoader.js`)**: Descompresión GZIP en navegador (`DecompressionStream('gzip')`) y parseo de `uint16` para cargar las mallas reales de alta densidad:
   * **Fútbol / E-Sports (`football_f3_ka.mirl` / `204m_Basic_KA`)**: **38,319 vértices y 74,898 triángulos** en 7 sub-mallas independientes (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`, `Etikett`, `EtikettFahne`).
   * **Baloncesto (`basketball_b6_hero.mirl` / `222m-Hero`)**: **31,204 vértices y 60,593 triángulos** en 7 sub-mallas independientes (`Front`, `Back`, `Krageneinfass`, `Aermelbandlinks`, `Aermelbandrechts`, `Etikett`, `EtikettFahne`).
2. **Desempaquetador ZIP `.fish` + LUT 32-Bit ABGR (`fishPartCompositor.js`)**: 15 plantillas `.fish` reales de fútbol (`Tackle`, `Nou Camp`, `Style`, `Steps`, `Gladiator`, `Fight`, `Horizon`, `Level`, `Champion`, `Vivo`, `Strike`, `Rayo`, `Sweep`, `Monaco`, `Pure`) y 9 de baloncesto (`Legend`, `Screen`, `Fly`, `Buzzer`, `Rim`, `Dagger`, `Aero`, `Tower`, `Triple`), limpias de marcas de agua de terceros (`190 <= R < 255` dilatado por BFS) y recoloreadas en `< 1.2 ms`.
3. **Sistema Cromático Textil Completo de 167 Colores (`palette152.js`)**: Matriz oficial **CM5** de 152 tonos (30 familias × 5 gradaciones) + 15 tintas **Flúor / Neón / Metálicas (`FB`)**, cada una vinculada a su código **Pantone® Solid Coated (`PMS`)**.
4. **Proyección Isométrica Multi-Pieza PNG/SVG (`pxPerMmX`, `pxPerMmY`)**: Colocación libre y por arrastre Raycast 3D sobre **las 5 piezas imprimibles** (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`), escala `15%–350%` (incluyendo modo **Sublimación Total All-Over**), rotación `360°` sin deformación de aspecto, sanitización/normalización de SVG de Illustrator/Figma, eliminado de fondo blanco, tintado Pantone monocromo, clonado simétrico entre mangas y textos rectos o en arco circular.
