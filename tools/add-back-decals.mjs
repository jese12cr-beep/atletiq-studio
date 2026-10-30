import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/mexicoKitsData.js');
let content = fs.readFileSync(filePath, 'utf-8');

const backAdditions = [
  {
    targetId: 'decal_mx_chivas_stripes',
    backDecal: `      {
        id: 'decal_mx_chivas_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_chivas_stripes',
        label: 'Rayas Verticales Rojiblancas Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_rayados_stripes',
    backDecal: `      {
        id: 'decal_mx_rayados_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_rayados_stripes',
        label: 'Franjas Azul Marino Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_santos_hoops',
    backDecal: `      {
        id: 'decal_mx_santos_hoops_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_santos_hoops',
        label: 'Franjas Horizontales Albiverdes Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_pachuca_stripes',
    backDecal: `      {
        id: 'decal_mx_pachuca_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_pachuca_stripes',
        label: 'Franjas Tuzos Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_necaxa_stripes',
    backDecal: `      {
        id: 'decal_mx_necaxa_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_necaxa_stripes',
        label: 'Franjas Rayos Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_queretaro_stripes',
    backDecal: `      {
        id: 'decal_mx_queretaro_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_queretaro_stripes',
        label: 'Franjas Gallos Blancos Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_san_luis_stripes',
    backDecal: `      {
        id: 'decal_mx_san_luis_stripes_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_san_luis_stripes',
        label: 'Franjas Rojiblancas Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_atlas_half_split',
    backDecal: `      {
        id: 'decal_mx_atlas_half_split_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_atlas_half_split',
        label: 'División Rojinegra 50/50 Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        flipX: true,
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_puebla_sash',
    backDecal: `      {
        id: 'decal_mx_puebla_sash_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_puebla_franja_sash',
        label: 'La Franja Diagonal Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        flipX: true,
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_puebla_away_sash',
    backDecal: `      {
        id: 'decal_mx_puebla_away_sash_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_puebla_franja_sash',
        label: 'La Franja Diagonal Visita Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 387 },
        sizeMm: { width: 519.25, height: 774.83 },
        flipX: true,
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_america_chevron',
    backDecal: `      {
        id: 'decal_mx_america_chevron_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_america_aztec_chevron',
        label: 'Chevron Azteca Plumaje Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 220 },
        sizeMm: { width: 519.25, height: 320 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  },
  {
    targetId: 'decal_mx_america_away_chevron',
    backDecal: `      {
        id: 'decal_mx_america_away_chevron_back',
        type: 'LIGAMX_GRAPHIC',
        graphicId: 'mx_america_aztec_chevron',
        label: 'Chevron Azteca Visita Espalda',
        panel: 'back',
        centerMm: { x: 259.6, y: 220 },
        sizeMm: { width: 519.25, height: 320 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 5,
        pinned: true,
        locked: true,
      },`
  }
];

for (const item of backAdditions) {
  // Check if target decal exists and if back decal not already added
  const regex = new RegExp(`(id:\\s*'${item.targetId}'[\\s\\S]*?locked:\\s*true,\\s*\\},)`, 'm');
  if (regex.test(content) && !content.includes(`${item.targetId}_back`)) {
    content = content.replace(regex, `$1\n${item.backDecal}`);
    console.log(`Added back decal for ${item.targetId}`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('All back decals processed successfully.');
