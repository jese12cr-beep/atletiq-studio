import React, { Suspense, lazy, useMemo, useRef, useState } from 'react';
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
  Copy,
  FlipHorizontal2,
  FlipVertical2,
  ArrowUp,
  ArrowDown,
  Search,
  Eraser,
} from 'lucide-react';
import Interactive2DLab from '../../engine/compositor/Interactive2DLab';
import LayerStack25DViewer from '../../engine/compositor/LayerStack25DViewer';

const GarmentCanvas3D = lazy(() => import('../../engine/viewer3d/GarmentCanvas3D'));
import {
  ENGINE_PRODUCTS,
  PANTONE_CM5_PALETTE,
  getDesignsForProduct,
  ZONE_SURFACE_PATTERNS,
  VECTOR_CREST_PRESETS,
  FABRIC_WEAVES,
  SPORT_FONTS,
  VOLUME_TIERS,
} from '../../engine/core/designStore';
import { processUploadedArtwork, calculateEffectiveDpi } from '../../engine/core/dpiValidator';
import {
  computeAutoCondenseScaleX,
  getDroppablePanelsForProduct,
  getPartSpec,
} from '../../engine/core/boundingBoxMath';

const STEPS = [
  { id: 1, label: '1. Modelo & Diseño', icon: Layers },
  { id: 2, label: '2. Pantone (167)', icon: Palette },
  { id: 3, label: '3. PNG / SVG Libre', icon: Shield },
  { id: 4, label: '4. Textos & Dorsales', icon: Type },
  { id: 5, label: '5. Roster Equipo', icon: Users },
];

const CUT_OPTIONS = [
  { value: 'MEN_PRO_SLIM', label: 'Hombre Slim' },
  { value: 'MEN_CLASSIC', label: 'Hombre Clásico' },
  { value: 'WOMEN_FIT', label: 'Mujer Entallado' },
  { value: 'YOUTH_KIDS', label: 'Infantil / Juvenil' },
];

