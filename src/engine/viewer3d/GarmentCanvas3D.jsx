import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Undo2,
  Redo2,
  Pin,
  PinOff,
  Trash2,
  AlignCenterVertical,
  Copy,
  Minus,
  Plus,
} from 'lucide-react';
import {
  loadMirlModelTemplate,
  instantiateMirlGarmentGroup,
  buildNeckLabelCanvasTexture,
} from './mirlModelLoader';
import {
  loadFishDesignMasks,
  resolveActiveFishDesignMeta,
  composeGarmentPartCanvas,
} from '../compositor/fishPartCompositor';
import { FABRIC_WEAVES, ENGINE_PRODUCTS } from '../core/designStore';
import {
  getPartSpec,
  evaluateDecalPlacement,
  isShortsProduct,
  snapRotationAngle,
} from '../core/boundingBoxMath';

// Lente teleobjetivo exacto de retrato Owayo v6 (`CAMERA_STANDARD_FOV = 30` en viewer-CmBNa226.js)
export const CAMERA_STANDARD_FOV = 30;

export const CAMERA_PRESETS = {
  front: { pos: [0, 0.04, 5.45], target: [0, 0.0, 0] },
  three_quarter: { pos: [2.25, 0.32, 5.0], target: [0, 0.0, 0] },
  back: { pos: [0, 0.04, -5.45], target: [0, 0.0, 0] },
  left_sleeve: { pos: [4.25, 0.46, 1.55], target: [0.62, 0.38, 0] },
  right_sleeve: { pos: [-4.25, 0.46, 1.55], target: [-0.62, 0.38, 0] },
  right_leg: { pos: [-3.95, 0.12, 2.75], target: [-0.42, -0.04, 0] },
  left_leg: { pos: [3.95, 0.12, 2.75], target: [0.42, -0.04, 0] },
  interior_tag: { pos: [0, 0.92, 2.35], target: [0, 0.62, -0.18] },
  macro_weave: { pos: [0.52, 0.42, 2.05], target: [0.22, 0.35, 0.25] },
};

const ALL_POSSIBLE_MESH_PARTS = [
  'Front',
  'Back',
  'LeftArm',
  'RightArm',
  'RightLeg',
  'LeftLeg',
  'Collar',
  'Krageneinfass',
  'Aermelbandlinks',
  'Aermelbandrechts',
];

const PANEL_TO_PARTNAME = {
  front: 'Front',
  back: 'Back',
  left_arm: 'LeftArm',
  right_arm: 'RightArm',
  right_leg: 'RightLeg',
  left_leg: 'LeftLeg',
  collar: 'Collar',
};

/**
 * Inyecta la regla óptica real de sublimación textil interior (`innenseiteAufhellen` de Owayo v6):
 * El poliéster técnico blanco muestra penetración parcial (~38%) en la cara interior (`!gl_FrontFacing`).
 */
