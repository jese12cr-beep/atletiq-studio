import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildSculptedJerseyGroup } from './jerseyGeometry3D';
import { getFabricPBRMaps } from '../compositor/fabricTexturesPBR';
import { renderFullUVAtlas } from '../compositor/uvCanvasRenderer';
import { FABRIC_WEAVES, ENGINE_PRODUCTS } from '../core/designStore';
import { GARMENT_REFERENCE_MM, evaluateDecalPlacement } from '../core/boundingBoxMath';

const CAMERA_PRESETS = {
  front: { pos: [0, 0.04, 3.28], target: [0, -0.02, 0] },
  three_quarter: { pos: [1.48, 0.24, 2.88], target: [0, -0.02, 0] },
  back: { pos: [0, 0.04, -3.28], target: [0, -0.02, 0] },
  macro_weave: { pos: [0.38, 0.42, 1.24], target: [0.18, 0.34, 0.34] },
};

/**
 * Inyecta la regla real de sublimación interior decodificada de Owayo v6 (`innenseiteAufhellen`):
 * En poliéster técnico blanco (`K-Tex 2`), la tinta sublimada sólo penetra ~38% hacia la cara interna (`!gl_FrontFacing`).
 */
function applyOwayoInnerSublimationShader(material, keySuffix) {
  material.customProgramCacheKey = () => `owayo_inner_sublimation_${keySuffix}`;
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
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);
  const uvAtlasCanvasRef = useRef(null);
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

  latestPropsRef.current = {
    design,
    activePlayer,
    artworkRegistry,
    selectedDecalId,
    onSelectDecalFrom3D,
    onUpdateDecalFrom3D,
  };

  // Helper unificado de posicionamiento restringido (usado tanto por Pointer Events como por Teclado)
  const commitClampedDecalPosition = (decal, rawXmm, rawYmm, enableSnap = true) => {
    const curDesign = latestPropsRef.current.design;
    const candidate = {
      ...decal,
      centerMm: { x: rawXmm, y: rawYmm },
    };
    const evaluated = evaluateDecalPlacement(candidate, null, enableSnap);
    const finalCenterMm =
      curDesign.bleedEnforcement === 'HARD_CLAMP'
        ? evaluated.clampedSafeCenterMm
        : evaluated.snappedCenterMm;

    latestPropsRef.current.onUpdateDecalFrom3D?.(decal.id, { centerMm: finalCenterMm });
    return evaluated;
  };

  // Raycast UV sobre las piezas `Front` y `Back` (`isDroppable === true`)
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
      if (restrictToPanel && h.object.userData.panel !== restrictToPanel) return false;
      return true;
    });

    if (!validHit) return null;

    const { x: u, y: v } = validHit.uv;
    const panel = u < 0.5 ? 'front' : 'back';
    const localU = panel === 'front' ? u / 0.5 : (u - 0.5) / 0.5;
    const xMm = localU * GARMENT_REFERENCE_MM.width;
    const yMm = (1 - v) * GARMENT_REFERENCE_MM.height;

    return { panel, xMm, yMm };
  };

  const findDecalAtMm = (decals = [], panel, xMm, yMm) => {
    for (let i = decals.length - 1; i >= 0; i--) {
      const d = decals[i];
      if (d.panel !== panel) continue;
      const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 14;
      const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 14;
      if (Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh) {
        return d;
      }
    }
    return null;
  };

  // 1. Inicializar escena WebGL Three.js una sola vez
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const uvCanvas = document.createElement('canvas');
    uvCanvas.width = 2048;
    uvCanvas.height = 1024;
    uvAtlasCanvasRef.current = uvCanvas;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
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
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    if (canvasSnapshotRef) {
      canvasSnapshotRef.current = renderer.domElement;
    }

    // Iluminación de estudio de 3 puntos calibrada para relieve textil PBR
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 0.98);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    keyLight.position.set(2.6, 3.5, 3.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.82);
    fillLight.position.set(-3.1, 1.3, 2.4);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0xfef08a, 1.25);
    backRimLight.position.set(0.4, 2.7, -3.6);
    scene.add(backRimLight);

    // Sombra de contacto suave en base de estudio
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
      new THREE.PlaneGeometry(2.5, 1.65),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -1.36;
    scene.add(floorShadow);

    // Textura dinámica UV
    const albedoTexture = new THREE.CanvasTexture(uvCanvas);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;
    albedoTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: albedoTexture,
      roughness: 0.56,
      metalness: 0.02,
      sheen: 0.3,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0xffffff),
      side: THREE.DoubleSide,
    });
    applyOwayoInnerSublimationShader(bodyMat, 'body');

    const sleevesMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(design.colorZones.sleeves?.hex || '#0f172a'),
      roughness: 0.56,
      metalness: 0.02,
      sheen: 0.26,
      side: THREE.DoubleSide,
    });
    applyOwayoInnerSublimationShader(sleevesMat, 'sleeves');

    // Materiales de ribete acanalado (`Bandstoff_R-Tex-3_48mm` en cuello y sisas/puños)
    const ribPbr = getFabricPBRMaps('pique_heavy', 54);
    const collarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(design.colorZones.collar?.hex || '#ffffff'),
      normalMap: ribPbr.normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.64,
    });
    const accentsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(design.colorZones.accents?.hex || '#facc15'),
      normalMap: ribPbr.normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.58,
    });

    const materials = {
      body: bodyMat,
      sleeves: sleevesMat,
      collar: collarMat,
      accents: accentsMat,
    };

    const jerseyContainer = new THREE.Group();
    scene.add(jerseyContainer);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.15;
    controls.maxDistance = 5.2;
    controls.maxPolarAngle = Math.PI * 0.82; // respeta `maxNeigung` de Owayo
    controls.minPolarAngle = Math.PI * 0.16;

    const targetCamPos = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.pos);
    const targetLookAt = new THREE.Vector3(...CAMERA_PRESETS.three_quarter.target);
    let isTransitioningCam = false;

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      albedoTexture,
      materials,
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

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (isTransitioningCam) {
        camera.position.lerp(targetCamPos, 0.1);
        controls.target.lerp(targetLookAt, 0.1);
        if (camera.position.distanceTo(targetCamPos) < 0.015) {
          isTransitioningCam = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      albedoTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Reconstruir topología de 7 piezas cuando cambia el modelo o el cuello
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    const prod = ENGINE_PRODUCTS.find((p) => p.id === design.productModelId);
    const shape = prod?.garmentShape || 'jersey_short';

    while (st.jerseyContainer.children.length > 0) {
      const child = st.jerseyContainer.children[0];
      if (child.geometry) child.geometry.dispose();
      st.jerseyContainer.remove(child);
    }

    const meshGroup = buildSculptedJerseyGroup(st.materials, shape, design.collarStyle);
    st.jerseyContainer.add(meshGroup);
  }, [design.productModelId, design.collarStyle]);

  // 3. Actualizar mapas PBR del tejido deportivo (`Stoffe/v2/k-tex2.json` + `scaleStoff`)
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    const weave = FABRIC_WEAVES.find((w) => w.id === design.fabricWeaveId) || FABRIC_WEAVES[0];
    const pbr = getFabricPBRMaps(weave.id, weave.uvRepeat);

    st.materials.body.normalMap = pbr.normalMap;
    st.materials.body.normalScale.set(weave.normalScale, weave.normalScale);
    st.materials.body.roughness = weave.roughness;
    st.materials.body.needsUpdate = true;

    st.materials.sleeves.normalMap = pbr.normalMap;
    st.materials.sleeves.normalScale.set(weave.normalScale * 0.85, weave.normalScale * 0.85);
    st.materials.sleeves.roughness = weave.roughness;
    st.materials.sleeves.needsUpdate = true;
  }, [design.fabricWeaveId]);

  // 4. Actualizar Atlas UV en tiempo real (incluyendo `SnapLines` y `sperrbezirke` durante arrastre 3D)
  useEffect(() => {
    const st = sceneStateRef.current;
    const uvCanvas = uvAtlasCanvasRef.current;
    if (!st || !uvCanvas) return;

    renderFullUVAtlas(uvCanvas, design, activePlayer, artworkRegistry, active3DOverlay);
    st.albedoTexture.needsUpdate = true;

    st.materials.sleeves.color.set(design.colorZones.sleeves?.hex || '#0f172a');
    st.materials.collar.color.set(design.colorZones.collar?.hex || '#ffffff');
    st.materials.accents.color.set(design.colorZones.accents?.hex || '#facc15');
  }, [design, activePlayer, artworkRegistry, active3DOverlay]);

  // 5. Presets de cámara y auto-rotación
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

  // 6. Arrastre Directo Raycast UV sobre 3D con `setPointerCapture` y `lostpointercapture`
  const handlePointerDown = (e) => {
    if (e.button !== 0 || !sceneStateRef.current) return;

    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) return;

    const hitDecal = findDecalAtMm(design.decals || [], hit.panel, hit.xMm, hit.yMm);
    if (!hitDecal) return;

    onSelectDecalFrom3D?.(hitDecal.id, hit.panel);

    if (!onUpdateDecalFrom3D) return;

    // Bloquear OrbitControls mientras se manipula el escudo/texto en 3D y conservar el offset de agarre
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

    // Detección ligera de hover para cambiar cursor e informar al usuario que puede arrastrar en 3D
    const hit = raycastDroppableUV(e.clientX, e.clientY);
    if (!hit) {
      if (hoveringDecalLabel) setHoveringDecalLabel(null);
      return;
    }
    const hovered = findDecalAtMm(design.decals || [], hit.panel, hit.xMm, hit.yMm);
    const nextLabel = hovered ? hovered.label : null;
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

  // Soporte de movimiento preciso con flechas del teclado usando el mismo helper restringido
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
    const stepMm = e.shiftKey ? 1 : 4;
    const nextX = activeDecal.centerMm.x + dir[0] * stepMm;
    const nextY = activeDecal.centerMm.y + dir[1] * stepMm;
    commitClampedDecalPosition(activeDecal, nextX, nextY, false);
  };

  return (
    <div className="w-full h-full min-h-[380px] relative">
      <div
        ref={mountRef}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onLostPointerCapture={endPointerDragSession}
        onKeyDown={handleKeyDown}
        className={`garment-3d-drag-surface w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-xl ${
          isDraggingDecal
            ? 'cursor-grabbing'
            : hoveringDecalLabel
            ? 'cursor-grab'
            : 'cursor-grab active:cursor-grabbing'
        }`}
        aria-label="Visor 3D interactivo de prenda deportiva. Haz clic y arrastra un escudo sobre el modelo 3D o usa las flechas del teclado para moverlo."
      />

      {/* Indicador contextual flotante cuando el puntero detecta un elemento arrastrable en 3D */}
      {(hoveringDecalLabel || isDraggingDecal) && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-sky-400/50 text-[11px] font-bold text-sky-300 shadow-lg whitespace-nowrap">
          {isDraggingDecal
            ? '🧲 Arrastrando en 3D • Imán central x=0.50 & bloqueo costura 5.0cm activos'
            : `✋ Arrastra "${hoveringDecalLabel}" directo en 3D o usa ↑↓←→`}
        </div>
      )}
    </div>
  );
}
