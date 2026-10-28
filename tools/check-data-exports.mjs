import fs from 'fs';

// Search in src/data for other models/products/patterns
const files = fs.readdirSync('src/data');
console.log('Files in src/data:', files);

// Let's check mockData.js or products data
for (const file of files) {
  const content = fs.readFileSync('src/data/' + file, 'utf8');
  const matches = content.match(/export const (\w+)/g);
  if (matches) {
    console.log(`In ${file}:`, matches);
  }
}
