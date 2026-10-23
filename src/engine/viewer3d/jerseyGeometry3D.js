/**
 * ATLETIQ Engine v3.1 — Topología 3D Anatómica de 7 Piezas Cosidas (Basada en REA Owayo `222m-Hero.mirl`)
 *
 * Sustituye el cilindro básico por patronaje textil real de 7 sub-mallas (`THREE.Mesh`) independientes:
 *   1. `Front`            (Panel delantero con escote analítico V-Neck/Crew, caída pectoral y pliegues suaves, `isDroppable: true`)
 *   2. `Back`             (Panel trasero con omóplatos, caída lumbar/drop-tail ciclista y costuras exactas, `isDroppable: true`)
 *   3. `Krageneinfass`    (Ribete acanalado 3D `Bandstoff_R-Tex-3_48mm` cosido al escote exacto, `isDroppable: false`)
 *   4. `Aermelbandlinks`  (Ribete de sisa 48mm en `basketball_tank` o manga anatómica cosida a la sisa 3D + puño)
 *   5. `Aermelbandrechts` (Ribete de sisa derecha o manga derecha cosida a la sisa 3D + puño)
 *   6. `Etikett`          (Etiqueta tejida interior de nuca visible a través del cuello abierto)
 *   7. `EtikettFahne`     (Banderín lateral tejido en costura inferior izquierda)
 *
 * Garantiza winding exterior consistente (`gl_FrontFacing == true` por fuera, `false` por dentro) para que
 * el shader de reverso sublimado pinte el interior al 62% blanco poliéster `K-Tex 2`.
 */

import * as THREE from 'three';

let cachedEtikettTexture = null;

function getWovenEtikettTexture() {
  if (cachedEtikettTexture && typeof document !== 'undefined') {
    return cachedEtikettTexture;
  }
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 112);

  ctx.fillStyle = '#facc15';
  ctx.font = "900 28px 'Bebas Neue', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('ATLETIQ PRO', 128, 46);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 15px monospace';
  ctx.fillText('K-TEX 2 • SUBLIMATED', 128, 74);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 18px sans-serif';
  ctx.fillText('SIZE L / CORTE PRO', 128, 102);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedEtikettTexture = tex;
  return tex;
}

/**
 * Evalúa el perfil geométrico exacto del patrón en función del tipo de prenda.
 */
