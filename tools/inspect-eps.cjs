const fs = require('fs');

const eps = fs.readFileSync('b739947f-0216-4571-be95-f5ea9e9d686e.eps', 'utf8');

// Get first 2000 chars
console.log('--- EPS HEADER ---');
console.log(eps.substring(0, 1500));

// Check BoundingBox
const bbMatch = eps.match(/%%BoundingBox:\s*([^\r\n]+)/);
console.log('BoundingBox:', bbMatch ? bbMatch[1] : 'not found');

const hiResBBMatch = eps.match(/%%HiResBoundingBox:\s*([^\r\n]+)/);
console.log('HiResBoundingBox:', hiResBBMatch ? hiResBBMatch[1] : 'not found');

// Check Document Custom Colors / Process Colors
const processMatch = eps.match(/%%DocumentProcessColors:\s*([^\r\n]+)/);
console.log('ProcessColors:', processMatch ? processMatch[1] : 'not found');
