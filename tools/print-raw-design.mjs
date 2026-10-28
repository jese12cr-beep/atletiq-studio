import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');
const designGroupMatch = svg.match(/<g\s+id="DESIGN"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
console.log('DESIGN group raw:');
console.log(designGroupMatch[1]);
