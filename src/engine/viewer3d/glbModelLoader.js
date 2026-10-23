/**
 * ATLETIQ Engine v3.0 — Cargador Industrial GLB / GLTF / DRACO + Inspector de Sub-Mallas y UV
 *
 * Prepara el visor 3D para recibir modelos reales (.glb / .gltf confeccionados en CLO3D,
 * Marvelous Designer o Blender) e inspeccionar automáticamente:
 *  - Nombres de sub-mallas (ej. front, back, sleeve_l, sleeve_r, collar, cuffs, stitches).
 *  - Canales UV (uv0 para patrón/albedo dinámico, uv1 para Ambient Occlusion horneado).
 *  - Normalización automática de escala y centrado en el origen de cámara (0, 0, 0).
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let sharedLoader = null;

function getGLTFLoader() {
  if (sharedLoader) return sharedLoader;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  sharedLoader = loader;
  return loader;
}

/**
 * Carga un archivo `.glb` / `.gltf` desde URL o Blob local, normaliza su escala/centro,
 * extrae el manifiesto de piezas (sub-meshes) y vincula materiales PBR dinámicos.
 */
export async function loadAndBindGarmentGLB(urlOrBlobUrl, dynamicMaterials = {}) {
  const loader = getGLTFLoader();
  const gltf = await loader.loadAsync(urlOrBlobUrl);
  const root = gltf.scene || gltf.scenes[0];

  // Auto-centrar y escalar a altura estándar de estudio (2.4 unidades)
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetHeight = 2.4;
  const scaleFactor = targetHeight / maxDim;

  root.position.sub(center);
  const wrapper = new THREE.Group();
  wrapper.scale.setScalar(scaleFactor);
  wrapper.add(root);

  const meshManifest = [];

  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;

    const lowerName = (node.name || '').toLowerCase();
    const matName = (node.material?.name || '').toLowerCase();
    const tag = `${lowerName} ${matName}`;

    // Preservar mapa AO horneado original del artista 3D si existe
    const bakedAoMap = node.material?.aoMap || null;
    const bakedNormalMap = node.material?.normalMap || null;

    let assignedZone = 'body';
    if (/collar|neck|cuello/.test(tag)) {
      assignedZone = 'collar';
    } else if (/cuff|trim|ribete|puno/.test(tag)) {
      assignedZone = 'accents';
    } else if (/sleeve|manga/.test(tag)) {
      assignedZone = 'sleeves';
    } else if (/stitch|costura|seam/.test(tag)) {
      assignedZone = 'stitches';
    }

    if (dynamicMaterials[assignedZone]) {
      const clonedMat = dynamicMaterials[assignedZone].clone();
      if (bakedAoMap) {
        clonedMat.aoMap = bakedAoMap;
        clonedMat.aoMapIntensity = 1.0;
      }
      if (bakedNormalMap && !clonedMat.normalMap) {
        clonedMat.normalMap = bakedNormalMap;
      }
      node.material = clonedMat;
    }

    meshManifest.push({
      meshName: node.name || 'unnamed_mesh',
      materialName: node.material?.name || 'default',
      assignedZone,
      vertexCount: node.geometry?.attributes?.position?.count || 0,
      hasUV0: Boolean(node.geometry?.attributes?.uv),
      hasUV1_AO: Boolean(node.geometry?.attributes?.uv1),
    });
  });

  return {
    modelGroup: wrapper,
    meshManifest,
    originalDimensions: { x: +size.x.toFixed(3), y: +size.y.toFixed(3), z: +size.z.toFixed(3) },
  };
}