function createPatternProfile(garmentShape = 'jersey_short', collarStyle = 'v-neck') {
  const isBasketball = garmentShape === 'basketball_tank';
  const isCycling = garmentShape === 'cycling_aero';

  const topY = 1.18;
  const torsoHeight = isBasketball ? 2.38 : isCycling ? 2.40 : 2.34;
  const neckHalfS = isBasketball ? 0.37 : 0.33;
  const shoulderSlopeY = isBasketball ? 0.11 : 0.165;
  const armholeBottomT = isBasketball ? 0.43 : isCycling ? 0.34 : 0.36;

  // Curva de escote normalizada en `t` para `|s| < neckHalfS`
  function getNeckDropT(s, side) {
    const absS = Math.abs(s);
    if (absS >= neckHalfS) return 0;
    const uNeck = absS / neckHalfS; // 0 en centro, 1 en borde del cuello

    if (side > 0) {
      // Frente
      if (collarStyle === 'v-neck') {
        const maxDip = isBasketball ? 0.255 : 0.195;
        return maxDip * Math.pow(1 - uNeck, 1.18);
      }
      // Cuello redondo / ciclista
      const maxDip = isBasketball ? 0.205 : isCycling ? 0.115 : 0.138;
      return maxDip * Math.sqrt(Math.max(0, 1 - uNeck * uNeck));
    }
    // Espalda (escote trasero anatómico, más pronunciado en baloncesto B6 Hero)
    const backDip = isBasketball ? 0.095 : 0.048;
    return backDip * Math.sqrt(Math.max(0, 1 - uNeck * uNeck));
  }

  // Semiancho físico de la pieza en función de la altura normalizada `t ∈ [0..1]`
  function getHalfWidth(t) {
    if (isBasketball) {
      // Corte `222m-Hero`: tirantes atléticos -> sisa profunda curvada -> pecho -> caída recta
      if (t < armholeBottomT) {
        const k = t / armholeBottomT;
        // Sisa cóncava hacia adentro en mitad superior y apertura suave hacia axila
        const scyeInward = Math.sin(k * Math.PI) * 0.095;
        return THREE.MathUtils.lerp(0.56, 0.77, Math.pow(k, 1.45)) - scyeInward * (1 - k * 0.45);
      }
      if (t < 0.72) {
        const k = (t - armholeBottomT) / (0.72 - armholeBottomT);
        return THREE.MathUtils.lerp(0.77, 0.735, Math.sin(k * Math.PI * 0.5));
      }
      const k = (t - 0.72) / 0.28;
      return THREE.MathUtils.lerp(0.735, 0.775, k);
    }

    // Fútbol / E-Sports / Ciclismo: hombro -> curva de sisa sastre -> entalle cintura -> cadera
    if (t < armholeBottomT) {
      const k = t / armholeBottomT;
      const scyeIndent = Math.sin(k * Math.PI) * 0.068;
      return THREE.MathUtils.lerp(0.81, 0.79, k) - scyeIndent;
    }
    const waistW = isCycling ? 0.655 : 0.725;
    const hipW = isCycling ? 0.695 : 0.768;
    if (t < 0.70) {
      const k = (t - armholeBottomT) / (0.70 - armholeBottomT);
      return THREE.MathUtils.lerp(0.79, waistW, Math.sin((k * Math.PI) / 2));
    }
    const k = (t - 0.70) / 0.30;
    return THREE.MathUtils.lerp(waistW, hipW, k);
  }

  // Semiprofundidad torácica Z en función de `t` y cara (`+1` pecho, `-1` espalda)
  function getHalfDepth(t, side) {
    let baseD;
    if (t < 0.28) {
      const k = t / 0.28;
      baseD = THREE.MathUtils.lerp(0.24, 0.42, Math.sin((k * Math.PI) / 2));
    } else if (t < 0.68) {
      const k = (t - 0.28) / 0.40;
      baseD = THREE.MathUtils.lerp(0.42, isCycling ? 0.34 : 0.365, k);
    } else {
      const k = (t - 0.68) / 0.32;
      baseD = THREE.MathUtils.lerp(isCycling ? 0.34 : 0.365, 0.385, k);
    }
    // Contorno anatómico diferencial: volumen pectoral al frente vs curvatura escapular/lumbar detrás
    if (side > 0) {
      const chestContour = Math.exp(-Math.pow((t - 0.29) / 0.16, 2)) * 0.042;
      return baseD + chestContour;
    }
    const scapulaContour = Math.exp(-Math.pow((t - 0.24) / 0.15, 2)) * 0.028;
    const lumbarHollow = Math.exp(-Math.pow((t - 0.64) / 0.16, 2)) * -0.022;
    return baseD * 0.92 + scapulaContour + lumbarHollow;
  }

  // Apertura Z en el borde exterior (`|s| = 1`) dentro de la sisa (`t < armholeBottomT`), 0 en costura lateral
  function getArmholeEdgeZ(t) {
    if (t >= armholeBottomT) return 0;
    const k = t / armholeBottomT;
    const maxOpen = isBasketball ? 0.205 : 0.185;
    return Math.sin(k * Math.PI) * maxOpen;
  }

  // Evalúa un punto 3D exacto sobre el panel `side` (`+1` Front, `-1` Back) para `(s ∈ [-1..1], t ∈ [0..1])`
  function evalPanelPoint(s, t, side) {
    const absS = Math.abs(s);
    const halfW = getHalfWidth(t);
    const halfD = getHalfDepth(t, side);

    // Caída de hombro anatómica desde el borde del cuello hacia el acromion (`|s| >= neckHalfS`)
    const shoulderRatio = absS <= neckHalfS ? 0 : (absS - neckHalfS) / (1 - neckHalfS);
    const shoulderDrop = shoulderSlopeY * shoulderRatio * Math.max(0, 1 - t / 0.42);

    // Drop-tail aerodinámico trasero en maillot de ciclismo
    const cyclingDropTail =
      isCycling && side < 0 ? Math.pow(Math.max(0, t - 0.55) / 0.45, 1.6) * 0.095 * Math.cos(s * 1.1) : 0;

    const y = topY - t * torsoHeight - shoulderDrop - cyclingDropTail;
    const xBase = s * halfW;

    // Rampa suave desde `z = 0` en la costura superior de hombro (`t = 0`) hacia el volumen completo
    const shoulderWeldRamp = Math.sin(Math.min(1, t / 0.14) * (Math.PI / 2));
    // Perfil transversal superelíptico que vale 1 en el centro (`s=0`) y 0 en la costura lateral (`|s|=1`)
    const crossArch = Math.pow(Math.max(0, Math.cos((s * Math.PI) / 2)), 0.82);
    const edgeArmZ = getArmholeEdgeZ(t) * Math.pow(absS, 2.2);

    // Micro-pliegues textiles realistas (cero en bordes de costura `|s|=1` y `t=0` para mantener unión hermética)
    const interiorMask = (1 - Math.pow(absS, 4)) * Math.sin(Math.min(1, t / 0.12) * (Math.PI / 2));
    const drapeFold =
      (Math.sin(s * 9.0 + t * 3.4 * side) * 0.0085 * Math.sin(t * Math.PI) +
        Math.cos(s * 15.0 - t * 2.1) * 0.0045 * Math.pow(t, 1.3)) *
      interiorMask;

    const zMag = halfD * crossArch * shoulderWeldRamp + edgeArmZ * (1 - crossArch * 0.35) + drapeFold;
    const z = side * zMag;
    const x = xBase * (1 + drapeFold * 0.35);

    return { x, y, z, halfW };
  }

  return {
    isBasketball,
    isCycling,
    topY,
    torsoHeight,
    neckHalfS,
    armholeBottomT,
    getNeckDropT,
    getHalfWidth,
    evalPanelPoint,
  };
}

