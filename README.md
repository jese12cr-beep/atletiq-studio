# ATLETIQ Sport Studio 3D — Custom Sportswear & Liga MX Edition

Plataforma de personalización de ropa deportiva en tiempo real con visor 3D WebGL (Three.js), motor de sublimación textil 2D paramétrico, colección completa de 36 uniformes inspirados en la Liga MX (18 Locales y 18 Visitantes), gestión masiva de roster (nombres/dorsales/tallas) y lista para venta directa en **Shopify**.

---

## 🚀 Características Principales

1. **Visor 3D WebGL en Tiempo Real (Three.js)**:
   - Renderizado físico con tejido técnico micro-relieve (`TS-Tex Ultra-Dry`, `K-Tex Basket Micromesh`, `SR-Tex Anti-Fricción`).
   - Control de cámara 360°, zoom, ángulos predefinidos (3/4, Frente, Espalda, Mangas, Interior) y giro continuo.
   - Generación de textura UV procedural ultranítida a 60 fps en canvas HTML5.

2. **Colección Completa Liga MX (36 Kits: 18 Locales + 18 Visitantes)**:
   - **100% Legal para venta en Shopify**: Patrones geométricos y heráldica sin marcas de fabricantes multinacionales (Nike/Adidas/Puma) ni patrocinios comerciales.
   - **Miniaturas Vectoriales 2D (`JerseyThumbnailMiniature`)**: Cada uniforme muestra su silueta real anatómica, cuello, mangas, corte y patrón en lugar de simples círculos de color.
   - **Selector Contextual de Diseño Dual**: Al seleccionar un uniforme de la Liga MX, el panel de diseño muestra exclusivamente sus 2 versiones oficiales (**🏠 Local** y **✈️ Visitante**) con cambio instantáneo en 3D.
   - Para prendas normales, se mantienen los **16 estilos de corte CAD tradicionales** (`Tackle`, `City`, `Nou Camp`, `Fight`, `Pure`, etc.).

3. **Herramientas de Personalización & Taller Textil**:
   - Subida y validación de logotipos con cálculo de DPI en vivo (avisos de baja resolución < 150 DPI).
   - Nombres y dorsales dinámicos en pecho y espalda con doble contorno y tipografías condensadas deportivas.
   - Importador masivo de jugadores vía CSV / lista de texto con tallas personalizadas.

4. **Ejecución y Despliegue 100% Autónomo**:
   - Compilación estática pura (`dist/`) lista para montar en **GitHub Pages**, **Vercel**, **Netlify** o como sección Liquid en **Shopify**.
   - Script de Windows con 1 clic: `iniciar_estudio.bat`.

---

## 📂 Estructura del Proyecto

```
sport-custom-studio/
├── dist/                      # Build de producción optimizado listo para hosting
├── public/                    # Modelos 3D (.glb), texturas y mockups base
├── src/
│   ├── components/            # Landing page, catálogo, carrito y modales
│   │   └── studio/            # Workspace híbrido y miniaturas 2D
│   ├── data/                  # Catálogo de 36 kits Liga MX (mexicoKitsData.js)
│   └── engine/
│       ├── compositor/        # Motor vectorial y renderizado UV (ligaMxKitsEngine.js)
│       ├── core/              # Estado inmutable, validador DPI y cajas delimitadoras
│       └── viewer3d/          # Escena Three.js, luces, sombras y controles orbitales
├── iniciar_estudio.bat        # Lanzador local para Windows con 1 doble clic
└── vite.config.js             # Configuración de compilación Vite
```

---

## 🛠️ Instalación y Uso Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción (genera carpeta dist/)
npm run build

# 4. Probar la versión de producción localmente
npm run preview
```

En Windows también puedes simplemente hacer **doble clic en `iniciar_estudio.bat`**.

---

## 🌐 Conectar con GitHub y Desplegar

### 1. Subir a un nuevo repositorio de GitHub
```bash
# Vincular con tu repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Renombrar rama a main (estándar de GitHub)
git branch -M main

# Subir todos los cambios
git push -u origin main
```

### 2. Despliegue Automático Gratis con GitHub Pages
En tu repositorio de GitHub:
1. Ve a **Settings > Pages**.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Selecciona la plantilla de **Static HTML** o usa el workflow de Vite.

O arrastra la carpeta `dist/` a [Netlify Drop](https://app.netlify.com/drop) o [Vercel](https://vercel.com) para tener tu web activa en segundos con tu propio subdominio (ej: `https://atletiq-studio.netlify.app`).

---

## 🛒 Integración con Shopify

Embebe el configurador en cualquier tema de Shopify como una sección Liquid dentro de tu tienda:

```liquid
<div style="width: 100%; height: 92vh; overflow: hidden;">
  <iframe 
    src="https://tu-repositorio-o-dominio.netlify.app" 
    style="width: 100%; height: 100%; border: 0;"
    allow="clipboard-write">
  </iframe>
</div>
```
