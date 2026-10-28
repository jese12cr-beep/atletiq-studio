const fs = require('fs');

const svgMarkup = fs.readFileSync('public/assets/patterns/plantilla_produccion_tigres_perfect.svg', 'utf8');

console.log('Starts with:', svgMarkup.substring(0, 50));

// Let's check in a simulated HTML DOM
// In HTML:
// <div><?xml version="1.0" encoding="UTF-8"?><svg ...></svg></div>
// If a browser parses HTML, <?xml ... ?> is treated as a comment or XML declaration.
// BUT does the SVG render with width="100%" height="100%"?
console.log('Contains <?xml:', svgMarkup.startsWith('<?xml'));
