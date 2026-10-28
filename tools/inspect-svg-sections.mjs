import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');

// Let's print all top-level elements and attributes
console.log('SVG viewBox:', svg.match(/viewBox="[^"]*"/)?.[0]);

// Find all top level tags inside <svg>
const tags = svg.match(/<([a-zA-Z]+)([^>]*)>/g);
console.log('Top level tags found:', tags.slice(0, 15));

// Check <defs>
const defsMatch = svg.match(/<defs>([\s\S]*?)<\/defs>/);
if (defsMatch) {
  console.log('Defs length:', defsMatch[1].length);
  console.log('Defs preview:', defsMatch[1].slice(0, 200));
}

// Check <g id="BACKGROUND">
const bgMatch = svg.match(/<g\s+id="BACKGROUND"[^>]*>([\s\S]*?)<\/g>\s*<g\s+id="DESIGN"/);
if (bgMatch) {
  console.log('BACKGROUND length:', bgMatch[1].length);
}

// Check <g id="DESIGN">
const designMatch = svg.match(/<g\s+id="DESIGN"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
if (designMatch) {
  console.log('DESIGN length:', designMatch[1].length);
}
