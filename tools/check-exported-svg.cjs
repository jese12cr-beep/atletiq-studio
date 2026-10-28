const fs = require('fs');
const svg = fs.readFileSync('public/assets/patterns/plantilla_produccion_tigres_perfect.svg', 'utf8');

console.log('Length:', svg.length);
const groups = [...svg.matchAll(/<g\s+id="([^"]+)"/g)].map(m => m[1]);
console.log('Group IDs:', groups);

// Check if any tags are invalid or if anything is clipped
const clipPaths = [...svg.matchAll(/<clipPath\s+id="([^"]+)"/g)].map(m => m[1]);
console.log('ClipPaths:', clipPaths);

// Check if there are any <image> tags
const images = [...svg.matchAll(/<image\s+([^>]+)>/g)].map(m => m[1]);
console.log('Images found count:', images.length);
images.forEach(img => console.log('Image tag:', img.substring(0, 100)));
