import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
import { getPartSpec, evaluateDecalPlacement } from '../core/boundingBoxMath';

export const CAMERA_PRESETS = {
  front: { pos: [0, 0.04, 4.45], target: [0, 0.0, 0] },
  three_quarter: { pos: [1.85, 0.28, 4.05], target: [0, 0.0, 0] },
  back: { pos: [0, 0.04, -4.45], target: [0, 0.0, 0] },
  left_sleeve: { pos: [3.35, 0.48, 1.35], target: [0.65, 0.42, 0] },
  right_sleeve: { pos: [-3.35, 0.48, 1.35], target: [-0.65, 0.42, 0] },
  macro_weave: { pos: [0.45, 0.48, 1.65], target: [0.22, 0.4, 0.25] },
};

const ALL_POSSIBLE_MESH_PARTS = [
  'Front',
  'Back',
  'LeftArm',
  'RightArm',
  'Collar',
  'Krageneinfass',
  'Aermelbandlinks',
  'Aermelbandrechts',
];

/**
 * Inyecta la regla óptica real de sublimación textil interior (`innenseiteAufhellen` de Owayo v6):
 * El poliéster blanco técnico muestra penetración parcial (~38%) en la cara interior (`!gl_FrontFacing`).
 */
function applyOwayoInnerSublimationShader(material, keySuffix) {
  material.customProgramCacheKey = () => `owayo_v4_inner_sublimation_${keySuffix}`;
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

export default function GarmentCanvas3D({
  design,
  activePlayer,
  artworkRegistry,
  cameraPreset = 'three_quarter',
  autoRotate = false,
  selectedDecalId = null,
  onSelectDecalFrom3D,
  onUpdateDecalFrom3D,
  canvasSnapshotRef,
}) {
  const stageWrapperRef = useRef(null);
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);
  const fishMasksRef = useRef(null);

  const latestPropsRef = useRef({
    design,
    activePlayer,
    artworkRegistry,
    selectedDecalId,
    onSelectDecalFrom3D,
    onUpdateDecalFrom3D,
  });

  const dragSessionRef = useRef(null);
  const [isDraggingDecal, setIsDraggingDecal] = useState(false);
  const [hoveringDecalLabel, setHoveringDecalLabel] = useState(null);
  const [active3DOverlay, setActive3DOverlay] = useState(null);
  const [modelStats, setModelStats] = useState({ loading: true, vertices: 0, faces: 0 });
  const [fishVersionTick, setFishVersionTick] = useState(0);

  latestPropsRef.current = {
    design,
    activePlayer,
    artworkRegistry,
    selectedDecalId,
    onSelectDecalFrom3D,
    onUpdateDecalFrom3D,
  };

  const commitClampedDecalPosition = (decal, rawXmm, rawYmm, enableSnap = true) => {
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

    latestPropsRef.current.onUpdateDecalFrom3D?.(decal.id, {
      centerMm: {
        x: Math.round(finalCenterMm.x * 10) / 10,
        y: Math.round(finalCenterMm.y * 10) / 10,
      },
    });
    return evaluated;
  };

  // Raycast UV multi-pieza real sobre `Front`, `Back`, `LeftArm`, `RightArm` y `Collar`
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

  const findDecalAtMm = (decals = [], panel, xMm, yMm) => {
    const matching = decals
      .filter((d) => (d.panel || 'front') === panel)
      .slice()
      .sort((a, b) => (b.zIndex ?? 10) - (a.zIndex ?? 10));

    for (const d of matching) {
      const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 12;
      const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 12;
      if (Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh) {
        return d;
      }
    }
    return null;
  };

  // 1. Inicializar motor WebGL Three.js + materiales independientes por pieza + ciclo de vida `contentvisibilityautostatechange`
  useEffect(() => {
    const container = mountRef.current;
    const stageEl = stageWrapperRef.current;
    if (!container || !stageEl) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      50
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

    // Iluminación de estudio de 3 puntos para resaltar los pliegues reales del escaneo .mirl
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.05);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(2.8, 3.8, 4.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    fillLight.position.set(-3.4, 1.5, 3.0);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0xfef3c7, 1.35);
    backRimLight.position.set(0.3, 2.8, -4.4);
    scene.add(backRimLight);

    // Sombra de contacto en base de estudio
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
      new THREE.PlaneGeometry(2.6, 1.7),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -1.44;
    scene.add(floorShadow);

    // Crear lienzo y textura GPU dedicada para cada pieza del modelo .mirl
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const partCanvases = {};
    const partTextures = {};
    const partMaterials = {};

    const ribBumpTex = getOrLoadRealBumpTexture('/fabrics/bandstoff-rtex3.png', 28, 12);

    for (const partName of ALL_POSSIBLE_MESH_PARTS) {
      const c = document.createElement('canvas');
      c.width = partName === 'Front' || partName === 'Back' ? 1536 : 1024;
      c.height =
        partName === 'Front' || partName === 'Back'
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
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.45;
    controls.maxDistance = 6.8;
    controls.maxPolarAngle = Math.PI * 0.84;
    controls.minPolarAngle = Math.PI * 0.14;

    const targetCamPos = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.pos);
    const targetLookAt = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.target);
    let isTransitioningCam = false;

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      controls,
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
        camera.position.lerp(targetCamPos, 0.11);
        controls.target.lerp(targetLookAt, 0.11);
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

    // Pausado automático de WebGL cuando está fuera de pantalla (contentvisibilityautostatechange + fallback IntersectionObserver)
    const handleContentVisibilityChange = (event) => {
      if (event.skipped) {
        stopRenderLoop();
      } else {
        startRenderLoop();
      }
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

  // 2. Cargar geometría binaria exacta `.mirl` cuando cambia el modelo deportivo
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
        setModelStats({
          loading: false,
          vertices: template.totalVertices,
          faces: template.totalFaces,
        });
      })
      .catch((err) => {
        console.error('Error cargando malla .mirl:', err);
        if (!cancelled) setModelStats({ loading: false, vertices: 0, faces: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [design.productModelId]);

  // 3. Cargar archivo de máscaras `.fish` cuando cambia el diseño o el producto
  useEffect(() => {
    let cancelled = false;
    const activeFish = resolveActiveFishDesignMeta(design);
    if (!activeFish?.fileUrl) return;

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

  // 4. Actualizar micro-relieve textil real (`ts-tex.png` / `k-tex2.png` / `bandstoff-rtex3.png`)
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    const weave = FABRIC_WEAVES.find((w) => w.id === design.fabricWeaveId) || FABRIC_WEAVES[0];
    const bumpTex = getOrLoadRealBumpTexture(weave.bumpUrl || '/fabrics/ts-tex.png', weave.uvRepeat, weave.uvRepeat);

    ['Front', 'Back', 'LeftArm', 'RightArm'].forEach((partName) => {
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

  // 6. Re-componer texturas independientes por pieza en tiempo real
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    const masksMap = fishMasksRef.current;
    for (const partName of ALL_POSSIBLE_MESH_PARTS) {
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
              snapGuides: active3DOverlay.snapGuides,
            }
          : null
      );
      tex.needsUpdate = true;
    }
  }, [design, activePlayer, artworkRegistry, active3DOverlay, fishVersionTick]);

  // 7. Presets de cámara y auto-rotación
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    st.controls.autoRotate = Boolean(autoRotate) && !isDraggingDecal;
    st.controls.autoRotateSpeed = 1.6;
  }, [autoRotate, isDraggingDecal]);

  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.three_quarter;
    st.targetCamPos.set(...preset.pos);
    st.targetLookAt.set(...preset.target);
    st.setTransition(true);
  }, [cameraPreset]);

  // 8. Arrastre Directo Raycast UV sobre cualquiera de las 5 piezas 3D (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`)
  const handlePointerDown = (e) => {
    if (e.button !== 0 || !sceneStateRef.current) return;

    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) return;

    const hitDecal = findDecalAtMm(design.decals || [], hit.panel, hit.xMm, hit.yMm);
    if (!hitDecal) return;

    onSelectDecalFrom3D?.(hitDecal.id, hit.panel);

    if (!onUpdateDecalFrom3D) return;

    sceneStateRef.current.controls.enabled = false;
    dragSessionRef.current = {
      pointerId: e.pointerId,
      decalId: hitDecal.id,
      panel: hit.panel,
      startClientX: e.clientX,
      startClientY: e.clientY,
      hasMovedThreshold: false,
      grabOffsetMm: {
        x: hit.xMm - hitDecal.centerMm.x,
        y: hit.yMm - hitDecal.centerMm.y,
      },
    };

    e.currentTarget.setPointerCapture(e.pointerId);
    setActive3DOverlay({
      panel: hit.panel,
      selectedDecalId: hitDecal.id,
      snapGuides: null,
    });
  };

  const handlePointerMove = (e) => {
    const session = dragSessionRef.current;
    if (session && e.currentTarget.hasPointerCapture(e.pointerId)) {
      const distPx = Math.hypot(e.clientX - session.startClientX, e.clientY - session.startClientY);
      if (!session.hasMovedThreshold && distPx < 4) return;
      if (!session.hasMovedThreshold) {
        session.hasMovedThreshold = true;
        setIsDraggingDecal(true);
      }

      const hit = raycastDroppableUV(e.clientX, e.clientY, session.panel);
      if (!hit) return;

      const curDecal = (latestPropsRef.current.design.decals || []).find((d) => d.id === session.decalId);
      if (!curDecal) return;

      const rawX = hit.xMm - session.grabOffsetMm.x;
      const rawY = hit.yMm - session.grabOffsetMm.y;
      const evaluated = commitClampedDecalPosition(curDecal, rawX, rawY, true);

      setActive3DOverlay({
        panel: session.panel,
        selectedDecalId: session.decalId,
        snapGuides: evaluated.snapGuides,
      });
      return;
    }

    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) {
      if (hoveringDecalLabel) setHoveringDecalLabel(null);
      return;
    }
    const hovered = findDecalAtMm(design.decals || [], hit.panel, hit.xMm, hit.yMm);
    const nextLabel = hovered ? `${hovered.label} (${hit.spec.shortLabel})` : null;
    if (nextLabel !== hoveringDecalLabel) {
      setHoveringDecalLabel(nextLabel);
    }
  };

  const endPointerDragSession = () => {
    if (sceneStateRef.current) {
      sceneStateRef.current.controls.enabled = true;
    }
    dragSessionRef.current = null;
    setIsDraggingDecal(false);
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
    if (!dir || !onUpdateDecalFrom3D) return;

    const targetId = selectedDecalId || design.decals?.[0]?.id;
    const activeDecal = (design.decals || []).find((d) => d.id === targetId);
    if (!activeDecal) return;

    e.preventDefault();
    const stepMm = e.shiftKey ? 1 : 5;
    commitClampedDecalPosition(
      activeDecal,
      activeDecal.centerMm.x + dir[0] * stepMm,
      activeDecal.centerMm.y + dir[1] * stepMm,
      false
    );
  };

  return (
    <div ref={stageWrapperRef} className="garment-3d-stage relative w-full h-full min-h-[380px]">
      <div
        ref={mountRef}
        tabIndex={0}
        aria-label="Visor 3D interactivo multi-pieza. Arrastra para rotar la cámara o arrastra cualquier logo PNG, SVG o texto directamente sobre pecho, espalda, mangas o cuello."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onLostPointerCapture={endPointerDragSession}
        onKeyDown={handleKeyDown}
        className={`garment-3d-drag-surface w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
          isDraggingDecal
            ? 'cursor-grabbing'
            : hoveringDecalLabel
            ? 'cursor-grab'
            : 'cursor-move'
        }`}
      />

      {/* Badge de telemetría de malla real .mirl */}
      <div className="pointer-events-none absolute top-2 left-3 px-2.5 py-1 rounded-xl bg-slate-950/75 border border-slate-800/90 text-[10px] font-mono text-slate-400 hidden sm:flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {modelStats.loading
          ? 'Descomprimiendo malla .mirl...'
          : `Malla 3D Real: ${modelStats.vertices.toLocaleString()} vértices • ${modelStats.faces.toLocaleString()} caras`}
      </div>

      {/* Píldora flotante al pasar sobre cualquier PNG/SVG/Texto en 3D */}
      {(hoveringDecalLabel || isDraggingDecal) && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-400/50 text-[11px] font-bold text-amber-300 shadow-lg whitespace-nowrap">
          {isDraggingDecal
            ? '🎯 Arrastrando sobre tejido 3D (SnapLines + Sperrbezirk activos)'
            : `✋ Arrastrar «${hoveringDecalLabel}» directamente en 3D`}
        </div>
      )}
    </div>
  );
}
