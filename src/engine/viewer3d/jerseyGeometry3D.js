/**
 * ATLETIQ Engine v3.0 — Geometría 3D Anatómica de Prenda Deportiva con Mapeo UV Exacto
 *
 * Construye una malla 3D esculpida de camiseta atlética en Three.js:
 *  - Torso superelíptico con contorno de pecho, entalle deportivo, caída de pliegues naturales
 *    y mapeo UV libre de efecto espejo (Frente -> u [0.08..0.42], Espalda -> u [0.58..0.92]).
 *  - Mangas izquierda y derecha anguladas con puños independientes (cuffs).
 *  - Cuello tridimensional (V-Neck o Redondo) + forro interior oscuro para realismo desde arriba.
 */

import * as THREE from 'three';

export function buildSculptedJerseyGroup(materials, garmentShape = 'jersey_short', collarStyle = 'v-neck') {
  const group = new THREE.Group();

  const isCycling = garmentShape === 'cycling_aero';
  const radialSegs = 72;
  const heightSegs = 44;
  const torsoHeight = isCycling ? 2.42 : 2.34;
  const topY = 1.15;

  // ================= 1. TORSO PRINCIPAL CON UV PLANAR DUAL =================
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iy = 0; iy <= heightSegs; iy++) {
    const t = iy / heightSegs; // 0 = hombros/cuello, 1 = dobladillo cintura
    const y = topY - t * torsoHeight;

    // Perfil anatómico deportivo (hombros -> pecho -> cintura entallada -> cadera)
    let halfW, halfD;
    if (t < 0.14) {
      const k = t / 0.14;
      halfW = THREE.MathUtils.lerp(0.56, 0.86, Math.sin((k * Math.PI) / 2));
      halfD = THREE.MathUtils.lerp(0.28, 0.42, k);
    } else if (t < 0.36) {
      const k = (t - 0.14) / 0.22;
      halfW = THREE.MathUtils.lerp(0.86, 0.78, k);
      halfD = THREE.MathUtils.lerp(0.42, 0.46, Math.sin(k * Math.PI));
    } else if (t < 0.72) {
      const k = (t - 0.36) / 0.36;
      const waistW = isCycling ? 0.65 : 0.71;
      halfW = THREE.MathUtils.lerp(0.78, waistW, k);
      halfD = THREE.MathUtils.lerp(0.42, 0.36, k);
    } else {
      const k = (t - 0.72) / 0.28;
      const waistW = isCycling ? 0.65 : 0.71;
      const hipW = isCycling ? 0.69 : 0.76;
      halfW = THREE.MathUtils.lerp(waistW, hipW, k);
      halfD = THREE.MathUtils.lerp(0.36, 0.39, k);
    }

    for (let ix = 0; ix <= radialSegs; ix++) {
      const s = ix / radialSegs;
      const phi = s * Math.PI * 2; // 0 = +X, PI/2 = +Z (Frente), PI = -X, 3PI/2 = -Z (Espalda)

      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      // Superelipse suave para dar pecho y espalda planos-curvos realistas (no un tubo rígido)
      const exp = 0.84;
      const sx = Math.sign(cosP) * Math.pow(Math.abs(cosP), exp);
      const sz = Math.sign(sinP) * Math.pow(Math.abs(sinP), exp);

      // Pliegues naturales sutiles de caída textil en torso medio/bajo
      const foldWave =
        Math.sin(phi * 6 + t * 2.2) * 0.012 * Math.sin(t * Math.PI) +
        Math.cos(phi * 10 - t * 3.5) * 0.006 * t;

      let x = sx * halfW * (1 + foldWave);
      let z = sz * halfD * (1 + foldWave * 1.4);

      // Escote del cuello en la parte superior central (t < 0.14)
      let yAdjusted = y;
      if (t < 0.14) {
        const frontDip = sinP > 0 ? Math.pow(sinP, collarStyle === 'v-neck' ? 1.8 : 1.3) * (collarStyle === 'v-neck' ? 0.26 : 0.17) : 0;
        const backDip = sinP < 0 ? Math.pow(-sinP, 1.4) * 0.06 : 0;
        yAdjusted -= (frontDip + backDip) * (1 - t / 0.14);
      }

      positions.push(x, yAdjusted, z);

      // Mapeo UV exacto sin espejo:
      // Frente (sinP >= 0): x normalizado [-1..+1] -> u [0.06 .. 0.44]
      // Espalda (sinP < 0): +x.. -x -> u [0.56 .. 0.94] para lectura natural izq->der
      const normX = Math.max(-1, Math.min(1, cosP));
      let u;
      if (sinP >= 0) {
        u = 0.25 + normX * 0.19;
      } else {
        u = 0.75 - normX * 0.19;
      }
      const v = 0.92 - t * 0.82;
      uvs.push(u, v);
    }
  }

  const rowStride = radialSegs + 1;
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * rowStride + ix;
      const b = a + 1;
      const c = (iy + 1) * rowStride + ix;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const torsoGeo = new THREE.BufferGeometry();
  torsoGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  torsoGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  torsoGeo.setIndex(indices);
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, materials.body);
  torsoMesh.name = 'torso';
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  group.add(torsoMesh);

  // Forro oscuro interior en abertura de cuello para realismo de cámara elevada
  const innerNeckGeo = new THREE.CylinderGeometry(0.39, 0.45, 0.26, 36, 1, true);
  const innerNeckMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.9,
    side: THREE.BackSide,
  });
  const innerNeck = new THREE.Mesh(innerNeckGeo, innerNeckMat);
  innerNeck.position.set(0, topY - 0.11, 0);
  group.add(innerNeck);

  // ================= 2. MANGAS ATLÉTICAS IZQUIERDA Y DERECHA + PUÑOS =================
  const buildSleeve = (sideSign) => {
    const sleeveGroup = new THREE.Group();
    const len = isCycling ? 0.92 : 0.78;
    const sleeveGeo = new THREE.CylinderGeometry(0.285, 0.225, len, 36, 12, true);
    sleeveGeo.scale(1.0, 1.0, 0.88);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, materials.sleeves);
    sleeveMesh.castShadow = true;
    sleeveGroup.add(sleeveMesh);

    // Puño de contraste (Cuff Trim)
    const cuffGeo = new THREE.CylinderGeometry(0.23, 0.222, 0.085, 36, 1, false);
    cuffGeo.scale(1.0, 1.0, 0.88);
    const cuffMesh = new THREE.Mesh(cuffGeo, materials.accents);
    cuffMesh.position.y = -len / 2 - 0.02;
    sleeveGroup.add(cuffMesh);

    sleeveGroup.position.set(sideSign * 0.95, topY - 0.42, 0.01);
    sleeveGroup.rotation.z = sideSign * (Math.PI / 3.15);
    return sleeveGroup;
  };

  group.add(buildSleeve(-1));
  group.add(buildSleeve(1));

  // ================= 3. CUELLO ESCULPIDO 3D (V-NECK O REDONDO) =================
  const collarPoints = [];
  const collarSegs = 56;
  for (let i = 0; i <= collarSegs; i++) {
    const phi = (i / collarSegs) * Math.PI * 2;
    const cx = Math.cos(phi) * 0.43;
    const cz = Math.sin(phi) * 0.245;
    const frontDrop =
      Math.sin(phi) > 0
        ? Math.pow(Math.sin(phi), collarStyle === 'v-neck' ? 1.9 : 1.3) *
          (collarStyle === 'v-neck' ? 0.24 : 0.14)
        : Math.pow(-Math.sin(phi), 1.4) * 0.04;
    collarPoints.push(new THREE.Vector3(cx, topY - 0.01 - frontDrop, cz));
  }
  const collarCurve = new THREE.CatmullRomCurve3(collarPoints, true);
  const collarGeo = new THREE.TubeGeometry(collarCurve, 64, 0.042, 12, true);
  const collarMesh = new THREE.Mesh(collarGeo, materials.collar);
  collarMesh.castShadow = true;
  group.add(collarMesh);

  return group;
}
