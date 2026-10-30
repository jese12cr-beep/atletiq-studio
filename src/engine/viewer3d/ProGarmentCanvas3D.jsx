/**
 * ATLETIQ PRO — Visor 3D de Nueva Generación
 *
 * Renderiza el modelo 3D `jersey_pro_781001.glb` decodificado con DRACO en GPU,
 * con iluminación PBR de estudio deportivo, doble cara textil (malla exterior e interior),
 * ribete elástico de cuello (sweatband) y mapeo en tiempo real a 2048x2048.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Camera,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { composeProGarmentTexture } from '../compositor/atletiqProCompositor';

const CAMERA_PRESETS = {
  three_quarter: { pos: [0, 0.05, 1.45], target: [0, 0, 0] },
  front: { pos: [0, 0.05, 1.35], target: [0, 0, 0] },
  back: { pos: [0, 0.05, -1.35], target: [0, 0, 0] },
  left_sleeve: { pos: [1.2, 0.1, 0.4], target: [0.15, 0.05, 0] },
  right_sleeve: { pos: [-1.2, 0.1, 0.4], target: [-0.15, 0.05, 0] },
  collar: { pos: [0, 0.32, 0.75], target: [0, 0.22, 0] },
};

export default function ProGarmentCanvas3D({
  patternSvgPath = '/assets/patterns/atletiq_pro_01.svg',
  colorZoneMap = {},
  playerName = 'ATLETIQ',
  playerNumber = '10',
  frontNumberActive = false,
  fontFamily = 'Impact, sans-serif',
  numberFillColor = '#FFFFFF',
  numberOutlineColor = '#0F172A',
  numberShadowColor = '#000000',
  nameFillColor = '#FFFFFF',
  nameOutlineColor = '#0F172A',
  nameCurveAngle = 0,
  activeCrest = null,
  sponsorText = '',
  sponsorImage = null,
  activeCollar = 'round',
  autoRotate = false,
  onSnapshotTaken = null,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeCameraAngle, setActiveCameraAngle] = useState('three_quarter');

  // 1. Inicialización de Escena Three.js, Luces y Carga de Modelo GLB Draco
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 700;

    // Escena y Renderizador WebGL
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 20);
    camera.position.set(...CAMERA_PRESETS.three_quarter.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Controles de órbita deportiva suave
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.7;
    controls.maxDistance = 2.8;
    controls.maxPolarAngle = Math.PI * 0.75;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.target.set(0, 0, 0);

    // Iluminación deportiva de estudio fotográfico
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(1.5, 2.5, 2.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    backRimLight.position.set(0, 2, -2.5);
    scene.add(backRimLight);

    // Sombra de contacto suave en el suelo
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.38)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -0.58;
    scene.add(floorShadow);

    // Contenedor principal de la camiseta
    const jerseyGroup = new THREE.Group();
    scene.add(jerseyGroup);

    // Materiales PBR Textil
    const outMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.FrontSide,
    });

    const inMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.BackSide,
    });

    const sweatbandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });

    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
    });

    // Carga de Modelo GLB con Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(resolveAssetUrl('/draco/'));

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const modelUrl = resolveAssetUrl('/assets/models/jersey_pro_781001.glb');

    gltfLoader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        root.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            if (node.name.includes('_mesh_out')) {
              node.material = outMaterial;
            } else if (node.name.includes('_mesh_in')) {
              node.material = inMaterial;
            } else if (node.name.includes('sweatband')) {
              node.material = sweatbandMat;
            } else if (node.name.includes('label')) {
              node.material = labelMat;
            } else {
              node.material = outMaterial;
            }
          }
        });

        // Centrado y escala óptima en el origen
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);
        root.position.y += 0.05;

        jerseyGroup.add(root);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('[ATLETIQ Pro 3D] Error cargando modelo GLB Draco:', err);
        setLoading(false);
      }
    );

    // Bucle de renderizado
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (stateRef.current?.autoRotate && jerseyGroup) {
        jerseyGroup.rotation.y += 0.006;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Guardar referencias
    stateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      jerseyGroup,
      outMaterial,
      inMaterial,
      sweatbandMat,
      labelMat,
      autoRotate,
    };

    // Redimensionamiento
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Sincronizar autoRotate
  useEffect(() => {
    if (stateRef.current) {
      stateRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // 3. Re-renderizado de Textura 2048x2048 en GPU cuando cambian parámetros de diseño
  useEffect(() => {
    let cancelled = false;

    async function updateTexture() {
      const st = stateRef.current;
      if (!st || !st.outMaterial) return;

      const canvas = await composeProGarmentTexture({
        patternSvgPath,
        colorZoneMap,
        playerName,
        playerNumber,
        frontNumberActive,
        fontFamily,
        numberFillColor,
        numberOutlineColor,
        numberShadowColor,
        nameFillColor,
        nameOutlineColor,
        nameCurveAngle,
        crestImage: activeCrest,
        sponsorText,
        sponsorImage,
        brandLogoColor: colorZoneMap['c7'] || '#FFFFFF',
      });

      if (cancelled || !stateRef.current) return;

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      // Aplicar al exterior
      st.outMaterial.map = texture;
      st.outMaterial.needsUpdate = true;

      // Textura translúcida al revés para la cara interior (simulando sublimación textil genuina)
      st.inMaterial.map = texture;
      st.inMaterial.color.set(0xf1f5f9);
      st.inMaterial.needsUpdate = true;

      // Ajustar color de la cinta sudorípara del cuello
      if (st.sweatbandMat && colorZoneMap['c5']) {
        st.sweatbandMat.color.set(colorZoneMap['c5']);
      }
    }

    updateTexture();

    return () => {
      cancelled = true;
    };
  }, [
    patternSvgPath,
    colorZoneMap,
    playerName,
    playerNumber,
    frontNumberActive,
    fontFamily,
    numberFillColor,
    numberOutlineColor,
    numberShadowColor,
    nameFillColor,
    nameOutlineColor,
    nameCurveAngle,
    activeCrest,
    sponsorText,
    sponsorImage,
    activeCollar,
  ]);

  // Cambiar preset de cámara suavemente
  const setCameraPreset = (presetKey) => {
    const st = stateRef.current;
    const preset = CAMERA_PRESETS[presetKey];
    if (!st || !preset) return;

    setActiveCameraAngle(presetKey);

    const startPos = st.camera.position.clone();
    const endPos = new THREE.Vector3(...preset.pos);
    const startTime = performance.now();
    const duration = 500;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      st.camera.position.lerpVectors(startPos, endPos, ease);
      st.controls.target.set(...preset.target);
      st.controls.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  };

  const resetView = () => {
    setCameraPreset('three_quarter');
    if (stateRef.current?.jerseyGroup) {
      stateRef.current.jerseyGroup.rotation.y = 0;
    }
  };

  const takeSnapshot = () => {
    const st = stateRef.current;
    if (!st || !st.renderer) return;
    const dataUrl = st.renderer.domElement.toDataURL('image/png');
    onSnapshotTaken?.(dataUrl);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center bg-radial from-slate-900/90 via-slate-950 to-slate-950 overflow-hidden select-none">
      {/* Indicador de carga */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Cargando Muestreo 3D Pro ATLETIQ...
          </span>
        </div>
      )}

      {/* Contenedor WebGL */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Controles Flotantes de Ángulos de Cámara */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-lg">
        {[
          { key: 'front', label: 'Frente' },
          { key: 'back', label: 'Espalda' },
          { key: 'three_quarter', label: '3/4 Pro' },
          { key: 'left_sleeve', label: 'Manga Izq.' },
          { key: 'right_sleeve', label: 'Manga Der.' },
          { key: 'collar', label: 'Cuello' },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={() => setCameraPreset(btn.key)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeCameraAngle === btn.key
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Controles de Zoom y Centrado */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-lg">
        <button
          type="button"
          onClick={() => {
            const st = stateRef.current;
            if (st) st.camera.position.multiplyScalar(0.9);
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Acercar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            const st = stateRef.current;
            if (st) st.camera.position.multiplyScalar(1.1);
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Alejar Zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={resetView}
          className="p-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          title="Restablecer Vista"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {onSnapshotTaken && (
          <button
            type="button"
            onClick={takeSnapshot}
            className="p-2 rounded-xl text-slate-300 hover:text-teal-400 hover:bg-slate-800 transition-colors"
            title="Capturar Foto 3D"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Badge de Fidelidad 3D */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-semibold text-slate-300">Render 3D Textil PBR (2048x2048)</span>
      </div>
    </div>
  );
}
