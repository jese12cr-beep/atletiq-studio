import fs from 'fs';
import path from 'path';

const userFolder = 'C:\\Users\\crja_\\OneDrive\\Documentos\\PROYECTO ATLETICQ';
const targetFolder = 'C:\\Users\\crja_\\.gemini\\antigravity\\scratch\\sport-custom-studio\\public\\assets\\presets\\ligamx';

if (!fs.existsSync(targetFolder)) {
  fs.mkdirSync(targetFolder, { recursive: true });
}

const mapping = {
  'chivas-logoquake_167672-768x768.png': 'mx_chivas.png',
  'mexico_atlante_3000x3000.football-logos.cc.png': 'mx_atlante.png',
  'mexico_atlas_3000x3000.football-logos.cc.png': 'mx_atlas.png',
  'mexico_atletico-de-san-luis_3000x3000.football-logos.cc.png': 'mx_san_luis.png',
  'mexico_club-america_3000x3000.football-logos.cc.png': 'mx_america.png',
  'mexico_club-leon_3000x3000.football-logos.cc.png': 'mx_leon.png',
  'mexico_club-tijuana_3000x3000.football-logos.cc.png': 'mx_xolos.png',
  'mexico_cruz-azul_3000x3000.football-logos.cc.png': 'mx_cruz_azul.png',
  'mexico_fc-juarez_3000x3000.football-logos.cc.png': 'mx_juarez.png',
  'mexico_monterrey_3000x3000.football-logos.cc.png': 'mx_rayados.png',
  'mexico_necaxa_3000x3000.football-logos.cc.png': 'mx_necaxa.png',
  'mexico_pachuca_3000x3000.football-logos.cc (1).png': 'mx_pachuca.png',
  'mexico_puebla_3000x3000.football-logos.cc.png': 'mx_puebla.png',
  'mexico_queretaro-fc_3000x3000.football-logos.cc.png': 'mx_queretaro.png',
  'mexico_santos-laguna_3000x3000.football-logos.cc.png': 'mx_santos.png',
  'mexico_tigres-uanl_3000x3000.football-logos.cc.png': 'mx_tigres.png',
  'mexico_toluca_3000x3000.football-logos.cc.png': 'mx_toluca.png',
  'mexico_unam-pumas_3000x3000.football-logos.cc.png': 'mx_pumas.png',
};

const userFiles = fs.readdirSync(userFolder);
console.log('Files found in user folder:', userFiles.length);

for (const [srcName, destName] of Object.entries(mapping)) {
  const srcPath = path.join(userFolder, srcName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetFolder, destName));
    console.log(`Copied ${srcName} -> ${destName}`);
  } else {
    console.warn(`Source file not found: ${srcName}`);
  }
}

console.log('Done mapping Liga MX logos.');
