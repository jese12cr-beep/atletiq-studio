const fs = require('fs');

const eps = fs.readFileSync('b739947f-0216-4571-be95-f5ea9e9d686e.eps', 'utf8');

// Search for layer names (%AI5_BeginLayer)
const layerMatches = [...eps.matchAll(/%AI5_BeginLayer\s*\r?\n\s*\(([^\)]+)\)/g)];
console.log('AI5 Layers found:', layerMatches.map(m => m[1]));

// Also search for Layer in general
const allLayerRefs = [...eps.matchAll(/\(([^\)]+)\)\s*(Lb|Ln|L\w)/g)];
console.log('Layer commands:', allLayerRefs.map(m => m[1]));
