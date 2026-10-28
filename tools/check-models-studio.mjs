import { PRODUCT_MODELS, createDefaultDesignForProduct } from '../src/engine/core/designStore.js';

console.log('PRODUCT_MODELS:', Object.keys(PRODUCT_MODELS || {}));
for (const [k, v] of Object.entries(PRODUCT_MODELS || {})) {
  console.log(`- ${k}: ${v.name} (${v.badge || ''})`);
}
