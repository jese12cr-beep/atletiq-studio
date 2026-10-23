import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildSculptedJerseyGroup } from './jerseyGeometry3D';
import { getFabricPBRMaps } from '../compositor/fabricTexturesPBR';
import { renderFullUVAtlas } from '../compositor/uvCanvasRenderer';
import { FABRIC_WEAVES, ENGINE_PRODUCTS } from '../core/designStore';
import { GARMENT_REFERENCE_MM } from '../core/boundingBoxMath';

const CAMERA_PRESETS = {
  front: { pos: [0, 0.05, 3.35], target: [0, 0.0, 0] },
  three_quarter: { pos: [1.55, 0.22, 2.95], target: [0, 0.0, 0] },
  back: { pos: [0, 0.05, -3.35], target: [0, 0.0, 0] },
  macro_weave: { pos: [0.42, 0.42, 1.32], target: [0.22, 0.36, 0.35] },
};

export default function GarmentCanvas3D({
  design,
  activePlayer,
  artworkRegistry,
  cameraPreset = 'three_quarter',
  autoRotate = false,
  onSelectDecalFrom3D,
  canvasSnapshotRef,
}) {
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);
  const uvAtlasCanvasRef = useRef(null);

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
      36,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      50
    );
    camera.position.set(1.55, 0.22, 2.95);

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

    // Iluminación de estudio de 3 puntos + Rim Light deportiva
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(2.8, 3.6, 3.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.85);
    fillLight.position.set(-3.2, 1.4, 2.2);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0xfef08a, 1.35);
    backRimLight.position.set(0.5, 2.6, -3.5);
    scene.add(backRimLight);

    // Sombra suave de contacto en el suelo del estudio
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.7),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -1.36;
    scene.add(floorShadow);

    // Textura dinámica UV
    const albedoTexture = new THREE.CanvasTexture(uvCanvas);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;
    albedoTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const materials = {
      body: new THREE.MeshPhysicalMaterial({
        map: albedoTexture,
        roughness: 0.56,
        metalness: 0.02,
        sheen: 0.28,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
      }),
      sleeves: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(design.colorZones.sleeves?.hex || '#0f172a'),
        roughness: 0.56,
        metalness: 0.02,
        sheen: 0.25,
        side: THREE.DoubleSide,
      }),
      collar: new THREE.MeshStandardMaterial({
        color: new THREE.Color(design.colorZones.collar?.hex || '#ffffff'),
        roughness: 0.65,
      }),
      accents: new THREE.MeshStandardMaterial({
        color: new THREE.Color(design.colorZones.accents?.hex || '#facc15'),
        roughness: 0.55,
      }),
    };

    const jerseyContainer = new THREE.Group();
    scene.add(jerseyContainer);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.15;
    controls.maxDistance = 5.2;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.minPolarAngle = Math.PI * 0.18;

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

    // Detener interpolación automática si el usuario orbita manualmente
    const onControlStart = () => {
      isTransitioningCam = false;
    };
    controls.addEventListener('start', onControlStart);

    // ResizeObserver responsivo
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

  // 2. Reconstruir geometría cuando cambia la silueta o estilo de cuello
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;

    const prod = ENGINE_PRODUCTS.find((p) => p.id === design.productModelId);
    const shape = prod?.garmentShape || 'jersey_short';

    while (st.jerseyContainer.children.length > 0) {
      const child = st.jerseyContainer.children[0];
      st.jerseyContainer.remove(child);
    }

    const meshGroup = buildSculptedJerseyGroup(st.materials, shape, design.collarStyle);
    st.jerseyContainer.add(meshGroup);
  }, [design.productModelId, design.collarStyle]);

  // 3. Actualizar mapas PBR del tejido deportivo (Kit Builder Tileable Weave)
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

  // 4. Actualizar Atlas UV en tiempo real al cambiar colores, patrones, logos o jugador activo
  useEffect(() => {
    const st = sceneStateRef.current;
    const uvCanvas = uvAtlasCanvasRef.current;
    if (!st || !uvCanvas) return;

    renderFullUVAtlas(uvCanvas, design, activePlayer, artworkRegistry);
    st.albedoTexture.needsUpdate = true;

    st.materials.sleeves.color.set(design.colorZones.sleeves?.hex || '#0f172a');
    st.materials.collar.color.set(design.colorZones.collar?.hex || '#ffffff');
    st.materials.accents.color.set(design.colorZones.accents?.hex || '#facc15');
  }, [design, activePlayer, artworkRegistry]);

  // 5. Presets de cámara y auto-rotación
  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    st.controls.autoRotate = Boolean(autoRotate);
    st.controls.autoRotateSpeed = 1.6;
  }, [autoRotate]);

  useEffect(() => {
    const st = sceneStateRef.current;
    if (!st) return;
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.three_quarter;
    st.targetCamPos.set(...preset.pos);
    st.targetLookAt.set(...preset.target);
    st.setTransition(true);
  }, [cameraPreset]);

  // 6. Raycasting UV: Clic directo en un logo sobre el modelo 3D lo selecciona
  const handlePointerUp = (e) => {
    if (!onSelectDecalFrom3D || !sceneStateRef.current || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, sceneStateRef.current.camera);
    const hits = raycaster.intersectObjects(sceneStateRef.current.jerseyContainer.children, true);
    const torsoHit = hits.find((h) => h.object.name === 'torso' && h.uv);
    if (!torsoHit) return;

    const { x: u, y: v } = torsoHit.uv;
    const panel = u < 0.5 ? 'front' : 'back';
    const localU = panel === 'front' ? u / 0.5 : (u - 0.5) / 0.5;
    const xMm = localU * GARMENT_REFERENCE_MM.width;
    const yMm = (1 - v) * GARMENT_REFERENCE_MM.height;

    const hitDecal = (design.decals || []).find((d) => {
      if (d.panel !== panel) return false;
      const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 14;
      const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 14;
      return Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh;
    });

    if (hitDecal) {
      onSelectDecalFrom3D(hitDecal.id, panel);
    }
  };

  return (
    <div
      ref={mountRef}
      onPointerUp={handlePointerUp}
      className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing relative"
      aria-label="Visor 3D interactivo de prenda deportiva"
    />
  );
}
