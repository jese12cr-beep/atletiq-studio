import React, { Suspense, lazy, useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  Sparkles,
  Box,
  Scan,
  Upload,
  Plus,
  Trash2,
  Scissors,
  ShoppingBag,
  Store,
  AlignCenterHorizontal,
  RefreshCw,
  Check,
  Eye,
  Layers,
  Shield,
  Type,
  Users,
  Palette,
} from 'lucide-react';
import Interactive2DLab from '../../engine/compositor/Interactive2DLab';
import LayerStack25DViewer from '../../engine/compositor/LayerStack25DViewer';

const GarmentCanvas3D = lazy(() => import('../../engine/viewer3d/GarmentCanvas3D'));
import {
  ENGINE_PRODUCTS,
  TEXTILE_COLORS,
  VECTOR_PATTERNS,
  FABRIC_WEAVES,
  SPORT_FONTS,
  VOLUME_TIERS,
} from '../../engine/core/designStore';
import { processUploadedArtwork, calculateEffectiveDpi } from '../../engine/core/dpiValidator';
import { computeAutoCondenseScaleX } from '../../engine/core/boundingBoxMath';

const STEPS = [
  { id: 1, label: '1. Prenda & Tejido', icon: Layers },
  { id: 2, label: '2. Colores PMS', icon: Palette },
  { id: 3, label: '3. Logos & Bounding Box', icon: Shield },
  { id: 4, label: '4. Dorsales & Slots', icon: Type },
  { id: 5, label: '5. Roster Equipo', icon: Users },
];

const CUT_OPTIONS = [
  { value: 'MEN_PRO_SLIM', label: 'Hombre Slim' },
  { value: 'MEN_CLASSIC', label: 'Hombre Clásico' },
  { value: 'WOMEN_FIT', label: 'Mujer Entallado' },
  { value: 'YOUTH_KIDS', label: 'Infantil / Juvenil' },
];