const SIZE_OPTIONS = ['128', '140', '152', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const COLOR_ZONES_META = [
  { id: 'primary', label: 'Zona A • Principal', short: 'A' },
  { id: 'secondary', label: 'Zona B • Secundario', short: 'B' },
  { id: 'accents', label: 'Zona C • Tercer/Filete', short: 'C' },
  { id: 'quaternary', label: 'Zona D • Cuarto', short: 'D' },
  { id: 'collar', label: 'Cuello (K)', short: 'K' },
  { id: 'sleeves', label: 'Ribetes / Sisas', short: 'SL' },
];

const PANEL_TO_CAMERA = {
  front: 'front',
  back: 'back',
  left_arm: 'left_sleeve',
  right_arm: 'right_sleeve',
  collar: 'front',
};

function rangeVars(val, min, max) {
  return {
    '--attr-min': min,
    '--attr-max': max,
    '--control-value': val,
  };
}

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
  const [viewportMode, setViewportMode] = useState('3d');
  const [cameraPreset, setCameraPreset] = useState('three_quarter');
  const [autoRotate, setAutoRotate] = useState(false);
  const [panel2D, setPanel2D] = useState('front');
  const [selectedDecalId, setSelectedDecalId] = useState('decal_club_crest');
  const [activeRosterIndex, setActiveRosterIndex] = useState(0);
  const [activeColorZone, setActiveColorZone] = useState('primary');
  const [paletteFilterMode, setPaletteFilterMode] = useState('all'); // 'all' | 'cm5' | 'special'
  const [colorSearch, setColorSearch] = useState('');
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [csvQuickInput, setCsvQuickInput] = useState('');

  const fileInputRef = useRef(null);
  const canvasSnapshotRef = useRef(null);

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];
  const isFaux3DAccessory = currentProduct.renderMode === 'FAUX_3D_LAYERED_WEBP';

  const availableFishDesigns = useMemo(
    () => getDesignsForProduct(design.productModelId),
    [design.productModelId]
  );
  const droppablePanels = useMemo(
    () => getDroppablePanelsForProduct(design.productModelId),
    [design.productModelId]
  );

  const filteredPalette = useMemo(() => {
    const q = colorSearch.trim().toLowerCase();
    return PANTONE_CM5_PALETTE.filter((c) => {
      if (paletteFilterMode === 'cm5' && c.isSpecial) return false;
      if (paletteFilterMode === 'special' && !c.isSpecial) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.pantone.toLowerCase().includes(q) ||
        c.hex.toLowerCase().includes(q)
      );
    });
  }, [paletteFilterMode, colorSearch]);

  const uploadedLibrary = useMemo(() => Object.values(artworkRegistry || {}), [artworkRegistry]);

  const activePlayer = roster[activeRosterIndex] || roster[0] || {
    name: 'RODRÍGUEZ',
    number: '10',
    size: 'L',
  };
  const totalUnits = roster.reduce((acc, r) => acc + (Number(r.qty) || 1), 0);
  const currentTier =
    VOLUME_TIERS.find((t) => totalUnits >= t.min && totalUnits <= t.max) || VOLUME_TIERS[0];
  const unitPrice = +(currentProduct.basePrice * (1 - currentTier.discountPct / 100)).toFixed(2);
  const totalPrice = +(unitPrice * totalUnits).toFixed(2);

  const selectedDecal =
    (design.decals || []).find((d) => d.id === selectedDecalId) || (design.decals || [])[0] || null;

  const updateColorZone = (zoneKey, colorObj) => {
    onCommitDesign({
      ...design,
      colorZones: {
        ...design.colorZones,
        [zoneKey]: {
          hex: colorObj.hex,
          pantone: colorObj.pantone || 'PMS Custom',
          code: colorObj.code || colorObj.name || 'Custom',
        },
      },
    });
  };

  const updateDecal = (decalId, patch, recordHistory = false) => {
    onCommitDesign(
      {
        ...design,
        decals: (design.decals || []).map((d) => (d.id === decalId ? { ...d, ...patch } : d)),
      },
      recordHistory
    );
  };

  const insertArtworkOnPanel = (processed, targetPanel = panel2D) => {
    const validPanel = droppablePanels.some((p) => p.panelId === targetPanel) ? targetPanel : 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const defaultWidthMm =
      validPanel === 'collar' ? 38 : validPanel.includes('arm') ? 74 : 115;
    const defaultHeightMm = Math.max(12, Math.round(defaultWidthMm / (processed.aspectRatio || 1)));

    const maxZ = (design.decals || []).reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);
    const newDecal = {
      id: `decal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      type: processed.isVector ? 'UPLOADED_VECTOR' : 'UPLOADED_RASTER',
      artworkId: processed.artworkId,
      label: processed.fileName.replace(/\.[^.]+$/, '').slice(0, 22),
      panel: validPanel,
      centerMm: {
        x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
        y: +(spec.heightMm * (validPanel === 'front' ? 0.34 : 0.52)).toFixed(1),
      },
      sizeMm: { width: defaultWidthMm, height: defaultHeightMm },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      blendMode: 'source-over',
      flipX: false,
      flipY: false,
      removeWhiteBg: false,
      whiteThreshold: 238,
      invertImage: false,
      tintHex: '',
      zIndex: maxZ + 5,
      isVector: processed.isVector,
      widthPx: processed.widthPx,
    };

    return newDecal;
  };

  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      /\.(png|svg|webp|jpe?g)$/i.test(f.name) || f.type.startsWith('image/')
    );
    if (files.length === 0) return;

    const addedDecals = [];
    for (const file of files) {
      const processed = await processUploadedArtwork(file);
      onRegisterArtwork(processed.artworkId, processed);
      addedDecals.push(insertArtworkOnPanel(processed, panel2D));
    }

    if (addedDecals.length > 0) {
      onCommitDesign({
        ...design,
        decals: [...(design.decals || []), ...addedDecals],
      });
      const last = addedDecals[addedDecals.length - 1];
      setSelectedDecalId(last.id);
      setCameraPreset(PANEL_TO_CAMERA[last.panel] || 'front');
    }
  };

  const handleUploadInput = async (e) => {
    await handleFilesSelected(e.target.files);
    e.target.value = '';
  };

  const handleAddPresetCrest = (preset) => {
    const validPanel = droppablePanels.some((p) => p.panelId === panel2D) ? panel2D : 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const size = validPanel === 'collar' ? 28 : 72;
    const maxZ = (design.decals || []).reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);

    const newDecal = {
      id: `crest_${Date.now().toString(36)}`,
      type: 'PRESET_CREST',
      presetId: preset.id,
      label: preset.name,
      panel: validPanel,
      centerMm: {
        x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
        y: +(spec.heightMm * 0.32).toFixed(1),
      },
      sizeMm: { width: size, height: size },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      blendMode: 'source-over',
      flipX: false,
      flipY: false,
      tintHex: '',
      zIndex: maxZ + 5,
      isVector: true,
      widthPx: 3200,
    };

    onCommitDesign({
      ...design,
      decals: [...(design.decals || []), newDecal],
    });
    setSelectedDecalId(newDecal.id);
    setCameraPreset(PANEL_TO_CAMERA[validPanel] || 'front');
  };

  const handleAddCustomTextObject = () => {
    const validPanel = droppablePanels.some((p) => p.panelId === panel2D) ? panel2D : 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const maxZ = (design.decals || []).reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);

    const newText = {
      id: `txt_${Date.now().toString(36)}`,
      type: 'STATIC_TEXT',
      text: validPanel === 'collar' ? 'EST. 2026' : 'CLUB OFICIAL',
      fontFamily: "'Bebas Neue', sans-serif",
      fillHex: '#ffffff',
      outlineHex: '#0c2340',
      outlineWidthMm: 2.2,
      outline2Hex: '',
      archDeg: 0,
      letterSpacingMm: 0.8,
      label: 'Texto Libre',
      panel: validPanel,
      centerMm: {
        x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
        y: +(spec.heightMm * (validPanel === 'collar' ? 0.5 : 0.45)).toFixed(1),
      },
      sizeMm: {
        width: validPanel === 'collar' ? 110 : 210,
        height: validPanel === 'collar' ? 24 : 42,
      },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      blendMode: 'source-over',
      zIndex: maxZ + 5,
      isVector: true,
      widthPx: 3200,
    };

    onCommitDesign({
      ...design,
      decals: [...(design.decals || []), newText],
    });
    setSelectedDecalId(newText.id);
    setStep(3);
    setCameraPreset(PANEL_TO_CAMERA[validPanel] || 'front');
  };

  const handleMoveDecalToPanel = (decal, nextPanel) => {
    const oldSpec = getPartSpec(design.productModelId, decal.panel || 'front');
    const newSpec = getPartSpec(design.productModelId, nextPanel);
    const relY = Math.max(0.15, Math.min(0.82, decal.centerMm.y / oldSpec.heightMm));

    updateDecal(
      decal.id,
      {
        panel: nextPanel,
        centerMm: {
          x: +(newSpec.widthMm * newSpec.snapCenterU).toFixed(1),
          y: +(newSpec.heightMm * relY).toFixed(1),
        },
      },
      true
    );
    setPanel2D(nextPanel);
    setCameraPreset(PANEL_TO_CAMERA[nextPanel] || 'front');
  };

  const handleCloneToOppositeSleeve = (decal) => {
    if (decal.panel !== 'left_arm' && decal.panel !== 'right_arm') return;
    const targetPanel = decal.panel === 'left_arm' ? 'right_arm' : 'left_arm';
    const targetSpec = getPartSpec(design.productModelId, targetPanel);
    const maxZ = (design.decals || []).reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);

    const cloned = {
      ...decal,
      id: `clone_${Date.now().toString(36)}`,
      panel: targetPanel,
      label: `${decal.label} (${targetSpec.shortLabel})`,
      centerMm: {
        x: +(targetSpec.widthMm * targetSpec.snapCenterU).toFixed(1),
        y: decal.centerMm.y,
      },
      zIndex: maxZ + 5,
    };

    onCommitDesign({
      ...design,
      decals: [...(design.decals || []), cloned],
    });
    setSelectedDecalId(cloned.id);
    setPanel2D(targetPanel);
    setCameraPreset(PANEL_TO_CAMERA[targetPanel]);
  };

  const handleDuplicateDecal = (decal) => {
    const maxZ = (design.decals || []).reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);
    const copy = {
      ...decal,
      id: `dup_${Date.now().toString(36)}`,
      label: `${decal.label} Copia`,
      centerMm: {
        x: +(decal.centerMm.x + 18).toFixed(1),
        y: +(decal.centerMm.y + 18).toFixed(1),
      },
      zIndex: maxZ + 5,
    };
    onCommitDesign({
      ...design,
      decals: [...(design.decals || []), copy],
    });
    setSelectedDecalId(copy.id);
  };

  const handleRandomProPalette = () => {
    const mainPool = PANTONE_CM5_PALETTE.filter((c) => !c.isSpecial);
    const pick = () => mainPool[Math.floor(Math.random() * mainPool.length)];
    const c1 = pick();
    const c2 = pick();
    const c3 = pick();
    const pat = availableFishDesigns[Math.floor(Math.random() * availableFishDesigns.length)];
    onCommitDesign({
      ...design,
      patternId: pat.id,
      colorZones: {
        ...design.colorZones,
        primary: { hex: c1.hex, pantone: c1.pantone, code: c1.code },
        secondary: { hex: c2.hex, pantone: c2.pantone, code: c2.code },
        accents: { hex: c3.hex, pantone: c3.pantone, code: c3.code },
        collar: { hex: c3.hex, pantone: c3.pantone, code: c3.code },
        sleeves: { hex: c2.hex, pantone: c2.pantone, code: c2.code },
      },
    });
  };

  const handleSelectProduct = (prod) => {
    const nextDesigns = getDesignsForProduct(prod.id);
    const validDesignId = nextDesigns.some((d) => d.id === design.patternId)
      ? design.patternId
      : nextDesigns[0]?.id || 'style';

    onCommitDesign({
      ...design,
      productModelId: prod.id,
      patternId: validDesignId,
      fabricWeaveId: prod.id === 'basketball_b6_hero' ? 'cooldry_hex' : 'ts_tex_football',
    });
    setPanel2D('front');
  };

  const handleStepSelect = (nextStep) => {
    setStep(nextStep);
    if (nextStep === 4 || nextStep === 5) {
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

  const quickTintColors = [
    '#ffffff',
    '#101820',
    '#ffcd00',
    '#c8102e',
    '#0033a0',
    '#00a3e0',
    '#00965e',
    '#ff8200',
    '#44d62c',
    '#ff0090',
  ];

  return (
    <div className="h-dvh w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
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
              ATLETIQ <span className="text-amber-400">ENGINE v4.0</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
              MIRL 1:1 • {design.designId}
            </span>
          </div>
        </div>

        {/* 5-Step Progress Navigation */}
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

        {/* Right Actions: Undo/Redo + Print-Ready + Cart */}
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
        {/* LEFT/CENTER STAGE */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,#1e293b_0%,#020617_78%)] flex flex-col justify-between min-h-[340px] overflow-hidden">
          {/* Top Floating HUD */}
          <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <strong className="text-white">{currentProduct.name}</strong>
                <span className="text-slate-400 ml-2 hidden sm:inline">
                  • Jugador: <strong className="text-amber-400">#{activePlayer.number} {activePlayer.name}</strong> ({activePlayer.size})
                </span>
              </div>
            </div>

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
                  3D Escaneo Real
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('2d')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === '2d' ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  Molde Plano 2D
                </button>
              </div>
            ) : (
              <span className="pointer-events-auto px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-bold">
                ⚡ Motor 2.5D Capas (&lt; 2 ms GPU Tint)
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
                    Descomprimiendo malla 3D .mirl...
                  </div>
                }
              >
                <GarmentCanvas3D
                  design={design}
                  activePlayer={activePlayer}
                  artworkRegistry={artworkRegistry}
                  cameraPreset={cameraPreset}
                  autoRotate={autoRotate}
                  selectedDecalId={selectedDecalId}
                  canvasSnapshotRef={canvasSnapshotRef}
                  onSelectDecalFrom3D={(decalId, hitPanel) => {
                    setSelectedDecalId(decalId);
                    setPanel2D(hitPanel);
                    if (step !== 3 && step !== 4) setStep(3);
                  }}
                  onUpdateDecalFrom3D={updateDecal}
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

          {/* Bottom Floating Camera / Piece Bar */}
          {!isFaux3DAccessory && (
            <div className="p-3 flex flex-wrap items-center justify-center gap-1.5 z-10">
              {viewportMode === '3d' ? (
                <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-2xl">
                  {[
                    { id: 'three_quarter', label: '3/4 Estudio' },
                    { id: 'front', label: 'Frente 0°' },
                    { id: 'back', label: 'Espalda 180°' },
                    ...(droppablePanels.some((p) => p.panelId === 'left_arm')
                      ? [
                          { id: 'left_sleeve', label: 'Manga Izq.' },
                          { id: 'right_sleeve', label: 'Manga Der.' },
                        ]
                      : []),
                    { id: 'macro_weave', label: '🔍 Macro Tejido' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => {
                        setAutoRotate(false);
                        setCameraPreset(cam.id);
                      }}
                      className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
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
                <div className="flex flex-wrap items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-2xl">
                  {droppablePanels.map((p) => (
                    <button
                      key={p.panelId}
                      type="button"
                      onClick={() => setPanel2D(p.panelId)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        panel2D === p.panelId
                          ? 'bg-sky-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.shortLabel} ({(p.widthMm / 10).toFixed(0)}×{(p.heightMm / 10).toFixed(0)}cm)
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <aside className="w-full lg:w-[460px] xl:w-[495px] shrink-0 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col max-h-[50dvh] lg:max-h-none">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 select-text">
            {/* ================= STEP 1: MODELO .MIRL, 15 DISEÑOS .FISH Y TEJIDO ================= */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                    1. Selecciona Prenda (Escaneo 3D Real `.mirl`)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ENGINE_PRODUCTS.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          design.productModelId === prod.id
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-amber-400 block truncate">{prod.badge}</span>
                        <span className="text-xs font-bold block mt-0.5 leading-snug">{prod.name}</span>
                        <span className="text-[11px] text-slate-400">${prod.basePrice.toFixed(2)} base</span>
                      </button>
                    ))}
                  </div>
                </div>

                {!isFaux3DAccessory && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          2. Diseños Oficiales Multi-Pieza ({availableFishDesigns.length})
                        </h3>
                        <button
                          type="button"
                          onClick={handleRandomProPalette}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Combinación Pro
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableFishDesigns.map((pat) => {
                          const isActive = design.patternId === pat.id;
                          return (
                            <button
                              key={pat.id}
                              type="button"
                              onClick={() => onCommitDesign({ ...design, patternId: pat.id })}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isActive
                                  ? 'bg-slate-800 border-amber-400 text-white ring-1 ring-amber-400/50'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1.5">
                                <span
                                  className="h-2 flex-1 rounded-full"
                                  style={{ backgroundColor: design.colorZones.primary?.hex }}
                                />
                                {pat.baseColors.includes('B') && (
                                  <span
                                    className="h-2 flex-1 rounded-full"
                                    style={{ backgroundColor: design.colorZones.secondary?.hex }}
                                  />
                                )}
                                {pat.baseColors.includes('C') && (
                                  <span
                                    className="h-2 flex-1 rounded-full"
                                    style={{ backgroundColor: design.colorZones.accents?.hex }}
                                  />
                                )}
                              </div>
                              <span className="text-xs font-bold block truncate">{pat.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Zonas {pat.baseColors.join('+')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Textura Geométrica Sublimada sobre Zona A */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-2">
                        3. Trama Sublimada Opcional (Sobre Fondo)
                      </h3>
                      <div className="grid grid-cols-3 gap-1.5">
                        {ZONE_SURFACE_PATTERNS.map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => onCommitDesign({ ...design, surfacePatternId: sp.id })}
                            className={`p-2 rounded-xl border text-left ${
                              (design.surfacePatternId || 'none') === sp.id
                                ? 'bg-amber-400/15 border-amber-400 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[11px] font-bold block truncate">{sp.name}</span>
                          </button>
                        ))}
                      </div>
                      {design.surfacePatternId && design.surfacePatternId !== 'none' && (
                        <label className="block mt-2">
                          <span className="text-[11px] text-slate-400 flex justify-between">
                            <span>Intensidad de trama</span>
                            <span className="font-mono text-amber-400">
                              {Math.round((design.surfacePatternOpacity ?? 0.16) * 100)}%
                            </span>
                          </span>
                          <input
                            type="range"
                            min="0.04"
                            max="0.45"
                            step="0.02"
                            value={design.surfacePatternOpacity ?? 0.16}
                            style={rangeVars(design.surfacePatternOpacity ?? 0.16, 0.04, 0.45)}
                            onChange={(e) =>
                              onCommitDesign(
                                { ...design, surfacePatternOpacity: parseFloat(e.target.value) },
                                false
                              )
                            }
                            className="studio-range"
                          />
                        </label>
                      )}
                    </div>

                    {/* Física del Tejido Deportivo */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-2">
                        4. Tejido Técnico Real (BumpMaps `Stoffe/v2`)
                      </h3>
                      <div className="space-y-1.5">
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
                            <div className="pr-2">
                              <span className="text-xs font-bold block">{w.name}</span>
                              <span className="text-[11px] text-slate-400">{w.desc}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 shrink-0">
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

            {/* ================= STEP 2: SISTEMA PANTONE® / CM5 DE 167 COLORES ================= */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                    Zona de Color Independiente
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_ZONES_META.map((z) => {
                      const zVal = design.colorZones[z.id] || design.colorZones.primary;
                      const active = activeColorZone === z.id;
                      return (
                        <button
                          key={z.id}
                          type="button"
                          onClick={() => setActiveColorZone(z.id)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                            active
                              ? 'bg-slate-800 border-amber-400 text-white ring-1 ring-amber-400/50'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="pantone-dynamic-chip w-5 h-5 rounded-md border border-white/20 shrink-0 flex items-center justify-center text-[9px] font-black"
                              style={{ '--swatch-bg': zVal?.hex || '#0033a0' }}
                            >
                              {z.short}
                            </span>
                            <span className="truncate">{z.label}</span>
                          </span>
                          <span className="text-[9px] font-mono text-amber-400 shrink-0">
                            {zVal?.pantone?.replace('PMS ', '') || ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Buscador Pantone / HEX + Selector Libre RGB */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        placeholder="Buscar PMS 286, Rojo, Marino, #hex..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <label
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold cursor-pointer shrink-0"
                      title="Elegir color HEX personalizado libre"
                    >
                      <input
                        type="color"
                        value={design.colorZones[activeColorZone]?.hex || '#0033a0'}
                        onChange={(e) =>
                          updateColorZone(activeColorZone, {
                            hex: e.target.value,
                            pantone: `HEX ${e.target.value.toUpperCase()}`,
                            code: 'Personalizado',
                          })
                        }
                        className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span>HEX Libre</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {[
                      { id: 'all', label: 'Todos (167)' },
                      { id: 'cm5', label: 'Matriz CM5 (152)' },
                      { id: 'special', label: 'Flúor / Metálicos (15)' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaletteFilterMode(tab.id)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                          paletteFilterMode === tab.id
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matriz Cromática de 5 Columnas de Sombra (Exacta a CM5 Owayo + Pantone PMS) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">
                      Activo:{' '}
                      <strong className="text-white">
                        {design.colorZones[activeColorZone]?.code || 'Color'}
                      </strong>
                    </span>
                    <span className="font-mono text-amber-400">
                      {design.colorZones[activeColorZone]?.pantone} •{' '}
                      {design.colorZones[activeColorZone]?.hex?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                    {filteredPalette.map((c) => {
                      const isSel =
                        design.colorZones[activeColorZone]?.hex?.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={`${c.code}_${c.hex}`}
                          type="button"
                          onClick={() => updateColorZone(activeColorZone, c)}
                          title={`${c.name} (${c.code}) — ${c.pantone} — ${c.hex.toUpperCase()}`}
                          style={{ '--swatch-bg': c.hex }}
                          className={`pantone-dynamic-chip group relative h-11 rounded-xl border flex flex-col items-center justify-center px-1 transition-transform ${
                            isSel
                              ? 'border-amber-400 ring-2 ring-amber-400 scale-[1.04] z-10'
                              : 'border-white/15 hover:scale-[1.03]'
                          }`}
                        >
                          {isSel ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[8px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-tight text-center truncate w-full">
                              {c.pantone.replace('PMS ', '')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ESTUDIO PNG & SVG MULTI-PIEZA SIN LÍMITES ================= */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Zona Drag & Drop Multi-Archivo */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverUpload(true);
                  }}
                  onDragLeave={() => setIsDragOverUpload(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragOverUpload(false);
                    await handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${
                    isDragOverUpload
                      ? 'border-amber-400 bg-amber-400/15'
                      : 'border-slate-700 hover:border-amber-400 bg-slate-950/80'
                  }`}
                >
                  <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs font-black text-white block">
                    Arrastra o Sube múltiples archivos PNG, SVG, WebP o JPG
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Vectorial SVG infinito • Auto-recorte transparente • Colocación en Frente, Espalda, Mangas y Cuello
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
                    className="hidden"
                    onChange={handleUploadInput}
                  />
                </div>

                {/* Selector de Modo de Libertad de Impresión */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'SOFT_WARN', label: 'Aviso Costura' },
                    { id: 'ALL_OVER', label: 'All-Over Libre' },
                    { id: 'HARD_CLAMP', label: 'Tope Estricto' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onCommitDesign({ ...design, bleedEnforcement: mode.id })}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold ${
                        (design.bleedEnforcement || 'SOFT_WARN') === mode.id
                          ? 'bg-sky-400 text-slate-950 border-sky-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Biblioteca Persistente de Archivos Subidos + Escudos Vectoriales */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  {uploadedLibrary.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 block mb-1.5">
                        Mis Archivos Subidos ({uploadedLibrary.length}) — Clic para insertar otra copia
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {uploadedLibrary.map((art) => (
                          <button
                            key={art.artworkId}
                            type="button"
                            onClick={() => {
                              const next = insertArtworkOnPanel(art, panel2D);
                              onCommitDesign({
                                ...design,
                                decals: [...(design.decals || []), next],
                              });
                              setSelectedDecalId(next.id);
                            }}
                            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 flex flex-col items-center gap-1"
                            title={`Insertar ${art.fileName} en ${panel2D}`}
                          >
                            <img
                              src={art.previewUrl}
                              alt={art.fileName}
                              className="w-9 h-9 object-contain"
                            />
                            <span className="text-[9px] font-mono text-slate-300 truncate w-full text-center">
                              {art.isVector ? 'SVG' : 'PNG'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-300">
                        Escudos Vectoriales & Textos Rápidos
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCustomTextObject}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Añadir Texto Libre
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {VECTOR_CREST_PRESETS.map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => handleAddPresetCrest(pr)}
                          className="py-1.5 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 truncate"
                        >
                          + {pr.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de Capas Activas en todas las piezas */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                    Capas en Prenda ({(design.decals || []).length})
                  </span>
                  <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-1">
                    {(design.decals || []).map((d) => {
                      const dpiInfo = calculateEffectiveDpi(
                        d.widthPx || 1600,
                        d.sizeMm.width,
                        d.scale ?? 1,
                        d.isVector
                      );
                      const pSpec = getPartSpec(design.productModelId, d.panel || 'front');
                      const isSel = selectedDecal?.id === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDecalId(d.id);
                            setPanel2D(d.panel || 'front');
                            setCameraPreset(PANEL_TO_CAMERA[d.panel || 'front'] || 'front');
                          }}
                          className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between gap-2 ${
                            isSel
                              ? 'bg-slate-800 border-amber-400'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{d.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {pSpec.shortLabel} • {dpiInfo.dpi === 999 ? 'SVG Vector' : `${dpiInfo.dpi} DPI`}
                              {(d.opacity ?? 1) < 0.99 ? ` • Marca Agua ${Math.round((d.opacity ?? 1) * 100)}%` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                updateDecal(d.id, { zIndex: (d.zIndex ?? 10) + 6 }, true);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Subir capa"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                updateDecal(d.id, { zIndex: Math.max(1, (d.zIndex ?? 10) - 6) }, true);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Bajar capa"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleDuplicateDecal(d);
                              }}
                              className="p-1 text-slate-400 hover:text-sky-400"
                              title="Duplicar capa"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                onCommitDesign({
                                  ...design,
                                  decals: design.decals.filter((x) => x.id !== d.id),
                                });
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="Eliminar capa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inspector Avanzado de la Capa Seleccionada */}
                {selectedDecal && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-black text-amber-400 truncate">
                        Editando: {selectedDecal.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const spec = getPartSpec(design.productModelId, selectedDecal.panel || 'front');
                            updateDecal(
                              selectedDecal.id,
                              {
                                centerMm: {
                                  ...selectedDecal.centerMm,
                                  x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
                                },
                              },
                              true
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex items-center gap-1"
                        >
                          <AlignCenterHorizontal className="w-3 h-3 text-sky-400" />
                          Centrar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(selectedDecal.id, { flipX: !selectedDecal.flipX }, true)
                          }
                          className={`p-1 rounded-lg border ${
                            selectedDecal.flipX
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                          title="Voltear horizontalmente"
                        >
                          <FlipHorizontal2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(selectedDecal.id, { flipY: !selectedDecal.flipY }, true)
                          }
                          className={`p-1 rounded-lg border ${
                            selectedDecal.flipY
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                          title="Voltear verticalmente"
                        >
                          <FlipVertical2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mover a cualquier pieza (Frente, Espalda, Manga Izq., Manga Der., Cuello) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Pieza de Destino en la Prenda
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {droppablePanels.map((p) => (
                          <button
                            key={p.panelId}
                            type="button"
                            onClick={() => handleMoveDecalToPanel(selectedDecal, p.panelId)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                              (selectedDecal.panel || 'front') === p.panelId
                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {p.shortLabel}
                          </button>
                        ))}
                      </div>

                      {(selectedDecal.panel === 'left_arm' || selectedDecal.panel === 'right_arm') && (
                        <button
                          type="button"
                          onClick={() => handleCloneToOppositeSleeve(selectedDecal)}
                          className="mt-1.5 w-full py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Clonar Simétrico en la Manga Opuesta
                        </button>
                      )}
                    </div>

                    {/* Edición específica si es TEXTO LIBRE */}
                    {selectedDecal.type === 'STATIC_TEXT' && (
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <input
                          type="text"
                          maxLength={32}
                          value={selectedDecal.text || ''}
                          onChange={(e) =>
                            updateDecal(selectedDecal.id, {
                              text: e.target.value,
                              label: e.target.value.slice(0, 18) || 'Texto',
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                          placeholder="Escribe lema, sponsor o iniciales..."
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={selectedDecal.fontFamily || SPORT_FONTS[0].family}
                            onChange={(e) =>
                              updateDecal(selectedDecal.id, { fontFamily: e.target.value }, true)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            {SPORT_FONTS.map((f) => (
                              <option key={f.id} value={f.family}>
                                {f.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                            <label className="text-[10px] text-slate-400 flex items-center gap-1">
                              Texto
                              <input
                                type="color"
                                value={selectedDecal.fillHex || '#ffffff'}
                                onChange={(e) =>
                                  updateDecal(selectedDecal.id, { fillHex: e.target.value })
                                }
                                className="w-4 h-4 bg-transparent border-0 cursor-pointer"
                              />
                            </label>
                            <label className="text-[10px] text-slate-400 flex items-center gap-1">
                              Borde
                              <input
                                type="color"
                                value={selectedDecal.outlineHex || '#0c2340'}
                                onChange={(e) =>
                                  updateDecal(selectedDecal.id, { outlineHex: e.target.value })
                                }
                                className="w-4 h-4 bg-transparent border-0 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>

                        <label className="block">
                          <span className="text-[11px] text-slate-400 flex justify-between">
                            <span>Arco / Curvatura del Texto</span>
                            <span className="font-mono text-amber-400">{selectedDecal.archDeg || 0}°</span>
                          </span>
                          <input
                            type="range"
                            min="-140"
                            max="140"
                            step="5"
                            value={selectedDecal.archDeg || 0}
                            style={rangeVars(selectedDecal.archDeg || 0, -140, 140)}
                            onChange={(e) =>
                              updateDecal(selectedDecal.id, { archDeg: parseInt(e.target.value, 10) })
                            }
                            className="studio-range"
                          />
                        </label>
                      </div>
                    )}

                    {/* Escala Amplia (10% a 350% All-Over) + Rotación 360° + Opacidad Marca de Agua */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label className="block">
                        <span className="text-slate-400 text-[11px] flex justify-between">
                          <span>Escala</span>
                          <span className="font-mono text-amber-400">
                            {Math.round((selectedDecal.scale ?? 1) * 100)}%
                          </span>
                        </span>
                        <input
                          type="range"
                          min="0.15"
                          max="3.5"
                          step="0.05"
                          value={selectedDecal.scale ?? 1}
                          style={rangeVars(selectedDecal.scale ?? 1, 0.15, 3.5)}
                          onChange={(e) =>
                            updateDecal(selectedDecal.id, { scale: parseFloat(e.target.value) })
                          }
                          className="studio-range"
                        />
                      </label>

                      <label className="block">
                        <span className="text-slate-400 text-[11px] flex justify-between">
                          <span>Rotación 360°</span>
                          <span className="font-mono text-amber-400">
                            {selectedDecal.rotationDeg || 0}°
                          </span>
                        </span>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="1"
                          value={selectedDecal.rotationDeg || 0}
                          style={rangeVars(selectedDecal.rotationDeg || 0, -180, 180)}
                          onChange={(e) =>
                            updateDecal(selectedDecal.id, {
                              rotationDeg: parseInt(e.target.value, 10),
                            })
                          }
                          className="studio-range"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: 'Mini 50%', patch: { scale: 0.5 } },
                        { label: 'Estándar 100%', patch: { scale: 1 } },
                        { label: 'Grande 180%', patch: { scale: 1.8 } },
                        { label: 'All-Over 280%', patch: { scale: 2.8 } },
                        { label: '-90°', patch: { rotationDeg: -90 } },
                        { label: '0°', patch: { rotationDeg: 0 } },
                        { label: '+90°', patch: { rotationDeg: 90 } },
                      ].map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => updateDecal(selectedDecal.id, b.patch, true)}
                          className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>

                    {/* Opacidad / Marca de Agua (`wasserzeichen` de Owayo) + Modo de Fusión */}
                    <div className="grid grid-cols-2 gap-3 items-end pt-1 border-t border-slate-800">
                      <label className="block">
                        <span className="text-slate-400 text-[11px] flex justify-between">
                          <span>Opacidad / Marca Agua</span>
                          <span className="font-mono text-amber-400">
                            {Math.round((selectedDecal.opacity ?? 1) * 100)}%
                          </span>
                        </span>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={selectedDecal.opacity ?? 1}
                          style={rangeVars(selectedDecal.opacity ?? 1, 0.05, 1)}
                          onChange={(e) =>
                            updateDecal(selectedDecal.id, { opacity: parseFloat(e.target.value) })
                          }
                          className="studio-range"
                        />
                      </label>

                      <label className="block">
                        <span className="text-slate-400 text-[11px] block mb-1">Fusión Textil</span>
                        <select
                          value={selectedDecal.blendMode || 'source-over'}
                          onChange={(e) =>
                            updateDecal(selectedDecal.id, { blendMode: e.target.value }, true)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                        >
                          <option value="source-over">Normal (Nítido)</option>
                          <option value="multiply">Multiply (Tinta en Tela)</option>
                          <option value="screen">Screen (Luz / Marca Agua)</option>
                          <option value="overlay">Overlay (Contraste)</option>
                        </select>
                      </label>
                    </div>

                    {/* Herramientas avanzadas para PNG / SVG: Quitar Fondo Blanco + Tinte Pantone */}
                    {selectedDecal.type !== 'STATIC_TEXT' && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        {selectedDecal.artworkId && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateDecal(
                                  selectedDecal.id,
                                  { removeWhiteBg: !selectedDecal.removeWhiteBg },
                                  true
                                )
                              }
                              className={`flex-1 py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${
                                selectedDecal.removeWhiteBg
                                  ? 'bg-emerald-400 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              <Eraser className="w-3.5 h-3.5" />
                              {selectedDecal.removeWhiteBg ? 'Fondo Blanco Eliminado' : 'Quitar Fondo Blanco'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateDecal(
                                  selectedDecal.id,
                                  { invertImage: !selectedDecal.invertImage },
                                  true
                                )
                              }
                              className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-bold ${
                                selectedDecal.invertImage
                                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              Invertir
                            </button>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-slate-400">
                              Recolorear SVG / PNG Monocromo:
                            </span>
                            {selectedDecal.tintHex && (
                              <button
                                type="button"
                                onClick={() => updateDecal(selectedDecal.id, { tintHex: '' }, true)}
                                className="text-[10px] font-bold text-amber-400 hover:underline"
                              >
                                Restaurar Color Original
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {quickTintColors.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => updateDecal(selectedDecal.id, { tintHex: hex }, true)}
                                className={`w-6 h-6 rounded-lg border ${
                                  selectedDecal.tintHex === hex
                                    ? 'border-amber-400 scale-110 ring-1 ring-amber-400'
                                    : 'border-white/20'
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                            <input
                              type="color"
                              value={selectedDecal.tintHex || '#ffffff'}
                              onChange={(e) => updateDecal(selectedDecal.id, { tintHex: e.target.value })}
                              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                              title="Cualquier color de tinte"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 4: SLOTS VARIABLES DE JUGADOR & DORSALES CURVOS ================= */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-300">
                    <strong className="text-amber-400 block">Slots Variables (`einzelexemplare`)</strong>
                    Se actualizan automáticamente para cada jugador del Roster sin duplicar diseño.
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomTextObject}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-black shrink-0"
                  >
                    + Texto Fijo
                  </button>
                </div>

                {/* Interruptores ON/OFF de los 4 Slots de Jugador */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'playerNameBack', label: 'Nombre Espalda', cam: 'back' },
                    { key: 'playerNumberBack', label: 'Dorsal Espalda', cam: 'back' },
                    { key: 'playerNumberFront', label: 'Número Pecho', cam: 'front' },
                    ...(droppablePanels.some((p) => p.panelId === 'right_arm')
                      ? [{ key: 'playerNumberSleeve', label: 'Número Manga', cam: 'right_sleeve' }]
                      : []),
                  ].map((sl) => {
                    const enabled = Boolean(design.variableSlots?.[sl.key]?.enabled);
                    return (
                      <button
                        key={sl.key}
                        type="button"
                        onClick={() => {
                          setCameraPreset(sl.cam);
                          onCommitDesign({
                            ...design,
                            variableSlots: {
                              ...design.variableSlots,
                              [sl.key]: {
                                ...design.variableSlots[sl.key],
                                enabled: !enabled,
                              },
                            },
                          });
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          enabled
                            ? 'bg-emerald-500/15 border-emerald-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{sl.label}</span>
                        <span className="text-[10px] font-mono">{enabled ? 'ON' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 10 Fuentes Deportivas */}
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-1.5">
                    10 Tipografías Atléticas de Competición
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[210px] overflow-y-auto pr-1">
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
                                playerNameBack: {
                                  ...design.variableSlots.playerNameBack,
                                  fontFamily: f.family,
                                },
                                playerNumberBack: {
                                  ...design.variableSlots.playerNumberBack,
                                  fontFamily: f.family,
                                },
                                playerNumberFront: {
                                  ...design.variableSlots.playerNumberFront,
                                  fontFamily: f.family,
                                },
                                playerNumberSleeve: {
                                  ...(design.variableSlots.playerNumberSleeve || {}),
                                  fontFamily: f.family,
                                },
                              },
                            })
                          }
                          className={`p-2 rounded-xl border text-center ${
                            active
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                          }`}
                          style={{ fontFamily: f.family }}
                        >
                          <span className="text-base block leading-tight truncate">{f.label} 10</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colores, Arco de Nombre y Tamaño de Dorsal */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-[11px] text-slate-300 flex flex-col gap-1">
                      <span>Relleno Dorsal</span>
                      <input
                        type="color"
                        value={design.variableSlots.playerNumberBack.fillHex || '#ffffff'}
                        onChange={(e) => {
                          const hex = e.target.value;
                          onCommitDesign(
                            {
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: { ...design.variableSlots.playerNameBack, fillHex: hex },
                                playerNumberBack: { ...design.variableSlots.playerNumberBack, fillHex: hex },
                                playerNumberFront: { ...design.variableSlots.playerNumberFront, fillHex: hex },
                                playerNumberSleeve: {
                                  ...(design.variableSlots.playerNumberSleeve || {}),
                                  fillHex: hex,
                                },
                              },
                            },
                            false
                          );
                        }}
                        className="w-full h-8 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="text-[11px] text-slate-300 flex flex-col gap-1">
                      <span>Contorno 1</span>
                      <input
                        type="color"
                        value={design.variableSlots.playerNumberBack.outlineHex || '#0c2340'}
                        onChange={(e) => {
                          const hex = e.target.value;
                          onCommitDesign(
                            {
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: { ...design.variableSlots.playerNameBack, outlineHex: hex },
                                playerNumberBack: { ...design.variableSlots.playerNumberBack, outlineHex: hex },
                                playerNumberFront: { ...design.variableSlots.playerNumberFront, outlineHex: hex },
                              },
                            },
                            false
                          );
                        }}
                        className="w-full h-8 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="text-[11px] text-slate-300 flex flex-col gap-1">
                      <span>Halo Exterior</span>
                      <input
                        type="color"
                        value={design.variableSlots.playerNumberBack.inlineHex || '#ffcd00'}
                        onChange={(e) =>
                          onCommitDesign(
                            {
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNumberBack: {
                                  ...design.variableSlots.playerNumberBack,
                                  inlineHex: e.target.value,
                                },
                              },
                            },
                            false
                          )
                        }
                        className="w-full h-8 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[11px] text-slate-400 flex justify-between">
                        <span>Arco Nombre</span>
                        <span className="font-mono text-amber-400">
                          {design.variableSlots.playerNameBack.archDeg || 0}°
                        </span>
                      </span>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="5"
                        value={design.variableSlots.playerNameBack.archDeg || 0}
                        style={rangeVars(design.variableSlots.playerNameBack.archDeg || 0, -90, 90)}
                        onChange={(e) =>
                          onCommitDesign(
                            {
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNameBack: {
                                  ...design.variableSlots.playerNameBack,
                                  archDeg: parseInt(e.target.value, 10),
                                },
                              },
                            },
                            false
                          )
                        }
                        className="studio-range"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] text-slate-400 flex justify-between">
                        <span>Altura Dorsal</span>
                        <span className="font-mono text-amber-400">
                          {((design.variableSlots.playerNumberBack.heightMm || 225) / 10).toFixed(1)} cm
                        </span>
                      </span>
                      <input
                        type="range"
                        min="140"
                        max="290"
                        step="5"
                        value={design.variableSlots.playerNumberBack.heightMm || 225}
                        style={rangeVars(design.variableSlots.playerNumberBack.heightMm || 225, 140, 290)}
                        onChange={(e) =>
                          onCommitDesign(
                            {
                              ...design,
                              variableSlots: {
                                ...design.variableSlots,
                                playerNumberBack: {
                                  ...design.variableSlots.playerNumberBack,
                                  heightMm: parseInt(e.target.value, 10),
                                },
                              },
                            },
                            false
                          )
                        }
                        className="studio-range"
                      />
                    </label>
                  </div>

                  {/* Prueba rápida de jugadores del Roster */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-white">Probar Jugadores (`autoCondense`)</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        scaleX:{' '}
                        {computeAutoCondenseScaleX(
                          activePlayer.name,
                          design.variableSlots.playerNameBack.maxWidthMm,
                          design.variableSlots.playerNameBack.capHeightMm
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {roster.slice(0, 4).map((r, idx) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setActiveRosterIndex(idx);
                            setCameraPreset('back');
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
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
              </div>
            )}

            {/* ================= STEP 5: ROSTER DE EQUIPO ================= */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-300 block">{currentTier.label}</span>
                    <span className="text-[11px] text-slate-300">
                      Haz clic en el ojo para inspeccionar cada camiseta e interior de talla en 3D.
                    </span>
                  </div>
                  <span className="text-base font-black text-white">${unitPrice.toFixed(2)}/ud</span>
                </div>

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
                                  title="Previsualizar este jugador"
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

          {/* Sticky Bottom Navigation */}
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
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenProductionModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1"
              >
                <Scissors className="w-3.5 h-3.5" />
                Generar Orden
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
