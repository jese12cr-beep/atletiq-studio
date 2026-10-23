# 04. Análisis Técnico: Zakeke (`zakeke.com/demo`)

**Rol en nuestra arquitectura:** Modelo comercial líder para **conectar un configurador avanzado con el carrito nativo de Shopify (`/cart/add.js`)** y automatizar la entrega de **archivos listos para manufactura (*Print-Ready*)**.

---

## 1. Por Qué No Se Envía el Archivo de Impresión Directo al Carrito de Shopify

Shopify impone restricciones estrictas en el navegador:
1. El objeto `properties` de cada línea en `/cart/add.js` está pensado para cadenas cortas de texto (meter SVGs completos o imágenes Base64 corrompe la cookie de sesión o dispara errores HTTP `413 Payload Too Large` / `422 Unprocessable Entity`).
2. Los archivos reales para sublimación textil (moldes a tamaño real `80cm × 100cm` a `300 DPI` o vectores con tipografías trazadas a curvas) se deben procesar de forma segura y determinista para que el cliente tampoco pueda alterarlos.

---

## 2. Arquitectura del Payload de Carrito y Producción (Estilo Zakeke)

### Paso 1: Guardado Previo al Carrito (`POST /api/v1/designs/commit`)
Cuando el cliente pulsa **"Añadir al Carrito"**, nuestro motor primero envía el JSON compacto (Esquema Owayo + Coordenadas CustomInk) a nuestro endpoint ligero, que responde en `< 250 ms` con:
* `designId`: Identificador inmutable (`des_9f82c1a0`).
* `previewFrontUrl` y `previewBackUrl`: Miniaturas WebP ligeras (`600×600 px`, ~25 KB) alojadas en CDN.

### Paso 2: Disparo a Shopify AJAX Cart (`POST /cart/add.js`)
Para un pedido de equipo (ej. 15 camisetas distribuidas en tallas S, M, L y XL), agrupamos por variante de talla de Shopify (para que Shopify descuente inventario base o registre las tallas nativamente) compartiendo el mismo `_atletiq_design_id`:

```json
{
  "items": [
    {
      "id": 44901234567001,
      "quantity": 6,
      "properties": {
        "Diseño": "Personalizado Pro (#des_9f82c1a0)",
        "Jugadores (Talla M)": "MATEO (#7), DANIEL (#5), LUCAS (#8) +3 más",
        "_atletiq_design_id": "des_9f82c1a0",
        "_atletiq_preview_front": "https://cdn.atletiq.com/p/des_9f82c1a0_f.webp",
        "_atletiq_preview_back": "https://cdn.atletiq.com/p/des_9f82c1a0_b.webp",
        "_atletiq_roster_subset": "[{\"name\":\"MATEO\",\"num\":\"7\"},{\"name\":\"DANIEL\",\"num\":\"5\"}]",
        "_print_ready_manifest": "https://api.atletiq.com/v1/print-pack/des_9f82c1a0"
      }
    },
    {
      "id": 44901234567002,
      "quantity": 9,
      "properties": {
        "Diseño": "Personalizado Pro (#des_9f82c1a0)",
        "Jugadores (Talla L)": "RODRÍGUEZ (#10), ANDRÉS (#1) +7 más",
        "_atletiq_design_id": "des_9f82c1a0",
        "_atletiq_preview_front": "https://cdn.atletiq.com/p/des_9f82c1a0_f.webp",
        "_atletiq_roster_subset": "[{\"name\":\"RODRÍGUEZ\",\"num\":\"10\"}]"
      }
    }
  ]
}
```
> **Convención clave de Shopify:** Toda propiedad que empieza con guion bajo (`_atletiq_...`) queda **oculta automáticamente** en el carrito y pantalla de pago para no ensuciar la vista del comprador, pero **sí viaja íntegra** al Panel de Administración de Shopify y a los Webhooks de fábrica.
> Además, en el Cart Drawer Liquid reemplazamos `item.image` por `item.properties['_atletiq_preview_front']` para que el comprador vea exactamente su camiseta diseñada.

### Paso 3: Generación de Archivos Print-Ready para Manufactura
Cuando entra el pedido en Shopify (`orders/paid`), el generador de producción toma el `designId` y exporta el paquete ZIP para el taller textil:
1. **Textos convertidos a curvas (`<path>`)** usando `opentype.js` para que el taller no necesite tener instaladas las fuentes.
2. **Piezas separadas en escala real 1:1 (`mm`)** con margen de sangrado (*bleed* de `15 mm`) y marcas de registro óptico para cortadora láser.
3. **Iteración automática del Roster**: Genera `Pieza_Espalda_TallaL_Jugador01_RODRIGUEZ_10.pdf`, `Pieza_Espalda_TallaM_Jugador02_MATEO_7.pdf`, etc., en segundos.

---

## 3. Qué Inspeccionar con REA en Zakeke

1. **Archivo HAR del clic exacto en "Add to Cart"**:
   * Capturar la llamada previa a los servidores de Zakeke (para ver cómo empaquetan las matrices de transformación 2D/3D de cada capa y los IDs de las áreas de impresión) y la llamada inmediata posterior a `/cart/add.js`.
2. **Manejo de recargos de precio dinámicos**:
   * Ver si usan variantes ocultas, productos *draft* al vuelo o *Cart Transform Functions* cuando una personalización suma un costo extra (ej. bordado 3D o parche dorado).