const SIZE_OPTIONS = ['128', '140', '152', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function HybridStudioWorkspace({
  design,
  onCommitDesign,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  roster,
  onUpdateRoster,
  artworkRegistry,
  onRegisterArtwork,
  onOpenProductionModal,
  onOpenCart,
  cartCount,
  onSwitchToStorefront,
}) {
  const [step, setStep] = useState(1);
  const [viewportMode, setViewportMode] = useState('3d'); // '3d' | '2d'
  const [cameraPreset, setCameraPreset] = useState('three_quarter');
  const [autoRotate, setAutoRotate] = useState(false);
  const [panel2D, setPanel2D] = useState('front');
  const [selectedDecalId, setSelectedDecalId] = useState('decal_club_crest');
  const [activeRosterIndex, setActiveRosterIndex] = useState(0);
  const [activeColorZone, setActiveColorZone] = useState('primary');
  const [csvQuickInput, setCsvQuickInput] = useState('');

  const fileInputRef = useRef(null);
  const canvasSnapshotRef = useRef(null);

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];
  const isFaux3DAccessory = currentProduct.renderMode === 'FAUX_3D_LAYERED_WEBP';

  const activePlayer = roster[activeRosterIndex] || roster[0] || { name: 'RODRÍGUEZ', number: '10', size: 'L' };
  const totalUnits = roster.reduce((acc, r) => acc + (Number(r.qty) || 1), 0);
  const currentTier =
    VOLUME_TIERS.find((t) => totalUnits >= t.min && totalUnits <= t.max) || VOLUME_TIERS[0];
  const unitPrice = +(currentProduct.basePrice * (1 - currentTier.discountPct / 100)).toFixed(2);
  const totalPrice = +(unitPrice * totalUnits).toFixed(2);

  const selectedDecal =
    (design.decals || []).find((d) => d.id === selectedDecalId) || (design.decals || [])[0] || null;

  // Helpers de actualización inmutable del diseño
  const updateColorZone = (zoneKey, colorObj) => {
    onCommitDesign({
      ...design,
      colorZones: {
        ...design.colorZones,
        [zoneKey]: { hex: colorObj.hex, pantone: colorObj.pantone },
      },
    });
  };

  const updateDecal = (decalId, patch) => {
    onCommitDesign(
      {
        ...design,
        decals: (design.decals || []).map((d) => (d.id === decalId ? { ...d, ...patch } : d)),
      },
      false // No saturar historial Undo en cada píxel de arrastre continuo
    );
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = await processUploadedArtwork(file);
    onRegisterArtwork(processed.artworkId, processed);

    const baseWidthMm = 72;
    const baseHeightMm = Math.round(baseWidthMm / processed.aspectRatio);
    const newDecal = {
      id: `decal_${Date.now().toString(36)}`,
      type: processed.isVector ? 'UPLOADED_VECTOR' : 'UPLOADED_RASTER',
      artworkId: processed.artworkId,
      label: processed.fileName.slice(0, 18),
      panel: panel2D,
      safeZoneId: panel2D === 'back' ? 'back_full' : 'front_chest_full',
      centerMm: { x: 250, y: 225 },
      sizeMm: { width: baseWidthMm, height: baseHeightMm },
      scale: 1,
      rotationDeg: 0,
      isVector: processed.isVector,
      widthPx: processed.widthPx,
    };

    onCommitDesign({
      ...design,
      decals: [...(design.decals || []), newDecal],
    });
    setSelectedDecalId(newDecal.id);
    if (!isFaux3DAccessory) {
      setViewportMode('2d');
    }
    e.target.value = '';
  };

  const handleRandomProPalette = () => {
    const pick = () => TEXTILE_COLORS[Math.floor(Math.random() * TEXTILE_COLORS.length)];
    const c1 = pick();
    const c2 = pick();
    const c3 = pick();
    const pat = VECTOR_PATTERNS[Math.floor(Math.random() * VECTOR_PATTERNS.length)];
    onCommitDesign({
      ...design,
      patternId: pat.id,
      colorZones: {
        primary: { hex: c1.hex, pantone: c1.pantone },
        secondary: { hex: c2.hex, pantone: c2.pantone },
        sleeves: { hex: c2.hex, pantone: c2.pantone },
        collar: { hex: '#f8fafc', pantone: 'PMS Bright White' },
        accents: { hex: c3.hex, pantone: c3.pantone },
      },
    });
  };

  const handleStepSelect = (nextStep) => {
    setStep(nextStep);
    if (nextStep === 3 && !isFaux3DAccessory) {
      // Facilitar edición de Bounding Boxes mostrando el laboratorio 2D o vista frontal
      setCameraPreset('front');
    } else if (nextStep === 4 || nextStep === 5) {
      setCameraPreset('back');
      setPanel2D('back');
    }
  };

  const handleBulkPasteCSV = () => {
    if (!csvQuickInput.trim()) return;
    const lines = csvQuickInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line, i) => {
      const parts = line.split(/[,;\t]/).map((s) => s.trim());
      return {
        id: `csv_${Date.now()}_${i}`,
        name: (parts[0] || `JUGADOR ${i + 1}`).toUpperCase(),
        number: parts[1] || String(i + 1),
        size: SIZE_OPTIONS.includes((parts[2] || '').toUpperCase()) ? parts[2].toUpperCase() : 'L',
        cut: 'MEN_PRO_SLIM',
        qty: Math.max(1, parseInt(parts[3] || '1', 10) || 1),
        role: 'Importado CSV',
      };
    });
    if (parsed.length > 0) {
      onUpdateRoster([...roster, ...parsed]);
      setCsvQuickInput('');
    }
  };

  return (
    <div className="h-dvh w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* ================= TOP STUDIO APP BAR ================= */}
      <header className="h-14 shrink-0 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onSwitchToStorefront}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Ver Vitrina E-Commerce"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vitrina</span>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-sm font-black tracking-wider text-white">
              ATLETIQ <span className="text-amber-400">ENGINE v3</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              {design.designId}
            </span>
          </div>
        </div>

        {/* 5-Step Progress Navigation (Owayo Flow) */}
        <nav aria-label="Pasos de personalización" className="flex items-center gap-1 overflow-x-auto py-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepSelect(s.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{s.id}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Undo/Redo + Export Print-Ready + Cart */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 disabled:opacity-30 hover:text-white"
            title="Deshacer cambio"
            aria-label="Deshacer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 disabled:opacity-30 hover:text-white"
            title="Rehacer cambio"
            aria-label="Rehacer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenProductionModal}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print-Ready & Lote</span>
            <span className="font-mono bg-slate-950/20 px-1.5 py-0.5 rounded">${totalPrice}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE SPLIT ================= */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* LEFT/CENTER STAGE: 3D PBR / 2D BOUNDING BOX / 2.5D NIKE LAYER STACK */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,#1e293b_0%,#020617_78%)] flex flex-col justify-between min-h-[340px] overflow-hidden">
          {/* Top Floating HUD */}
          <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <strong className="text-white">{currentProduct.name}</strong>
                <span className="text-slate-400 ml-2 hidden sm:inline">
                  • Muestra Jugador: <strong className="text-amber-400">#{activePlayer.number} {activePlayer.name}</strong> ({activePlayer.size})
                </span>
              </div>
            </div>

            {/* Selector Motor 3D PBR vs Laboratorio 2D CustomInk */}
            {!isFaux3DAccessory ? (
              <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setViewportMode('3d')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === '3d' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  3D PBR Real
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('2d')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === '2d' ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  Molde 2D + Bounding Box
                </button>
              </div>
            ) : (
              <span className="pointer-events-auto px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-bold">
                ⚡ Motor 2.5D Capas Nike (&lt; 2 ms GPU Tint)
              </span>
            )}
          </div>

          {/* Active Viewport */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {isFaux3DAccessory ? (
              <LayerStack25DViewer
                accessoryType={currentProduct.accessoryType}
                design={design}
                activePlayer={activePlayer}
                artworkRegistry={artworkRegistry}
                canvasSnapshotRef={canvasSnapshotRef}
              />
            ) : viewportMode === '3d' ? (
              <Suspense
                fallback={
                  <div className="text-xs font-mono text-amber-400 animate-pulse">
                    Inicializando Motor WebGL 3D PBR...
                  </div>
                }
              >
                <GarmentCanvas3D
                  design={design}
                  activePlayer={activePlayer}
                  artworkRegistry={artworkRegistry}
                  cameraPreset={cameraPreset}
                  autoRotate={autoRotate}
                  canvasSnapshotRef={canvasSnapshotRef}
                  onSelectDecalFrom3D={(decalId, hitPanel) => {
                    setSelectedDecalId(decalId);
                    setPanel2D(hitPanel);
                    setStep(3);
                  }}
                />
              </Suspense>
            ) : (
              <Interactive2DLab
                design={design}
                panel={panel2D}
                activePlayer={activePlayer}
                artworkRegistry={artworkRegistry}
                selectedDecalId={selectedDecalId}
                onSelectDecal={setSelectedDecalId}
                onUpdateDecal={updateDecal}
              />
            )}
          </div>

          {/* Bottom Floating Camera / Panel Bar */}
          {!isFaux3DAccessory && (
            <div className="p-3 flex flex-wrap items-center justify-center gap-1.5 z-10">
              {viewportMode === '3d' ? (
                <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-2xl">
                  {[
                    { id: 'three_quarter', label: '3/4 Estudio' },
                    { id: 'front', label: 'Frente 0°' },
                    { id: 'back', label: 'Dorsal 180°' },
                    { id: 'macro_weave', label: '🔍 Macro Tejido Dry-Fit' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => {
                        setAutoRotate(false);
                        setCameraPreset(cam.id);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        cameraPreset === cam.id && !autoRotate
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                      autoRotate ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
                    Giro 360°
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPanel2D('front')}
                    className={`px-4 py-1 rounded-xl text-xs font-bold ${
                      panel2D === 'front' ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Molde Delantero (500×600 mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel2D('back')}
                    className={`px-4 py-1 rounded-xl text-xs font-bold ${
                      panel2D === 'back' ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Molde Espalda (500×600 mm)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR PANEL: CONTEXTUAL PER ACTIVE STEP */}
        <aside className="w-full lg:w-[440px] xl:w-[470px] shrink-0 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col max-h-[48dvh] lg:max-h-none">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 select-text">
            {/* ================= STEP 1: PRENDA, PATRÓN SVG Y TEJIDO DRY-FIT ================= */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                      1. Selecciona Prenda (3D PBR vs 2.5D Capas)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ENGINE_PRODUCTS.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() =>
                          onCommitDesign({
                            ...design,
                            productModelId: prod.id,
                          })
                        }
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          design.productModelId === prod.id
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-amber-400 block">{prod.badge}</span>
                        <span className="text-xs font-bold block mt-0.5 leading-snug">{prod.name}</span>
                        <span className="text-[11px] text-slate-400">${prod.basePrice.toFixed(2)} base</span>
                      </button>
                    ))}
                  </div>
                </div>

                {!isFaux3DAccessory && (
                  <>
                    {/* Patrones Vectoriales SVG (Kit Builder) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                          2. Patrón Vectorial de Sublimación (SVG)
                        </h3>
                        <button
                          type="button"
                          onClick={handleRandomProPalette}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Combinación Pro
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {VECTOR_PATTERNS.map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => onCommitDesign({ ...design, patternId: pat.id })}
                            className={`p-2.5 rounded-xl border text-left ${
                              design.patternId === pat.id
                                ? 'bg-slate-800 border-amber-400 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-bold block">{pat.name}</span>
                            <span className="text-[10px] text-slate-400">{pat.subtitle}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Micro-Textura Física del Tejido (Kit Builder Normal Map) */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                        3. Física del Tejido Deportivo (Normal & Roughness Map)
                      </h3>
                      <div className="space-y-2">
                        {FABRIC_WEAVES.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              onCommitDesign({ ...design, fabricWeaveId: w.id });
                              setCameraPreset('macro_weave');
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between ${
                              design.fabricWeaveId === w.id
                                ? 'bg-sky-500/10 border-sky-400 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold block">{w.name}</span>
                              <span className="text-[11px] text-slate-400">{w.desc}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300">
                              x{w.uvRepeat} UV
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= STEP 2: COLORES PANTONE TEXTIL POR ZONA ================= */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                    Zona Activa de la Prenda
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'primary', label: '1. Cuerpo Base' },
                      { id: 'secondary', label: '2. Trama / Visera' },
                      { id: 'sleeves', label: '3. Mangas' },
                      { id: 'collar', label: '4. Cuello' },
                      { id: 'accents', label: '5. Puños / Ribete' },
                    ].map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setActiveColorZone(z.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                          activeColorZone === z.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                          style={{ backgroundColor: design.colorZones[z.id]?.hex }}
                        />
                        <span className="truncate">{z.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      Carta Oficial de Sublimación (Equivalencia Pantone)
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      {design.colorZones[activeColorZone]?.pantone}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXTILE_COLORS.map((c) => {
                      const isSel = design.colorZones[activeColorZone]?.hex === c.hex;
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => updateColorZone(activeColorZone, c)}
                          className={`p-2 rounded-xl border text-left transition-transform ${
                            isSel
                              ? 'border-amber-400 scale-[1.03] bg-slate-800'
                              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-full h-7 rounded-lg mb-1.5 flex items-center justify-center border border-white/10"
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSel && <Check className="w-4 h-4" style={{ color: c.contrast }} />}
                          </div>
                          <span className="text-[11px] font-bold text-white block truncate">{c.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 block">{c.pantone}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isFaux3DAccessory && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block mb-2">Construcción de Cuello 3D</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'v-neck', label: 'Cuello en V Competición' },
                        { id: 'crew', label: 'Cuello Redondo Olímpico' },
                      ].map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => onCommitDesign({ ...design, collarStyle: col.id })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                            design.collarStyle === col.id
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}
                        >
                          {col.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 3: LOGOS, BOUNDING BOXES Y SEMÁFORO DPI (CUSTOMINK) ================= */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 bg-sky-500/10 border border-sky-500/30 p-3 rounded-2xl">
                  <div className="text-xs text-sky-200">
                    <strong className="block text-sky-300">Laboratorio CustomInk Bounding Box</strong>
                    Activa el <strong>Molde 2D</strong> para arrastrar logos con guías magnéticas y control de costuras.
                  </div>
                  {!isFaux3DAccessory && (
                    <button
                      type="button"
                      onClick={() => setViewportMode(viewportMode === '2d' ? '3d' : '2d')}
                      className="px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-black shrink-0"
                    >
                      {viewportMode === '2d' ? 'Ver en 3D' : 'Abrir Molde 2D'}
                    </button>
                  )}
                </div>

                {/* Subida con Auto-Trim Alpha y Proxy sin Base64 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/70 flex items-center justify-center gap-2 text-xs font-bold text-white"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    Subir PNG / SVG
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleUploadLogo}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onCommitDesign({
                        ...design,
                        bleedEnforcement: design.bleedEnforcement === 'HARD_CLAMP' ? 'SOFT_WARN' : 'HARD_CLAMP',
                      })
                    }
                    className={`p-3 rounded-2xl border text-xs font-bold ${
                      design.bleedEnforcement === 'HARD_CLAMP'
                        ? 'bg-rose-500/15 border-rose-400 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    Límite: {design.bleedEnforcement === 'HARD_CLAMP' ? 'Bloqueo Estricto' : 'Aviso Visual'}
                  </button>
                </div>

                {/* Lista de Capas / Decals en la prenda */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                    Elementos Gráficos en Prenda ({(design.decals || []).length})
                  </span>
                  <div className="space-y-1.5">
                    {(design.decals || []).map((d) => {
                      const dpiInfo = calculateEffectiveDpi(d.widthPx || 1200, d.sizeMm.width, d.scale ?? 1, d.isVector);
                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDecalId(d.id);
                            setPanel2D(d.panel);
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                            selectedDecal?.id === d.id
                              ? 'bg-slate-800 border-amber-400'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{d.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Panel: {d.panel.toUpperCase()} • {dpiInfo.dpi === 999 ? 'SVG Vector' : `${dpiInfo.dpi} DPI`}
                            </span>
                          </div>
                          {(design.decals || []).length > 1 && (
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                onCommitDesign({
                                  ...design,
                                  decals: design.decals.filter((x) => x.id !== d.id),
                                });
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                              aria-label="Eliminar capa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Controles paramétricos de precisión del Decal activo */}
                {selectedDecal && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{selectedDecal.label}</span>
                      <button
                        type="button"
                        onClick={() => updateDecal(selectedDecal.id, { centerMm: { ...selectedDecal.centerMm, x: 250 } })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold flex items-center gap-1"
                      >
                        <AlignCenterHorizontal className="w-3 h-3 text-sky-400" />
                        Centrar Eje X (250mm)
                      </button>
                    </div>

                    {selectedDecal.type === 'PRESET_CREST' && (
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'royal_shield', name: 'Real FC' },
                          { id: 'eagle_crest', name: 'Águila' },
                          { id: 'lion_gold', name: 'Pro Gold' },
                          { id: 'bolt_pro', name: 'Rayo' },
                        ].map((pr) => (
                          <button
                            key={pr.id}
                            type="button"
                            onClick={() => updateDecal(selectedDecal.id, { presetId: pr.id })}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border ${
                              selectedDecal.presetId === pr.id
                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            {pr.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedDecal.type === 'STATIC_TEXT' && (
                      <input
                        type="text"
                        maxLength={22}
                        value={selectedDecal.text || ''}
                        onChange={(e) => updateDecal(selectedDecal.id, { text: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white uppercase"
                        placeholder="TEXTO PATROCINADOR"
                      />
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label className="block">
                        <span className="text-slate-400 text-[11px] block mb-1">
                          Escala: {Math.round((selectedDecal.scale ?? 1) * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0.4"
                          max="2.2"
                          step="0.05"
                          value={selectedDecal.scale ?? 1}
                          onChange={(e) => updateDecal(selectedDecal.id, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-amber-400"
                        />
                      </label>

                      <label className="block">
                        <span className="text-slate-400 text-[11px] block mb-1">
                          Rotación: {selectedDecal.rotationDeg || 0}°
                        </span>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          step="1"
                          value={selectedDecal.rotationDeg || 0}
                          onChange={(e) => updateDecal(selectedDecal.id, { rotationDeg: parseInt(e.target.value, 10) })}
                          className="w-full accent-amber-400"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 4: VARIABLE SLOTS & AUTO-CONDENSE (OWAYO) ================= */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">Slots Paramétricos Owayo (`Single-Design-ID`)</strong>
                  Aquí defines la regla tipográfica <strong>una sola vez</strong>. Los 20+ nombres y números del equipo se inyectan dinámicamente sin duplicar imágenes.
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">Tipografía Deportiva Oficial</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SPORT_FONTS.map((f) => {
                      const active = design.variableSlots.playerNumberBack.fontFamily === f.family;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            onCommitDesign({
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: { ...design.variableSlots.playerNameBack, fontFamily: f.family },
                                playerNumberBack: { ...design.variableSlots.playerNumberBack, fontFamily: f.family },
                                playerNumberFront: { ...design.variableSlots.playerNumberFront, fontFamily: f.family },
                              },
                            })
                          }
                          className={`p-2.5 rounded-xl border text-center ${
                            active
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-950 text-slate-200 border-slate-800'
                          }`}
                          style={{ fontFamily: f.family }}
                        >
                          <span className="text-lg block leading-none">{f.label} 10</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color de Dorsal y Borde */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1.5">Relleno Dorsal</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['#f8fafc', '#facc15', '#0f172a', '#dc2626', '#06b6d4'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            onCommitDesign({
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: { ...design.variableSlots.playerNameBack, fillHex: hex },
                                playerNumberBack: { ...design.variableSlots.playerNumberBack, fillHex: hex },
                              },
                            })
                          }
                          className={`w-7 h-7 rounded-lg border-2 ${
                            design.variableSlots.playerNumberBack.fillHex === hex
                              ? 'border-amber-400 scale-110'
                              : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1.5">Contorno (Stroke)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['#0f172a', '#f8fafc', '#facc15', '#1d4ed8'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            onCommitDesign({
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: { ...design.variableSlots.playerNameBack, outlineHex: hex },
                                playerNumberBack: { ...design.variableSlots.playerNumberBack, outlineHex: hex },
                              },
                            })
                          }
                          className={`w-7 h-7 rounded-lg border-2 ${
                            design.variableSlots.playerNumberBack.outlineHex === hex
                              ? 'border-amber-400 scale-110'
                              : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prueba en vivo de Auto-Condense para apellidos largos */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Compresión Horizontal (`autoCondense`)</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      scaleX:{' '}
                      {computeAutoCondenseScaleX(
                        activePlayer.name,
                        design.variableSlots.playerNameBack.maxWidthMm,
                        design.variableSlots.playerNameBack.capHeightMm
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Haz clic para probar cómo la espalda adapta nombres cortos y compuestos sin invadir las sisas:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    { roster.slice(0, 4).map((r, idx) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setActiveRosterIndex(idx);
                          setCameraPreset('back');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                          activeRosterIndex === idx
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        #{r.number} {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 5: ROSTER DE EQUIPO CON TABLA RESPONSIVA ================= */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-300 block">{currentTier.label}</span>
                    <span className="text-[11px] text-slate-300">
                      Haz clic en el ojo de cualquier fila para inspeccionar su camiseta en vivo.
                    </span>
                  </div>
                  <span className="text-base font-black text-white">${unitPrice.toFixed(2)}/ud</span>
                </div>

                {/* Tabla Semántica Responsiva con Sticky Headers & Container Queries */}
                <div
                  tabIndex={0}
                  role="region"
                  aria-labelledby="roster-table-caption"
                  className="roster-table-wrapper rounded-2xl border border-slate-800 bg-slate-950"
                >
                  <table className="roster-data-table text-left text-xs">
                    <caption id="roster-table-caption" className="sr-only">
                      Lista de tallas, cortes, nombres y dorsales del equipo vinculada al diseño {design.designId}
                    </caption>
                    <thead className="bg-slate-900 text-[10px] uppercase text-slate-400">
                      <tr>
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Corte</th>
                        <th className="py-2 px-2">Talla</th>
                        <th className="py-2 px-2">Cant.</th>
                        <th className="py-2 px-2">Nombre</th>
                        <th className="py-2 px-2">Dorsal</th>
                        <th className="py-2 px-2">Ver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {roster.map((row, idx) => {
                        const isPreviewing = activeRosterIndex === idx;
                        return (
                          <tr
                            key={row.id}
                            className={isPreviewing ? 'bg-amber-400/10' : 'hover:bg-slate-900/50'}
                          >
                            <th scope="row" className="py-2 px-2 font-mono text-[11px] text-amber-400">
                              J{idx + 1}
                            </th>
                            <td className="py-1.5 px-1.5">
                              <select
                                value={row.cut}
                                onChange={(e) =>
                                  onUpdateRoster(
                                    roster.map((r, i) => (i === idx ? { ...r, cut: e.target.value } : r))
                                  )
                                }
                                className="bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] text-white"
                              >
                                {CUT_OPTIONS.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-1.5 px-1.5">
                              <select
                                value={row.size}
                                onChange={(e) =>
                                  onUpdateRoster(
                                    roster.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r))
                                  )
                                }
                                className="bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] font-bold text-white"
                              >
                                {SIZE_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-1.5 px-1.5">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={row.qty}
                                onChange={(e) =>
                                  onUpdateRoster(
                                    roster.map((r, i) =>
                                      i === idx ? { ...r, qty: Math.max(1, parseInt(e.target.value || '1', 10)) } : r
                                    )
                                  )
                                }
                                className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] text-center font-mono text-white"
                              />
                            </td>
                            <td className="py-1.5 px-1.5">
                              <input
                                type="text"
                                maxLength={20}
                                value={row.name}
                                onChange={(e) =>
                                  onUpdateRoster(
                                    roster.map((r, i) =>
                                      i === idx ? { ...r, name: e.target.value.toUpperCase() } : r
                                    )
                                  )
                                }
                                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold uppercase text-white"
                              />
                            </td>
                            <td className="py-1.5 px-1.5">
                              <input
                                type="text"
                                maxLength={3}
                                value={row.number}
                                onChange={(e) =>
                                  onUpdateRoster(
                                    roster.map((r, i) => (i === idx ? { ...r, number: e.target.value } : r))
                                  )
                                }
                                className="w-11 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] text-center font-mono font-bold text-white"
                              />
                            </td>
                            <td className="py-1.5 px-1.5">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRosterIndex(idx);
                                    setCameraPreset('back');
                                  }}
                                  className={`p-1 rounded-lg ${
                                    isPreviewing ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                                  }`}
                                  title="Previsualizar este jugador en el modelo"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {roster.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = roster.filter((_, i) => i !== idx);
                                      onUpdateRoster(next);
                                      if (activeRosterIndex >= next.length) setActiveRosterIndex(0);
                                    }}
                                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                                    title="Quitar fila"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRoster([
                        ...roster,
                        {
                          id: `r_${Date.now()}`,
                          cut: 'MEN_PRO_SLIM',
                          size: 'L',
                          qty: 1,
                          name: 'NUEVO JUGADOR',
                          number: String(roster.length + 1),
                          role: 'Titular',
                        },
                      ])
                    }
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    Añadir Fila
                  </button>

                  <span className="text-xs text-slate-400 font-mono">
                    Total lote: <strong className="text-white">{totalUnits} prendas</strong>
                  </span>
                </div>

                {/* Importador rápido desde Excel / CSV */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Pegado Masivo desde Excel / WhatsApp (`NOMBRE, NUMERO, TALLA`)
                  </span>
                  <textarea
                    rows={2}
                    value={csvQuickInput}
                    onChange={(e) => setCsvQuickInput(e.target.value)}
                    placeholder={'GÓMEZ, 8, M\nTORRES, 21, XL'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <button
                    type="button"
                    onClick={handleBulkPasteCSV}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400"
                  >
                    Importar Filas al Roster
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Navigation inside Sidebar */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => handleStepSelect(Math.max(1, step - 1))}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-35"
            >
              ← Anterior
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">{totalUnits} uds • -{currentTier.discountPct}%</span>
              <span className="text-base font-black text-white">${totalPrice.toFixed(2)} USD</span>
            </div>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => handleStepSelect(step + 1)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase"
              >
                Siguiente Paso →
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenProductionModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black uppercase"
              >
                Generar Orden →
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
