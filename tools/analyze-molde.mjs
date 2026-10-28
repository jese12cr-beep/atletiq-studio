import fs from 'fs';

const svgContent = fs.readFileSync('C:\\Users\\crja_\\Downloads\\MOLDE CAMISA.svg', 'utf8');

const vbMatch = svgContent.match(/viewBox="([^"]+)"/);
console.log('ViewBox:', vbMatch ? vbMatch[1] : 'none');

const designGroupMatch = svgContent.match(/<g id="DESIGN">([\s\S]*?)<\/g>/);
if (designGroupMatch) {
  const elements = designGroupMatch[1].match(/<(path|rect)[^>]+>/g) || [];
  console.log(`Found ${elements.length} elements in DESIGN group:`);
  
  elements.forEach((el, idx) => {
    console.log(`\n================ Element ${idx + 1} ================`);
    const tag = el.match(/^<(\w+)/)[1];
    const dMatch = el.match(/d="([^"]+)"/);
    const xMatch = el.match(/x="([^"]+)"/);
    const yMatch = el.match(/y="([^"]+)"/);
    const wMatch = el.match(/width="([^"]+)"/);
    const hMatch = el.match(/height="([^"]+)"/);
    const transMatch = el.match(/transform="([^"]+)"/);
    const classMatch = el.match(/class="([^"]+)"/);

    console.log(`Tag: <${tag}> | Class: ${classMatch ? classMatch[1] : 'none'}`);
    
    if (dMatch) {
      const d = dMatch[1];
      // Parse coordinates accurately
      const commands = d.match(/[a-df-z]|[-+]?[0-9]*\.?[0-9]+/gi);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let currX = 0, currY = 0;
      let i = 0;
      
      while (i < commands.length) {
        const token = commands[i];
        if (isNaN(Number(token))) {
          // command
          const cmd = token;
          i++;
          if (cmd === 'M' || cmd === 'L') {
            const x = Number(commands[i++]);
            const y = Number(commands[i++]);
            currX = x; currY = y;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          } else if (cmd === 'l') {
            const dx = Number(commands[i++]);
            const dy = Number(commands[i++]);
            currX += dx; currY += dy;
            minX = Math.min(minX, currX); maxX = Math.max(maxX, currX);
            minY = Math.min(minY, currY); maxY = Math.max(maxY, currY);
          } else if (cmd === 'c') {
            // cubic relative
            const dx1 = Number(commands[i++]);
            const dy1 = Number(commands[i++]);
            const dx2 = Number(commands[i++]);
            const dy2 = Number(commands[i++]);
            const dx = Number(commands[i++]);
            const dy = Number(commands[i++]);
            minX = Math.min(minX, currX + dx1, currX + dx2, currX + dx);
            maxX = Math.max(maxX, currX + dx1, currX + dx2, currX + dx);
            minY = Math.min(minY, currY + dy1, currY + dy2, currY + dy);
            maxY = Math.max(maxY, currY + dy1, currY + dy2, currY + dy);
            currX += dx; currY += dy;
          } else if (cmd === 'h') {
            const dx = Number(commands[i++]);
            currX += dx;
            minX = Math.min(minX, currX); maxX = Math.max(maxX, currX);
          } else if (cmd === 'H') {
            const x = Number(commands[i++]);
            currX = x;
            minX = Math.min(minX, currX); maxX = Math.max(maxX, currX);
          } else if (cmd === 'v') {
            const dy = Number(commands[i++]);
            currY += dy;
            minY = Math.min(minY, currY); maxY = Math.max(maxY, currY);
          } else if (cmd === 'V') {
            const y = Number(commands[i++]);
            currY = y;
            minY = Math.min(minY, currY); maxY = Math.max(maxY, currY);
          }
        } else {
          i++;
        }
      }

      const w = maxX - minX;
      const h = maxY - minY;
      console.log(`Bounds: X: [${minX.toFixed(2)} to ${maxX.toFixed(2)}] (Width: ${w.toFixed(2)})`);
      console.log(`        Y: [${minY.toFixed(2)} to ${maxY.toFixed(2)}] (Height: ${h.toFixed(2)})`);
      console.log(`Center: X: ${((minX + maxX)/2).toFixed(2)}, Y: ${((minY + maxY)/2).toFixed(2)}`);
    }

    if (xMatch) {
      console.log(`Rect coords: x=${xMatch[1]}, y=${yMatch[1]}, w=${wMatch[1]}, h=${hMatch[1]}`);
      if (transMatch) console.log(`Transform: ${transMatch[1]}`);
    }
  });
}
