import { PRODUCTS_CATALOG, PATTERNS } from '../src/data/mockData.js';

console.log('PRODUCTS_CATALOG:', PRODUCTS_CATALOG.length);
PRODUCTS_CATALOG.forEach(p => console.log('Product:', p.id, p.name));

console.log('\nPATTERNS:', PATTERNS.length);
PATTERNS.forEach(p => console.log('Pattern:', p.id, p.name));
