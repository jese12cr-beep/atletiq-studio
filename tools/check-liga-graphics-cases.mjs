import fs from 'fs';

const content = fs.readFileSync('src/engine/compositor/ligaMxKitsEngine.js', 'utf8');
const cases = [...content.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('All graphic IDs in ligaMxKitsEngine.js:');
cases.forEach(c => console.log(' -', c));
