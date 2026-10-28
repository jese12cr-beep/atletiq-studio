import { ENGINE_PRODUCTS } from '../src/engine/core/designStore.js';

console.log('Total ENGINE_PRODUCTS:', ENGINE_PRODUCTS.length);
ENGINE_PRODUCTS.forEach((p, i) => {
  console.log(`${i+1}. [${p.id}] ${p.name} (${p.sport} - ${p.gender})`);
});