function applyOwayoInnerSublimationShader(material, keySuffix) {
  material.customProgramCacheKey = () => `owayo_v5_inner_sublimation_${keySuffix}`;
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      if (!gl_FrontFacing) {
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.96, 0.98), 0.62);
      }`
    );
  };
}

const bumpTextureCache = new Map();
function getOrLoadRealBumpTexture(url, repeatX = 48, repeatY = 48) {
  const key = `${url}|${repeatX}|${repeatY}`;
  if (bumpTextureCache.has(key)) return bumpTextureCache.get(key);
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  bumpTextureCache.set(key, tex);
  return tex;
}

const VARIABLE_SLOT_LABELS = {
  playerNameBack: 'Nombre Jugador (Espalda)',
  playerNumberBack: 'Dorsal Trasero',
  playerNumberFront: 'Número Frontal',
  playerNumberSleeve: 'Número Manga',
  playerNumberShorts: 'Número Pierna Short',
};

export default function GarmentCanvas3D({
  design,
  activePlayer,
  artworkRegistry,
  cameraPreset = 'three_quarter',
  onChangeCameraPreset,
  autoRotate = false,
  selectedDecalId = null,
  selectedSlotKey = null,
  onSelectDecalFrom3D,
  onSelectSlotFrom3D,
  onUpdateDecalFrom3D,
  onUpdateSlotFrom3D,
  onDeleteDecalFrom3D,
  onMirrorDecalFrom3D,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  canvasSnapshotRef,
}) {
  const stageWrapperRef = useRef(null);
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);
  const fishMasksRef = useRef(null);
  const activeMeshPartNamesRef = useRef(ALL_POSSIBLE_MESH_PARTS);
  const holdTurnRafRef = useRef(null);
  const lastDragPanelRef = useRef(null);

  const latestPropsRef = useRef({
    design,
    activePlayer,
    artworkRegistry,
    selectedDecalId,
    selectedSlotKey,
    onSelectDecalFrom3D,
    onSelectSlotFrom3D,
    onUpdateDecalFrom3D,
    onUpdateSlotFrom3D,
  });

  const dragSessionRef = useRef(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [hoveringObjectLabel, setHoveringObjectLabel] = useState(null);
  const [active3DOverlay, setActive3DOverlay] = useState(null);
  const [modelStats, setModelStats] = useState({ loading: true, vertices: 0, faces: 0 });
  const [fishVersionTick, setFishVersionTick] = useState(0);

  latestPropsRef.current = {
    design,
    activePlayer,
    artworkRegistry,
    selectedDecalId,
    selectedSlotKey,
    onSelectDecalFrom3D,
    onSelectSlotFrom3D,
    onUpdateDecalFrom3D,
    onUpdateSlotFrom3D,
  };

  const isShorts = isShortsProduct(design.productModelId);

  const commitClampedDecalPosition = (decal, rawXmm, rawYmm, enableSnap = true, recordUndo = false) => {
    const curDesign = latestPropsRef.current.design;
    const candidate = {
      ...decal,
      centerMm: { x: rawXmm, y: rawYmm },
    };
    const evaluated = evaluateDecalPlacement(
      candidate,
      curDesign.productModelId,
      enableSnap,
      curDesign.bleedEnforcement || 'SOFT_WARN'
    );
    const finalCenterMm =
      curDesign.bleedEnforcement === 'HARD_CLAMP'
        ? evaluated.clampedSafeCenterMm
        : evaluated.snappedCenterMm;

    latestPropsRef.current.onUpdateDecalFrom3D?.(
      decal.id,
      {
        centerMm: {
          x: Math.round(finalCenterMm.x * 10) / 10,
          y: Math.round(finalCenterMm.y * 10) / 10,
        },
      },
      recordUndo
    );
    return evaluated;
  };

  const commitSlotPosition = (slotKey, slotObj, panel, rawXmm, rawYmm, enableSnap = true, recordUndo = false) => {
    const curDesign = latestPropsRef.current.design;
    const spec = getPartSpec(curDesign.productModelId, panel);
    const snapAxesU =
      Array.isArray(spec.snapAxesU) && spec.snapAxesU.length > 0 ? spec.snapAxesU : [spec.snapCenterU ?? 0.5];

    let snappedX = Math.max(24, Math.min(spec.widthMm - 24, rawXmm));
    let snappedY = Math.max(24, Math.min(spec.heightMm - spec.sperrbezirkMm - 12, rawYmm));
    let verticalCenter = false;
    let snapCenterX = spec.snapCenterU * spec.widthMm;

    if (enableSnap) {
      let bestDist = Infinity;
      for (const axisU of snapAxesU) {
        const axMm = axisU * spec.widthMm;
        const d = Math.abs(snappedX - axMm);
        if (d < bestDist) {
          bestDist = d;
          snapCenterX = axMm;
        }
      }
      if (bestDist <= 11) {
        snappedX = snapCenterX;
        verticalCenter = true;
      }
    }

    latestPropsRef.current.onUpdateSlotFrom3D?.(
      slotKey,
      {
        ...slotObj,
        centerMm: {
          x: Math.round(snappedX * 10) / 10,
          y: Math.round(snappedY * 10) / 10,
        },
      },
      recordUndo
    );

    return {
      snapGuides: {
        verticalCenter,
        snapCenterX,
        horizontalChest: false,
        horizontalSponsor: false,
      },
    };
  };

  // Raycast UV multi-pieza real sobre camisetas (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`) y shorts (`RightLeg`, `LeftLeg`)
  const raycastDroppableUV = (clientX, clientY, restrictToPanel = null) => {
    const st = sceneStateRef.current;
    const container = mountRef.current;
    if (!st || !container) return null;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, st.camera);
    const hits = raycaster.intersectObjects(st.jerseyContainer.children, true);

    const validHit = hits.find((h) => {
      if (!h.object?.userData?.isDroppable || !h.uv) return false;
      const hitPanel = h.object.userData.panel;
      if (!hitPanel) return false;
      if (restrictToPanel && hitPanel !== restrictToPanel) return false;
      return true;
    });

    if (!validHit) return null;

    const panel = validHit.object.userData.panel;
    const spec = getPartSpec(latestPropsRef.current.design.productModelId, panel);
    const { x: u, y: v } = validHit.uv;
    const xMm = u * spec.widthMm;
    const yMm = (1 - v) * spec.heightMm;

    return { panel, partName: validHit.object.userData.partName, xMm, yMm, spec };
  };

  const findObjectAtMm = (curDesign, panel, xMm, yMm) => {
    // 1. Revisar primero Decals (PNG, SVG, Escudos y Textos estáticos) ordenados por zIndex descendente
    const matchingDecals = (curDesign.decals || [])
      .filter((d) => (d.panel || 'front') === panel)
      .slice()
      .sort((a, b) => (b.zIndex ?? 10) - (a.zIndex ?? 10));

    for (const d of matchingDecals) {
      const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 14;
      const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 14;
      if (Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh) {
        return { kind: 'decal', decal: d, label: d.label, pinned: Boolean(d.pinned) };
      }
    }

    // 2. Revisar Slots variables del Roster (`einzelexemplare`) activos en esta pieza
    const slots = curDesign.variableSlots || {};
    const slotCandidates = [];
    if (panel === 'back') {
      if (slots.playerNameBack?.enabled) {
        slotCandidates.push({
          key: 'playerNameBack',
          slot: slots.playerNameBack,
          hw: (slots.playerNameBack.maxWidthMm || 260) / 2,
          hh: (slots.playerNameBack.capHeightMm || 52) * 0.68,
        });
      }
      if (slots.playerNumberBack?.enabled) {
        const h = slots.playerNumberBack.heightMm || 220;
        slotCandidates.push({
          key: 'playerNumberBack',
          slot: slots.playerNumberBack,
          hw: h * 0.45,
          hh: h * 0.48,
        });
      }
    } else if (panel === 'front' && slots.playerNumberFront?.enabled) {
      const h = slots.playerNumberFront.heightMm || 50;
      slotCandidates.push({
        key: 'playerNumberFront',
        slot: slots.playerNumberFront,
        hw: h * 0.65,
        hh: h * 0.58,
      });
    } else if (slots.playerNumberSleeve?.enabled && slots.playerNumberSleeve.panel === panel) {
      const h = slots.playerNumberSleeve.heightMm || 44;
      slotCandidates.push({
        key: 'playerNumberSleeve',
        slot: slots.playerNumberSleeve,
        hw: h * 0.65,
        hh: h * 0.58,
      });
    } else if (slots.playerNumberShorts?.enabled && slots.playerNumberShorts.panel === panel) {
      const h = slots.playerNumberShorts.heightMm || 68;
      slotCandidates.push({
        key: 'playerNumberShorts',
        slot: slots.playerNumberShorts,
        hw: h * 0.65,
        hh: h * 0.58,
      });
    }

    for (const c of slotCandidates) {
      if (
        Math.abs(xMm - c.slot.centerMm.x) <= c.hw + 12 &&
        Math.abs(yMm - c.slot.centerMm.y) <= c.hh + 12
      ) {
        return {
          kind: 'slot',
          slotKey: c.key,
          slot: c.slot,
          label: VARIABLE_SLOT_LABELS[c.key] || c.key,
          pinned: Boolean(c.slot.pinned),
        };
      }
    }

    return null;
  };

  // Controles flotantes `#toolbox` de Owayo (Zoom +/- y Rotación continua al mantener pulsado)
  const handleToolboxZoom = (factor) => {
    const st = sceneStateRef.current;
    if (!st) return;
    st.setTransition(false);
    const offset = st.camera.position.clone().sub(st.controls.target);
    const nextLen = Math.max(st.controls.minDistance, Math.min(st.controls.maxDistance, offset.length() * factor));
    offset.setLength(nextLen);
    st.camera.position.copy(st.controls.target).add(offset);
    st.controls.update();
  };

  const startHoldOrbitTurn = (dirSign) => {
    stopHoldOrbitTurn();
    const stepTurn = () => {
      const st = sceneStateRef.current;
      if (!st) return;
      st.setTransition(false);
      const offset = st.camera.position.clone().sub(st.controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), dirSign * 0.042);
      st.camera.position.copy(st.controls.target).add(offset);
      st.controls.update();
      holdTurnRafRef.current = requestAnimationFrame(stepTurn);
    };
    holdTurnRafRef.current = requestAnimationFrame(stepTurn);
  };

  const stopHoldOrbitTurn = () => {
    if (holdTurnRafRef.current !== null) {
      cancelAnimationFrame(holdTurnRafRef.current);
      holdTurnRafRef.current = null;
    }
  };

  // 1. Inicializar motor WebGL Three.js con FOV=30° (Owayo Standard) y materiales por pieza
  useEffect(() => {
    const container = mountRef.current;
    const stageEl = stageWrapperRef.current;
    if (!container || !stageEl) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      CAMERA_STANDARD_FOV,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      60
    );
    camera.position.set(...CAMERA_PRESETS.three_quarter.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    if (canvasSnapshotRef) {
      canvasSnapshotRef.current = renderer.domElement;
    }

    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.08);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(2.9, 3.9, 4.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.88);
    fillLight.position.set(-3.5, 1.6, 3.2);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0xfef3c7, 1.35);
    backRimLight.position.set(0.3, 2.8, -4.6);
    scene.add(backRimLight);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.52)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 1.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -1.44;
    scene.add(floorShadow);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const partCanvases = {};
    const partTextures = {};
    const partMaterials = {};

    const ribBumpTex = getOrLoadRealBumpTexture('/fabrics/bandstoff-rtex3.png', 28, 12);

    for (const partName of ALL_POSSIBLE_MESH_PARTS) {
      const c = document.createElement('canvas');
      const isLargeBodyOrLeg =
        partName === 'Front' ||
        partName === 'Back' ||
        partName === 'RightLeg' ||
        partName === 'LeftLeg';
      c.width = isLargeBodyOrLeg ? 1536 : 1024;
      c.height = isLargeBodyOrLeg
        ? 1536
        : partName === 'LeftArm' || partName === 'RightArm'
        ? 512
        : 128;
      partCanvases[partName] = c;

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      partTextures[partName] = tex;

      const isRibTrim =
        partName === 'Collar' ||
        partName === 'Krageneinfass' ||
        partName === 'Aermelbandlinks' ||
        partName === 'Aermelbandrechts';

      const mat = new THREE.MeshPhysicalMaterial({
        map: tex,
        bumpMap: isRibTrim ? ribBumpTex : null,
        bumpScale: isRibTrim ? 0.008 : 0.006,
        roughness: isRibTrim ? 0.64 : 0.54,
        metalness: 0.02,
        sheen: 0.28,
        sheenRoughness: 0.56,
        sheenColor: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
      });
      applyOwayoInnerSublimationShader(mat, partName);
      partMaterials[partName] = mat;
    }

    const neckLabelTex = buildNeckLabelCanvasTexture(activePlayer?.size || 'L');
    const neckLabelMat = new THREE.MeshStandardMaterial({
      map: neckLabelTex,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const hemFlagMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    const jerseyContainer = new THREE.Group();
    scene.add(jerseyContainer);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.enablePan = false;
    controls.minDistance = 1.65;
    controls.maxDistance = 8.4;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = Math.PI * 0.12;

    const targetCamPos = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.pos);
    const targetLookAt = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.target);
    let isTransitioningCam = false;

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      floorShadow,
      partCanvases,
      partTextures,
      partMaterials,
      neckLabelMat,
      hemFlagMat,
      jerseyContainer,
      targetCamPos,
      targetLookAt,
      setTransition: (v) => {
        isTransitioningCam = v;
      },
    };

    const onControlStart = () => {
      isTransitioningCam = false;
    };
    controls.addEventListener('start', onControlStart);

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width === 0 || rect.height === 0) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    });
    ro.observe(container);

    let rafId = null;
    let isLoopRunning = false;

    const animate = () => {
      if (!isLoopRunning) return;
      rafId = requestAnimationFrame(animate);
      if (isTransitioningCam) {
        camera.position.lerp(targetCamPos, 0.12);
        controls.target.lerp(targetLookAt, 0.12);
        if (camera.position.distanceTo(targetCamPos) < 0.015) {
          isTransitioningCam = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };

    const startRenderLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId = requestAnimationFrame(animate);
      }
    };

    const stopRenderLoop = () => {
      isLoopRunning = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    startRenderLoop();

    const handleContentVisibilityChange = (event) => {
      if (event.skipped) stopRenderLoop();
      else startRenderLoop();
    };
    stageEl.addEventListener('contentvisibilityautostatechange', handleContentVisibilityChange);

    let ioFallback = null;
    const isContentVisibilitySupported = 'contentVisibility' in document.documentElement.style;
    if (!isContentVisibilitySupported && typeof IntersectionObserver !== 'undefined') {
      ioFallback = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startRenderLoop();
            else stopRenderLoop();
          });
        },
        { rootMargin: '200px' }
      );
      ioFallback.observe(stageEl);
    }

    return () => {
      stopHoldOrbitTurn();
      stopRenderLoop();
      stageEl.removeEventListener('contentvisibilityautostatechange', handleContentVisibilityChange);
      if (ioFallback) ioFallback.disconnect();
      ro.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      Object.values(partTextures).forEach((t) => t.dispose());
      Object.values(partMaterials).forEach((m) => m.dispose());
      neckLabelTex.dispose();
      neckLabelMat.dispose();
      hemFlagMat.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Cargar geometría binaria exacta `.mirl` cuando cambia la prenda activa (Camiseta o Short)
  useEffect(() => {
    let cancelled = false;
    const st = sceneStateRef.current;
    if (!st) return;

    const prod = ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];
    const mirlUrl = prod.mirlUrl || '/models/football_f3_ka.mirl';

    setModelStats((prev) => ({ ...prev, loading: true }));

    loadMirlModelTemplate(mirlUrl)
      .then((template) => {
        if (cancelled || !sceneStateRef.current) return;
        const curSt = sceneStateRef.current;
        while (curSt.jerseyContainer.children.length > 0) {
          curSt.jerseyContainer.remove(curSt.jerseyContainer.children[0]);
        }
        const group = instantiateMirlGarmentGroup(
          template,
          curSt.partMaterials,
          curSt.neckLabelMat,
          curSt.hemFlagMat
        );
        curSt.jerseyContainer.add(group);

        // Registrar únicamente las piezas presentes en este modelo `.mirl` para optimizar el compositor GPU
        const presentNames = template.parts
          .map((p) => p.name)
          .filter((n) => ALL_POSSIBLE_MESH_PARTS.includes(n));
        activeMeshPartNamesRef.current = presentNames.length > 0 ? presentNames : ALL_POSSIBLE_MESH_PARTS;

        // Ajustar altura de la sombra de contacto según la altura escalada de la prenda
        if (curSt.floorShadow) {
          curSt.floorShadow.position.y = -(template.dimensions.y / 2) - 0.14;
        }

        setModelStats({
          loading: false,
          vertices: template.totalVertices,
          faces: template.totalFaces,
        });
        setFishVersionTick((n) => n + 1);
      })
      .catch((err) => {
        console.error('Error cargando malla .mirl:', err);
        if (!cancelled) setModelStats({ loading: false, vertices: 0, faces: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [design.productModelId]);

  // 3. Cargar archivo de máscaras `.fish` (o limpiar máscaras para diseño liso `Pure`)
  useEffect(() => {
    let cancelled = false;
    const activeFish = resolveActiveFishDesignMeta(design);
    if (!activeFish?.fileUrl) {
      fishMasksRef.current = null;
      setFishVersionTick((n) => n + 1);
      return;
    }

    loadFishDesignMasks(activeFish.fileUrl)
      .then((masksMap) => {
        if (cancelled) return;
        fishMasksRef.current = masksMap;
        setFishVersionTick((n) => n + 1);
      })
      .catch((err) => {
        console.error('Error decodificando diseño .fish:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [design.productModelId, design.patternId]);

  // 4. Actualizar micro-relieve textil real (`ts-tex.png` / `k-tex2.png` / `sr-tex.png` / `bandstoff-rtex3.png`)
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    const weave = FABRIC_WEAVES.find((w) => w.id === design.fabricWeaveId) || FABRIC_WEAVES[0];
    const bumpTex = getOrLoadRealBumpTexture(weave.bumpUrl || '/fabrics/ts-tex.png', weave.uvRepeat, weave.uvRepeat);

    ['Front', 'Back', 'LeftArm', 'RightArm', 'RightLeg', 'LeftLeg'].forEach((partName) => {
      const mat = st.partMaterials[partName];
      if (!mat) return;
      mat.bumpMap = bumpTex;
      mat.bumpScale = Math.abs(weave.bumpScale || 0.005) * 1.4;
      mat.roughness = weave.roughness;
      mat.needsUpdate = true;
    });
  }, [design.fabricWeaveId]);

  // 5. Actualizar etiqueta interior de talla (`Etikett`) cuando cambia el jugador activo
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st?.neckLabelMat) return;
    const prevMap = st.neckLabelMat.map;
    const nextTex = buildNeckLabelCanvasTexture(activePlayer?.size || 'L');
    st.neckLabelMat.map = nextTex;
    st.neckLabelMat.needsUpdate = true;
    if (prevMap) prevMap.dispose();
  }, [activePlayer?.size]);

  // 6. Re-componer texturas por pieza a 60 FPS (durante arrastre solo repinta la pieza activa en < 1 ms)
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    const masksMap = fishMasksRef.current;
    let partsToUpdate = activeMeshPartNamesRef.current;

    if (active3DOverlay?.panel) {
      const singlePart = PANEL_TO_PARTNAME[active3DOverlay.panel];
      if (singlePart && partsToUpdate.includes(singlePart)) {
        partsToUpdate = [singlePart];
        lastDragPanelRef.current = singlePart;
      }
    } else if (lastDragPanelRef.current) {
      lastDragPanelRef.current = null;
    }

    for (const partName of partsToUpdate) {
      const canvas = st.partCanvases[partName];
      const tex = st.partTextures[partName];
      if (!canvas || !tex) continue;

      composeGarmentPartCanvas(
        canvas,
        partName,
        design,
        activePlayer,
        artworkRegistry,
        masksMap,
        active3DOverlay
          ? {
              showGuides: true,
              showSelectionBox: true,
              panel: active3DOverlay.panel,
              selectedDecalId: active3DOverlay.selectedDecalId,
              selectedSlotKey: active3DOverlay.selectedSlotKey,
              snapGuides: active3DOverlay.snapGuides,
            }
          : selectedDecalId || selectedSlotKey
          ? {
              showGuides: false,
              showSelectionBox: true,
              panel: null,
              selectedDecalId,
              selectedSlotKey,
              snapGuides: null,
            }
          : null
      );
      tex.needsUpdate = true;
    }
  }, [
    design,
    activePlayer,
    artworkRegistry,
    active3DOverlay,
    selectedDecalId,
    selectedSlotKey,
    fishVersionTick,
  ]);

  // 7. Presets de cámara y auto-rotación
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    st.controls.autoRotate = Boolean(autoRotate) && !isDraggingObject;
    st.controls.autoRotateSpeed = 1.5;
  }, [autoRotate, isDraggingObject]);

  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.three_quarter;
    st.targetCamPos.set(...preset.pos);
    st.targetLookAt.set(...preset.target);
    st.setTransition(true);
  }, [cameraPreset]);

  // 8. Selección y Arrastre Directo Raycast UV a 60 FPS (Decals + Slots Variables + Respeto a `Fijar objeto`)
  const handlePointerDown = (e) => {
    if (e.button !== 0 || !sceneStateRef.current) return;

    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) return;

    const found = findObjectAtMm(design, hit.panel, hit.xMm, hit.yMm);
    if (!found) return;

    if (found.kind === 'decal') {
      onSelectDecalFrom3D?.(found.decal.id, hit.panel);
      if (found.pinned || !onUpdateDecalFrom3D) return;

      sceneStateRef.current.controls.enabled = false;
      dragSessionRef.current = {
        pointerId: e.pointerId,
        kind: 'decal',
        decalId: found.decal.id,
        panel: hit.panel,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMovedThreshold: false,
        lastXmm: found.decal.centerMm.x,
        lastYmm: found.decal.centerMm.y,
        grabOffsetMm: {
          x: hit.xMm - found.decal.centerMm.x,
          y: hit.yMm - found.decal.centerMm.y,
        },
      };

      e.currentTarget.setPointerCapture(e.pointerId);
      setActive3DOverlay({
        panel: hit.panel,
        selectedDecalId: found.decal.id,
        selectedSlotKey: null,
        snapGuides: null,
      });
    } else if (found.kind === 'slot') {
      onSelectSlotFrom3D?.(found.slotKey, hit.panel);
      if (found.pinned || !onUpdateSlotFrom3D) return;

      sceneStateRef.current.controls.enabled = false;
      dragSessionRef.current = {
        pointerId: e.pointerId,
        kind: 'slot',
        slotKey: found.slotKey,
        panel: hit.panel,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMovedThreshold: false,
        lastXmm: found.slot.centerMm.x,
        lastYmm: found.slot.centerMm.y,
        grabOffsetMm: {
          x: hit.xMm - found.slot.centerMm.x,
          y: hit.yMm - found.slot.centerMm.y,
        },
      };

      e.currentTarget.setPointerCapture(e.pointerId);
      setActive3DOverlay({
        panel: hit.panel,
        selectedDecalId: null,
        selectedSlotKey: found.slotKey,
        snapGuides: null,
      });
    }
  };

  const handlePointerMove = (e) => {
    const session = dragSessionRef.current;
    if (session && e.currentTarget.hasPointerCapture(e.pointerId)) {
      const distPx = Math.hypot(e.clientX - session.startClientX, e.clientY - session.startClientY);
      if (!session.hasMovedThreshold && distPx < 4) return;
      if (!session.hasMovedThreshold) {
        session.hasMovedThreshold = true;
        setIsDraggingObject(true);
      }

      const hit = raycastDroppableUV(e.clientX, e.clientY, session.panel);
      if (!hit) return;

      const rawX = hit.xMm - session.grabOffsetMm.x;
      const rawY = hit.yMm - session.grabOffsetMm.y;
      session.lastXmm = rawX;
      session.lastYmm = rawY;

      if (session.kind === 'decal') {
        const curDecal = (latestPropsRef.current.design.decals || []).find((d) => d.id === session.decalId);
        if (!curDecal) return;
        const evaluated = commitClampedDecalPosition(curDecal, rawX, rawY, true, false);
        setActive3DOverlay({
          panel: session.panel,
          selectedDecalId: session.decalId,
          selectedSlotKey: null,
          snapGuides: evaluated.snapGuides,
        });
      } else if (session.kind === 'slot') {
        const curSlot = latestPropsRef.current.design.variableSlots?.[session.slotKey];
        if (!curSlot) return;
        const evaluated = commitSlotPosition(session.slotKey, curSlot, session.panel, rawX, rawY, true, false);
        setActive3DOverlay({
          panel: session.panel,
          selectedDecalId: null,
          selectedSlotKey: session.slotKey,
          snapGuides: evaluated.snapGuides,
        });
      }
      return;
    }

    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) {
      if (hoveringObjectLabel) setHoveringObjectLabel(null);
      return;
    }
    const hovered = findObjectAtMm(design, hit.panel, hit.xMm, hit.yMm);
    const nextLabel = hovered
      ? `${hovered.pinned ? '📌 ' : ''}${hovered.label} (${hit.spec.shortLabel})`
      : null;
    if (nextLabel !== hoveringObjectLabel) {
      setHoveringObjectLabel(nextLabel);
    }
  };

  const endPointerDragSession = () => {
    const session = dragSessionRef.current;
    if (session?.hasMovedThreshold) {
      if (session.kind === 'decal') {
        const curDecal = (latestPropsRef.current.design.decals || []).find((d) => d.id === session.decalId);
        if (curDecal) {
          commitClampedDecalPosition(curDecal, session.lastXmm, session.lastYmm, true, true);
        }
      } else if (session.kind === 'slot') {
        const curSlot = latestPropsRef.current.design.variableSlots?.[session.slotKey];
        if (curSlot) {
          commitSlotPosition(session.slotKey, curSlot, session.panel, session.lastXmm, session.lastYmm, true, true);
        }
      }
    }

    if (sceneStateRef.current) {
      sceneStateRef.current.controls.enabled = true;
    }
    dragSessionRef.current = null;
    setIsDraggingObject(false);
    setActive3DOverlay(null);
  };

  const handleKeyDown = (e) => {
    const stepMap = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const dir = stepMap[e.key];
    if (!dir) return;

    const stepMm = e.shiftKey ? 1 : 5;
    if (selectedSlotKey && design.variableSlots?.[selectedSlotKey]) {
      const slot = design.variableSlots[selectedSlotKey];
      if (slot.pinned) return;
      e.preventDefault();
      const slotPanel =
        selectedSlotKey === 'playerNameBack' || selectedSlotKey === 'playerNumberBack'
          ? 'back'
          : selectedSlotKey === 'playerNumberFront'
          ? 'front'
          : slot.panel || 'front';
      commitSlotPosition(
        selectedSlotKey,
        slot,
        slotPanel,
        slot.centerMm.x + dir[0] * stepMm,
        slot.centerMm.y + dir[1] * stepMm,
        false,
        true
      );
      return;
    }

    const activeDecal = (design.decals || []).find((d) => d.id === selectedDecalId);
    if (!activeDecal || activeDecal.pinned || !onUpdateDecalFrom3D) return;

    e.preventDefault();
    commitClampedDecalPosition(
      activeDecal,
      activeDecal.centerMm.x + dir[0] * stepMm,
      activeDecal.centerMm.y + dir[1] * stepMm,
      false,
      true
    );
  };

  const activeSelectedDecal = selectedDecalId
    ? (design.decals || []).find((d) => d.id === selectedDecalId) || null
    : null;

  const quickCameraButtons = isShorts
    ? [
        { id: 'three_quarter', label: '3/4' },
        { id: 'front', label: 'Frente' },
        { id: 'back', label: 'Atrás' },
        { id: 'right_leg', label: 'Pierna Der.' },
        { id: 'left_leg', label: 'Pierna Izq.' },
        { id: 'interior_tag', label: 'Interior' },
      ]
    : [
        { id: 'three_quarter', label: '3/4' },
        { id: 'front', label: 'Frente' },
        { id: 'back', label: 'Espalda' },
        { id: 'right_sleeve', label: 'Manga Der.' },
        { id: 'left_sleeve', label: 'Manga Izq.' },
        { id: 'interior_tag', label: 'Interior' },
      ];

  return (
    <div ref={stageWrapperRef} className="garment-3d-stage relative w-full h-full min-h-[420px]">
      <div
        ref={mountRef}
        tabIndex={0}
        aria-label="Visor 3D interactivo multi-pieza Owayo FOV 30°. Arrastra para rotar la cámara o arrastra cualquier logo, texto o dorsal directamente sobre la prenda."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDragSession}
        onLostPointerCapture={endPointerDragSession}
        onKeyDown={handleKeyDown}
        className={`garment-3d-drag-surface w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
          isDraggingObject
            ? 'cursor-grabbing'
            : hoveringObjectLabel
            ? 'cursor-grab'
            : 'cursor-move'
        }`}
      />

      {/* Telemetría superior izquierda de malla `.mirl` */}
      <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800/90 text-[10px] font-mono text-slate-300 hidden sm:flex items-center gap-2 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {modelStats.loading
          ? 'Cargando malla .mirl...'
          : `${modelStats.vertices.toLocaleString()} vértices • ${modelStats.faces.toLocaleString()} caras • FOV 30°`}
      </div>

      {/* Selector rápido de vistas 3D + Botón Exterior/Interior (`#trikotwenderbutton`) */}
      <div className="absolute top-3 right-3 flex flex-wrap items-center justify-end gap-1 max-w-[75%]">
        {quickCameraButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onChangeCameraPreset?.(btn.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
              cameraPreset === btn.id
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Barra flotante lateral `#toolbox` idéntica a Owayo (`Zoom +`, `Zoom -`, `Girar ↺/↻`, `Undo`, `Redo`) */}
      <div
        aria-label="Herramientas de visor 3D"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-xl backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => handleToolboxZoom(0.84)}
          title="Acercar (Zoom +)"
          aria-label="Acercar cámara"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolboxZoom(1.18)}
          title="Alejar (Zoom -)"
          aria-label="Alejar cámara"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-800 mx-1" />
        <button
          type="button"
          onPointerDown={() => startHoldOrbitTurn(-1)}
          onPointerUp={stopHoldOrbitTurn}
          onPointerLeave={stopHoldOrbitTurn}
          onPointerCancel={stopHoldOrbitTurn}
          title="Girar prenda a la izquierda (mantener pulsado)"
          aria-label="Girar prenda a la izquierda"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onPointerDown={() => startHoldOrbitTurn(1)}
          onPointerUp={stopHoldOrbitTurn}
          onPointerLeave={stopHoldOrbitTurn}
          onPointerCancel={stopHoldOrbitTurn}
          title="Girar prenda a la derecha (mantener pulsado)"
          aria-label="Girar prenda a la derecha"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-800 mx-1" />
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="Deshacer (Ctrl+Z)"
          aria-label="Deshacer cambio"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="Rehacer (Ctrl+Y)"
          aria-label="Rehacer cambio"
          className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Gizmo flotante contextual Owayo para escalar, rotar, centrar, espejar, fijar o borrar sin salir del visor */}
      {activeSelectedDecal && !isDraggingObject && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-slate-950/92 border border-slate-700/90 shadow-2xl backdrop-blur-md max-w-[94%] overflow-x-auto">
          <span className="text-[11px] font-bold text-amber-300 px-1.5 truncate max-w-[120px]">
            {activeSelectedDecal.label}
          </span>
          <div className="h-4 w-px bg-slate-800 mx-0.5" />
          <button
            type="button"
            disabled={activeSelectedDecal.pinned}
            onClick={() =>
              onUpdateDecalFrom3D?.(
                activeSelectedDecal.id,
                { scale: Math.max(0.2, +((activeSelectedDecal.scale ?? 1) - 0.1).toFixed(2)) },
                true
              )
            }
            title="Reducir tamaño (-10%)"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-35"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-300 px-1">
            {Math.round((activeSelectedDecal.scale ?? 1) * 100)}%
          </span>
          <button
            type="button"
            disabled={activeSelectedDecal.pinned}
            onClick={() =>
              onUpdateDecalFrom3D?.(
                activeSelectedDecal.id,
                { scale: Math.min(3.5, +((activeSelectedDecal.scale ?? 1) + 0.1).toFixed(2)) },
                true
              )
            }
            title="Aumentar tamaño (+10%)"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-35"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />
          <button
            type="button"
            disabled={activeSelectedDecal.pinned}
            onClick={() => {
              const nextRot = snapRotationAngle((activeSelectedDecal.rotationDeg || 0) - 15);
              onUpdateDecalFrom3D?.(activeSelectedDecal.id, { rotationDeg: nextRot }, true);
            }}
            title="Rotar -15°"
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-200 disabled:opacity-35"
          >
            -15°
          </button>
          <button
            type="button"
            disabled={activeSelectedDecal.pinned}
            onClick={() => {
              const nextRot = snapRotationAngle((activeSelectedDecal.rotationDeg || 0) + 15);
              onUpdateDecalFrom3D?.(activeSelectedDecal.id, { rotationDeg: nextRot }, true);
            }}
            title="Rotar +15°"
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-200 disabled:opacity-35"
          >
            +15°
          </button>

          <button
            type="button"
            disabled={activeSelectedDecal.pinned}
            onClick={() => {
              const spec = getPartSpec(design.productModelId, activeSelectedDecal.panel || 'front');
              onUpdateDecalFrom3D?.(
                activeSelectedDecal.id,
                { centerMm: { ...activeSelectedDecal.centerMm, x: +(spec.widthMm * spec.snapCenterU).toFixed(1) } },
                true
              );
            }}
            title="Centrar en eje de la pieza"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 disabled:opacity-35"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>

          {onMirrorDecalFrom3D && (
            <button
              type="button"
              onClick={() => onMirrorDecalFrom3D(activeSelectedDecal)}
              title="Duplicar / Espejar a pieza simétrica"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onUpdateDecalFrom3D?.(activeSelectedDecal.id, { pinned: !activeSelectedDecal.pinned }, true)
            }
            title={activeSelectedDecal.pinned ? 'Desbloquear objeto' : 'Fijar posición (Pin)'}
            className={`p-1.5 rounded-lg ${
              activeSelectedDecal.pinned
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {activeSelectedDecal.pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {onDeleteDecalFrom3D && (
            <button
              type="button"
              onClick={() => onDeleteDecalFrom3D(activeSelectedDecal.id)}
              title="Eliminar objeto"
              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Píldora flotante al pasar o arrastrar sobre el tejido 3D */}
      {(hoveringObjectLabel || isDraggingObject) && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-emerald-400/50 text-[11px] font-bold text-emerald-300 shadow-lg whitespace-nowrap">
          {isDraggingObject
            ? '🎯 Ajustando con SnapLines verdes Owayo + Sperrbezirk activo'
            : `✋ Clic para editar o arrastrar «${hoveringObjectLabel}»`}
        </div>
      )}
    </div>
  );
}