/**
 * Construye una malla de panel (`Front` o `Back`) con escote exacto libre de dientes de sierra
 * y proyección UV ortográfica compensada (`partStauchungsFaktor`).
 */
function buildSewnTorsoPanelGeometry(profile, side, uSegs = 84, vSegs = 88) {
  const positions = new Float32Array((uSegs + 1) * (vSegs + 1) * 3);
  const uvs = new Float32Array((uSegs + 1) * (vSegs + 1) * 2);
  const indices = [];

  const maxRefHalfW = 0.82;
  let ptrPos = 0;
  let ptrUv = 0;

  for (let iy = 0; iy <= vSegs; iy++) {
    const vFrac = iy / vSegs;
    for (let ix = 0; ix <= uSegs; ix++) {
      const s = (ix / uSegs) * 2 - 1; // [-1 .. +1]
      const tStart = profile.getNeckDropT(s, side);
      const t = THREE.MathUtils.lerp(tStart, 1.0, vFrac);

      const pt = profile.evalPanelPoint(s, t, side);
      positions[ptrPos++] = pt.x;
      positions[ptrPos++] = pt.y;
      positions[ptrPos++] = pt.z;

      // Proyección UV ortográfica desde coordenadas físicas reales (garantiza franjas y textos rectos sin deformación)
      const normPhysicalX = THREE.MathUtils.clamp(pt.x / maxRefHalfW, -1, 1);
      const normPhysicalY = THREE.MathUtils.clamp((profile.topY - pt.y) / (profile.torsoHeight + 0.14), 0, 1);

      const u = side > 0 ? 0.25 + normPhysicalX * 0.215 : 0.75 - normPhysicalX * 0.215;
      const v = 0.96 - normPhysicalY * 0.91;
      uvs[ptrUv++] = u;
      uvs[ptrUv++] = v;
    }
  }

  const stride = uSegs + 1;
  for (let iy = 0; iy < vSegs; iy++) {
    for (let ix = 0; ix < uSegs; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = (iy + 1) * stride + ix;
      const d = c + 1;

      if (side > 0) {
        // `Front` mira hacia +Z -> CCW exterior es (a, c, b), (b, c, d)
        indices.push(a, c, b);
        indices.push(b, c, d);
      } else {
        // `Back` mira hacia -Z -> CCW exterior es (a, b, c), (b, d, c)
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Construye el ribete acanalado 3D del cuello (`Krageneinfass` — `Bandstoff_R-Tex-3_48mm`)
 * siguiendo exactamente el contorno 3D analítico del escote delantero y trasero.
 */
function buildCollarRibGeometry(profile, collarStyle) {
  const pts = [];
  const halfSteps = 36;

  // Mitad delantera: de derecha (`s = -neckHalfS`) a izquierda (`s = +neckHalfS`)
  for (let i = 0; i <= halfSteps; i++) {
    const s = THREE.MathUtils.lerp(-profile.neckHalfS, profile.neckHalfS, i / halfSteps);
    const t = profile.getNeckDropT(s, +1);
    const p = profile.evalPanelPoint(s, t, +1);
    pts.push(new THREE.Vector3(p.x, p.y + 0.008, p.z));
  }

  // Mitad trasera: de izquierda (`s = +neckHalfS`) a derecha (`s = -neckHalfS`)
  for (let i = 1; i < halfSteps; i++) {
    const s = THREE.MathUtils.lerp(profile.neckHalfS, -profile.neckHalfS, i / halfSteps);
    const t = profile.getNeckDropT(s, -1);
    const p = profile.evalPanelPoint(s, t, -1);
    pts.push(new THREE.Vector3(p.x, p.y + 0.008, p.z));
  }

  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.35);
  const radius = profile.isBasketball ? 0.032 : collarStyle === 'v-neck' ? 0.029 : 0.031;
  return new THREE.TubeGeometry(curve, 96, radius, 14, true);
}

/**
 * Muestrea el bucle cerrado 3D de la sisa (`s = sideSign`, `t ∈ [0..armholeBottomT]` en Front + Back).
 */
function sampleArmholeLoopPoints(profile, sideSign, halfSamples = 28) {
  const loop = [];
  // Bajada por el frente de hombro (`t = 0`) a axila (`t = armholeBottomT`)
  for (let i = 0; i <= halfSamples; i++) {
    const t = (i / halfSamples) * profile.armholeBottomT;
    const p = profile.evalPanelPoint(sideSign, t, +1);
    loop.push(new THREE.Vector3(p.x, p.y, p.z));
  }
  // Subida por la espalda de axila (`t = armholeBottomT`) a hombro (`t = 0`)
  for (let i = 1; i < halfSamples; i++) {
    const t = (1 - i / halfSamples) * profile.armholeBottomT;
    const p = profile.evalPanelPoint(sideSign, t, -1);
    loop.push(new THREE.Vector3(p.x, p.y, p.z));
  }
  return loop;
}

/**
 * Construye o bien el ribete de sisa de 48 mm (`Aermelband` de baloncesto `222m-Hero`)
 * o la manga sastre 3D cosida directamente al bucle de la sisa + su puño acanalado.
 */
function buildArmholeOrSleeveParts(profile, sideSign, materials) {
  const partName = sideSign > 0 ? 'Aermelbandlinks' : 'Aermelbandrechts';
  const loopPts = sampleArmholeLoopPoints(profile, sideSign, 28);

  if (profile.isBasketball) {
    // Camiseta de Baloncesto `222m-Hero`: Ribete acanalado de 48 mm bordeando la sisa abierta
    const scyeCurve = new THREE.CatmullRomCurve3(loopPts, true, 'centripetal', 0.4);
    const ribGeo = new THREE.TubeGeometry(scyeCurve, 84, 0.028, 12, true);
    const ribMesh = new THREE.Mesh(ribGeo, materials.accents);
    ribMesh.name = partName;
    ribMesh.userData = { isDroppable: false, owayoPart: partName };
    ribMesh.castShadow = true;
    ribMesh.receiveShadow = true;
    return [ribMesh];
  }

  // Manga anatómica cosida directamente al bucle 3D de la sisa (0.000 mm de hueco)
  const ringCount = loopPts.length;
  const lengthSegs = 26;
  const sleeveLen = profile.isCycling ? 0.78 : 0.62;

  // Centroide de la sisa y eje natural del brazo relajado (~37° hacia abajo)
  const centerScye = new THREE.Vector3();
  loopPts.forEach((p) => centerScye.add(p));
  centerScye.divideScalar(ringCount);

  const armDir = new THREE.Vector3(sideSign * 0.79, -0.61, 0.035).normalize();
  // Base ortonormal perpendicular al eje del brazo para interpolar hacia un puño circular limpio
  const refUp = new THREE.Vector3(0, 0, 1);
  const basisU = new THREE.Vector3().crossVectors(armDir, refUp).normalize();
  const basisV = new THREE.Vector3().crossVectors(armDir, basisU).normalize();

  const cuffRadius = profile.isCycling ? 0.195 : 0.218;

  const positions = new Float32Array((ringCount + 1) * (lengthSegs + 1) * 3);
  const uvs = new Float32Array((ringCount + 1) * (lengthSegs + 1) * 2);
  const indices = [];

  let pIdx = 0;
  let uIdx = 0;
  const cuffRingPoints = [];

  for (let il = 0; il <= lengthSegs; il++) {
    const vFrac = il / lengthSegs;
    const axisCenter = centerScye.clone().addScaledVector(armDir, vFrac * sleeveLen);
    // Ligera curvatura anatómica de deltoides en el tercio superior
    const deltoidLift = Math.sin(vFrac * Math.PI) * 0.026;
    axisCenter.y += deltoidLift;

    for (let ir = 0; ir <= ringCount; ir++) {
      const basePt = loopPts[ir % ringCount];
      const rel = basePt.clone().sub(centerScye);

      // Ángulo consistente sobre la sección transversal del brazo
      const projU = rel.dot(basisU);
      const projV = rel.dot(basisV);
      const angle = Math.atan2(projV, projU);

      const circlePt = axisCenter
        .clone()
        .addScaledVector(basisU, Math.cos(angle) * cuffRadius)
        .addScaledVector(basisV, Math.sin(angle) * cuffRadius * 0.92);

      const scyeMoved = basePt.clone().addScaledVector(armDir, vFrac * sleeveLen * 0.86);
      const blend = Math.pow(vFrac, 0.72);
      const pos = scyeMoved.lerp(circlePt, blend);

      // Pliegues suaves de manga lejos de la costura de sisa (`vFrac > 0.08`)
      const foldMask = Math.sin(vFrac * Math.PI);
      const fold = Math.sin(angle * 5 + vFrac * 4.0) * 0.0055 * foldMask;
      pos.addScaledVector(basisU, Math.cos(angle) * fold);
      pos.addScaledVector(basisV, Math.sin(angle) * fold);

      positions[pIdx++] = pos.x;
      positions[pIdx++] = pos.y;
      positions[pIdx++] = pos.z;

      uvs[uIdx++] = ir / ringCount;
      uvs[uIdx++] = 1 - vFrac;

      if (il === lengthSegs && ir < ringCount) {
        cuffRingPoints.push(pos.clone());
      }
    }
  }

  // Verificar orientación exterior: `loopPts` recorre Front hacia abajo y Back hacia arriba.
  // En lado izquierdo (+X) vs derecho (-X) invertimos el orden de triángulos según `sideSign` para que `gl_FrontFacing` sea exterior.
  const stride = ringCount + 1;
  for (let il = 0; il < lengthSegs; il++) {
    for (let ir = 0; ir < ringCount; ir++) {
      const a = il * stride + ir;
      const b = a + 1;
      const c = (il + 1) * stride + ir;
      const d = c + 1;

      if (sideSign > 0) {
        indices.push(a, c, b);
        indices.push(b, c, d);
      } else {
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  const sleeveGeo = new THREE.BufferGeometry();
  sleeveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  sleeveGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  sleeveGeo.setIndex(indices);
  sleeveGeo.computeVertexNormals();

  const sleeveMesh = new THREE.Mesh(sleeveGeo, materials.sleeves);
  sleeveMesh.name = partName;
  sleeveMesh.userData = { isDroppable: false, owayoPart: partName };
  sleeveMesh.castShadow = true;
  sleeveMesh.receiveShadow = true;

  // Puño acanalado independiente (`Bandstoff_R-Tex-3`) en el borde de la manga
  const cuffCurve = new THREE.CatmullRomCurve3(cuffRingPoints, true, 'centripetal', 0.4);
  const cuffGeo = new THREE.TubeGeometry(cuffCurve, 60, 0.022, 10, true);
  const cuffMesh = new THREE.Mesh(cuffGeo, materials.accents);
  cuffMesh.name = `${partName}_Cuff`;
  cuffMesh.userData = { isDroppable: false, owayoPart: `${partName}_Cuff` };
  cuffMesh.castShadow = true;

  // Vivo fino sobre la costura de sisa sastre
  const seamCurve = new THREE.CatmullRomCurve3(loopPts, true, 'centripetal', 0.4);
  const seamGeo = new THREE.TubeGeometry(seamCurve, 64, 0.0075, 8, true);
  const seamMesh = new THREE.Mesh(seamGeo, materials.accents);
  seamMesh.name = `${partName}_Seam`;
  seamMesh.userData = { isDroppable: false };

  return [sleeveMesh, cuffMesh, seamMesh];
}

/**
 * Construye la etiqueta interior tejida de nuca (`Etikett`) y el banderín lateral (`EtikettFahne`)
 * exactamente como las sub-mallas 6 y 7 de `222m-Hero.mirl`.
 */
function buildEtikettMeshes(profile, materials) {
  const meshes = [];

  // 6. `Etikett` — Etiqueta interior tejida cosida en la nuca trasera (visible desde el frente a través del escote)
  const backNeckT = profile.getNeckDropT(0, -1) + 0.055;
  const anchorBack = profile.evalPanelPoint(0, backNeckT, -1);

  const etikettGeo = new THREE.PlaneGeometry(0.18, 0.09, 8, 4);
  // Ligera curvatura cóncava acompañando el interior de la nuca
  const posAttr = etikettGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    posAttr.setZ(i, Math.pow(px / 0.09, 2) * 0.012);
  }
  etikettGeo.computeVertexNormals();

  const etikettMat = new THREE.MeshStandardMaterial({
    map: getWovenEtikettTexture(),
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const etikettMesh = new THREE.Mesh(etikettGeo, etikettMat);
  etikettMesh.name = 'Etikett';
  etikettMesh.position.set(anchorBack.x, anchorBack.y, anchorBack.z + 0.012);
  etikettMesh.userData = { isDroppable: false, owayoPart: 'Etikett' };
  meshes.push(etikettMesh);

  // 7. `EtikettFahne` — Banderín tejido de autenticidad en la costura lateral inferior izquierda
  const hipAnchor = profile.evalPanelPoint(1.0, 0.86, +1);
  const fahneGeo = new THREE.BoxGeometry(0.036, 0.068, 0.008);
  const fahneMesh = new THREE.Mesh(fahneGeo, materials.accents);
  fahneMesh.name = 'EtikettFahne';
  fahneMesh.position.set(hipAnchor.x + 0.016, hipAnchor.y, 0);
  fahneMesh.userData = { isDroppable: false, owayoPart: 'EtikettFahne' };
  meshes.push(fahneMesh);

  // Si es maillot de ciclismo (`cycling_aero`), añadir cremallera frontal completa + tirador metálico
  if (profile.isCycling) {
    const zipPoints = [];
    const tTop = profile.getNeckDropT(0, +1);
    for (let i = 0; i <= 28; i++) {
      const t = THREE.MathUtils.lerp(tTop, 0.99, i / 28);
      const p = profile.evalPanelPoint(0, t, +1);
      zipPoints.push(new THREE.Vector3(p.x, p.y, p.z + 0.005));
    }
    const zipCurve = new THREE.CatmullRomCurve3(zipPoints);
    const zipGeo = new THREE.TubeGeometry(zipCurve, 48, 0.006, 6, false);
    const zipMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 });
    const zipMesh = new THREE.Mesh(zipGeo, zipMat);
    zipMesh.name = 'CyclingZipper';
    zipMesh.userData = { isDroppable: false };
    meshes.push(zipMesh);
  }

  return meshes;
}

/**
 * Ensambla el grupo 3D completo de 7 piezas anatómicas (`Front`, `Back`, `Krageneinfass`,
 * `Aermelbandlinks`, `Aermelbandrechts`, `Etikett`, `EtikettFahne`).
 */
export function buildSculptedJerseyGroup(materials, garmentShape = 'jersey_short', collarStyle = 'v-neck') {
  const group = new THREE.Group();
  const profile = createPatternProfile(garmentShape, collarStyle);

  // 1. Pieza `Front` (`isDroppable: true`, mapeada a mitad izquierda del Atlas UV)
  const frontGeo = buildSewnTorsoPanelGeometry(profile, +1, 84, 88);
  const frontMesh = new THREE.Mesh(frontGeo, materials.body);
  frontMesh.name = 'Front';
  frontMesh.userData = { isDroppable: true, panel: 'front', owayoPart: 'Front' };
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;
  group.add(frontMesh);

  // 2. Pieza `Back` (`isDroppable: true`, mapeada a mitad derecha del Atlas UV)
  const backGeo = buildSewnTorsoPanelGeometry(profile, -1, 84, 88);
  const backMesh = new THREE.Mesh(backGeo, materials.body);
  backMesh.name = 'Back';
  backMesh.userData = { isDroppable: true, panel: 'back', owayoPart: 'Back' };
  backMesh.castShadow = true;
  backMesh.receiveShadow = true;
  group.add(backMesh);

  // 3. Pieza `Krageneinfass` (Ribete acanalado 3D de cuello, `isDroppable: false`)
  const collarGeo = buildCollarRibGeometry(profile, collarStyle);
  const collarMesh = new THREE.Mesh(collarGeo, materials.collar);
  collarMesh.name = 'Krageneinfass';
  collarMesh.userData = { isDroppable: false, owayoPart: 'Krageneinfass' };
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  group.add(collarMesh);

  // 4 & 5. Piezas `Aermelbandlinks` (+X) y `Aermelbandrechts` (-X)
  for (const part of buildArmholeOrSleeveParts(profile, +1, materials)) {
    group.add(part);
  }
  for (const part of buildArmholeOrSleeveParts(profile, -1, materials)) {
    group.add(part);
  }

  // 6 & 7. Piezas `Etikett` (Nuca interior) y `EtikettFahne` (Banderín cadera)
  for (const tag of buildEtikettMeshes(profile, materials)) {
    group.add(tag);
  }

  return group;
}
