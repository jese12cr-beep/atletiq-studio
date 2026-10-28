import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  Box,
  Scan,
  Upload,
  Plus,
  Minus,
  Trash2,
  Scissors,
  ShoppingBag,
  Store,
  AlignCenterVertical,
  RefreshCw,
  Check,
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
  Save,
  FolderOpen,
  ClipboardCheck,
  ChevronLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Eye,
  ChevronDown,
  Menu,
  User,
  Share2,
} from 'lucide-react';
import Interactive2DLab from '../../engine/compositor/Interactive2DLab';
import LayerStack25DViewer from '../../engine/compositor/LayerStack25DViewer';
import {
  ENGINE_PRODUCTS,
  PANTONE_CM5_PALETTE,
  COLOR_HARMONY_SUGGESTIONS,
  getDesignsForProduct,
  ZONE_SURFACE_PATTERNS,
  VECTOR_CREST_PRESETS,
  FABRIC_WEAVES,
  SPORT_FONTS,
  VOLUME_TIERS,
  createDefaultDesignForProduct,
} from '../../engine/core/designStore';
import { MEXICO_PRO_KITS } from '../../data/mexicoKitsData';
import { processUploadedArtwork, calculateEffectiveDpi } from '../../engine/core/dpiValidator';
import {
  getDroppablePanelsForProduct,
  getPartSpec,
  getMirrorSymmetryTarget,
  evaluateDecalPlacement,
  isShortsProduct,
  snapRotationAngle,
} from '../../engine/core/boundingBoxMath';

import GarmentCanvas3D from '../../engine/viewer3d/GarmentCanvas3D';
import JerseyThumbnailMiniature from './JerseyThumbnailMiniature';
import ProductionMoldModal from './ProductionMoldModal';

const OWAYO_TABS = [
  { id: 'design', label: 'Diseño', icon: Sparkles },
  { id: 'colors', label: 'Colores', icon: Palette },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'logo', label: 'Logo', icon: Shield },
];

const ESSENTIAL_SPORT_COLORS = [
  { hex: '#FFFFFF', name: 'Blanco' },
  { hex: '#F1F5F9', name: 'Gris Perla' },
  { hex: '#94A3B8', name: 'Gris Medio' },
  { hex: '#334155', name: 'Gris Carbón' },
  { hex: '#0F172A', name: 'Negro Noche' },
  { hex: '#000000', name: 'Negro Puro' },

  { hex: '#0B1B3D', name: 'Marino Oscuro' },
  { hex: '#1E3A8A', name: 'Azul Marino' },
  { hex: '#1D4ED8', name: 'Azul Real' },
  { hex: '#0284C7', name: 'Azul Eléctrico' },
  { hex: '#38BDF8', name: 'Celeste' },
  { hex: '#06B6D4', name: 'Turquesa' },

  { hex: '#15803D', name: 'Verde Competición' },
  { hex: '#064E3B', name: 'Verde Bosque' },
  { hex: '#84CC16', name: 'Verde Lima' },
  { hex: '#FACC15', name: 'Amarillo Limón' },
  { hex: '#D97706', name: 'Oro Deportivo' },
  { hex: '#EA580C', name: 'Naranja Flúor' },

  { hex: '#DC2626', name: 'Rojo Clásico' },
  { hex: '#991B1B', name: 'Granate' },
  { hex: '#FB7185', name: 'Coral / Rosa' },
  { hex: '#E11D48', name: 'Fucsia' },
  { hex: '#7C3AED', name: 'Morado' },
  { hex: '#4C1D95', name: 'Púrpura Oscuro' },
];

const CUT_OPTIONS = [
  { value: 'MEN_PRO_SLIM', label: 'Hombre Slim' },
  { value: 'MEN_CLASSIC', label: 'Hombre Clásico' },
  { value: 'WOMEN_FIT', label: 'Mujer Entallado' },
  { value: 'YOUTH_KIDS', label: 'Infantil / Juvenil' },
];

const SIZE_OPTIONS = ['128', '140', '152', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const PANEL_TO_CAMERA = {
  front: 'front',
  back: 'back',
  left_arm: 'left_sleeve',
  right_arm: 'right_sleeve',
  right_leg: 'right_leg',
  left_leg: 'left_leg',
  collar: 'front',
};

const DRAFTS_STORAGE_KEY = 'atletiq_owayo_drafts_v5';

function rangeVars(val, min, max) {
  return {
    '--attr-min': min,
    '--attr-max': max,
    '--control-value': val,
  };
}

/**
 * Diálogo modal nativo con soporte declarativo `closedby="any"` y fallback para navegadores sin `closedBy`.
 */
function LightDismissModal({ isOpen, onClose, titleId, title, subtitle, maxWidthClass = 'max-w-4xl', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }

    const handleNativeClose = () => {
      onClose?.();
    };
    dialog.addEventListener('close', handleNativeClose);

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      dialog.close();
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={titleId}
      className={`p-0 rounded-3xl bg-white text-slate-900 border border-slate-200 ${maxWidthClass} w-full shadow-2xl m-auto backdrop:bg-slate-950/40 backdrop:backdrop-blur-xs`}
    >
      <div className="p-5 sm:p-6 flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            {subtitle && (
              <span className="text-[10px] font-mono text-sky-600 uppercase tracking-widest block font-bold">
                {subtitle}
              </span>
            )}
            <h2 id={titleId} className="text-lg sm:text-xl font-black text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar ventana"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">{children}</div>
      </div>
    </dialog>
  );
}

export default function HybridStudioWorkspace({
  design,
  designsByProduct,
  onSwitchProduct,
  onSyncPairedColors,
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
  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'colors' | 'text' | 'logo'
  const [viewportMode, setViewportMode] = useState('3d'); // '3d' | '2d'
  const [cameraPreset, setCameraPreset] = useState('three_quarter');
  const [autoRotate, setAutoRotate] = useState(false);
  const [panel2D, setPanel2D] = useState('front');

  const [selectedDecalId, setSelectedDecalId] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [isEditingLogoDetail, setIsEditingLogoDetail] = useState(false);
  const [isEditingTextDetail, setIsEditingTextDetail] = useState(false);

  const [activeRosterIndex, setActiveRosterIndex] = useState(0);
  const [activeColorZone, setActiveColorZone] = useState('primary');
  const [paletteFilterMode, setPaletteFilterMode] = useState('all');
  const [colorSearch, setColorSearch] = useState('');
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [csvQuickInput, setCsvQuickInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Diálogos de la barra inferior Owayo (`Mis bocetos`, `Ejemplares`, `Revisión del diseño`)
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isGarmentMenuOpen, setIsGarmentMenuOpen] = useState(false);
  const [isMexicoKitsModalOpen, setIsMexicoKitsModalOpen] = useState(false);
  const [isProductionMoldModalOpen, setIsProductionMoldModalOpen] = useState(false);
  const [garmentMenuMenSection, setGarmentMenuMenSection] = useState('custom'); // 'custom' | 'ligamx'
  const [mexicoKitSearch, setMexicoKitSearch] = useState('');
  const [mexicoKitRegionFilter, setMexicoKitRegionFilter] = useState('all');
  const [mexicoKitEditionFilter, setMexicoKitEditionFilter] = useState('local'); // 'local' | 'visitante' | 'all'
  const [activeMexicoKitId, setActiveMexicoKitId] = useState(design?.mexicoKitId || null);
  const [savedDrafts, setSavedDrafts] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef(null);
  const canvasSnapshotRef = useRef(null);

  // Carga progresiva condicional de `input-switch-polyfill` según Modern Web Guidance (`switch`)
  useEffect(() => {
    if (typeof HTMLInputElement !== 'undefined' && !('switch' in HTMLInputElement.prototype)) {
      import('input-switch-polyfill').catch(() => {});
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? '' : cur));
    }, 2400);
  };

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];
  const pairedProduct = currentProduct.pairedProductId
    ? ENGINE_PRODUCTS.find((p) => p.id === currentProduct.pairedProductId)
    : null;
  const isFaux3DAccessory = currentProduct.renderMode === 'FAUX_3D_LAYERED_WEBP';
  const isShorts = isShortsProduct(design.productModelId);
  const isJacket = currentProduct.garmentCategory === 'jacket';

  const [genderModule, setGenderModule] = useState(() => currentProduct.gender || 'men');

  useEffect(() => {
    if (currentProduct.gender && currentProduct.gender !== genderModule) {
      setGenderModule(currentProduct.gender);
    }
  }, [currentProduct.gender]);

  const availableFishDesigns = useMemo(
    () => getDesignsForProduct(design.productModelId),
    [design.productModelId]
  );
  const droppablePanels = useMemo(
    () => getDroppablePanelsForProduct(design.productModelId),
    [design.productModelId]
  );

  // Asegurar que `panel2D` sea siempre válido al cambiar entre Camiseta (`front`/`back`) y Short (`right_leg`/`left_leg`)
  useEffect(() => {
    if (!droppablePanels.some((p) => p.panelId === panel2D)) {
      setPanel2D(droppablePanels[0]?.panelId || 'front');
    }
    setCameraPreset('three_quarter');
    setSelectedDecalId(null);
    setSelectedSlotKey(null);
    setIsEditingLogoDetail(false);
    setIsEditingTextDetail(false);
  }, [design.productModelId, droppablePanels]);

  const colorZonesMeta = useMemo(() => {
    if (isShorts) {
      return [
        { id: 'primary', label: 'Zona A • Cuerpo Principal', short: 'A' },
        { id: 'secondary', label: 'Zona B • Franja / Lateral', short: 'B' },
        { id: 'accents', label: 'Zona C • Filete / Ribete', short: 'C' },
        { id: 'quaternary', label: 'Zona D • Cuarto Tono', short: 'D' },
      ];
    }
    if (isJacket) {
      return [
        { id: 'primary', label: 'Zona A • Cuerpo Chaqueta', short: 'A' },
        { id: 'secondary', label: 'Zona B • Paneles / Costados', short: 'B' },
        { id: 'accents', label: 'Zona C • Cremallera / Detalles', short: 'C' },
        { id: 'quaternary', label: 'Zona D • Cuarto Tono', short: 'D' },
        { id: 'collar', label: 'Cuello Alto', short: 'K' },
        { id: 'sleeves', label: 'Mangas / Bajomanga', short: 'SL' },
      ];
    }
    return [
      { id: 'primary', label: 'Zona A • Cuerpo Principal', short: 'A' },
      { id: 'secondary', label: 'Zona B • Bloque Secundario', short: 'B' },
      { id: 'accents', label: 'Zona C • Acentos / Filetes', short: 'C' },
      { id: 'quaternary', label: 'Zona D • Cuarto Tono', short: 'D' },
      { id: 'collar', label: 'Cuello (Collar)', short: 'K' },
      {
        id: 'sleeves',
        label:
          currentProduct.garmentShape === 'basketball_tank'
            ? 'Ribetes de Sisa (Aermelband)'
            : 'Mangas / Puños',
        short: 'SL',
      },
    ];
  }, [isShorts, isJacket, currentProduct.garmentShape]);

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

  const allDecals = design.decals || [];
  const logoDecals = allDecals.filter((d) => d.type !== 'STATIC_TEXT');
  const textDecals = allDecals.filter((d) => d.type === 'STATIC_TEXT');

  const selectedDecal = selectedDecalId
    ? allDecals.find((d) => d.id === selectedDecalId) || null
    : null;
  const selectedLogoDecal =
    selectedDecal && selectedDecal.type !== 'STATIC_TEXT' ? selectedDecal : null;
  const selectedTextDecal =
    selectedDecal && selectedDecal.type === 'STATIC_TEXT' ? selectedDecal : null;

  const variableSlotKeysForProduct = isShorts
    ? ['playerNumberShorts']
    : isJacket
    ? ['playerNameBack', 'playerNumberBack']
    : currentProduct.garmentShape === 'basketball_tank'
    ? ['playerNameBack', 'playerNumberBack', 'playerNumberFront']
    : ['playerNameBack', 'playerNumberBack', 'playerNumberFront', 'playerNumberSleeve'];

  const SLOT_LABELS = {
    playerNameBack: 'Nombre Jugador (Espalda)',
    playerNumberBack: 'Dorsal Trasero Principal',
    playerNumberFront: 'Número Frontal Pecho',
    playerNumberSleeve: 'Número en Manga',
    playerNumberShorts: 'Número en Pierna de Short',
  };

  // --- Mutadores del Documento Maestro ---
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

  const applyColorHarmony = (harmony) => {
    if (harmony.zones) {
      onCommitDesign({
        ...design,
        colorZones: {
          ...design.colorZones,
          ...harmony.zones,
        },
      });
      return;
    }
    const findMeta = (hex) =>
      PANTONE_CM5_PALETTE.find((p) => p.hex.toLowerCase() === hex?.toLowerCase()) || {
        hex,
        pantone: 'PMS Custom',
        code: hex,
      };
    const p = findMeta(harmony.primary || harmony.zones?.primary?.hex);
    const s = findMeta(harmony.secondary || harmony.zones?.secondary?.hex);
    const a = findMeta(harmony.accents || harmony.zones?.accents?.hex);
    const q = findMeta(harmony.quaternary || harmony.zones?.quaternary?.hex);

    onCommitDesign({
      ...design,
      colorZones: {
        ...design.colorZones,
        primary: { hex: p.hex, pantone: p.pantone, code: p.code },
        secondary: { hex: s.hex, pantone: s.pantone, code: s.code },
        accents: { hex: a.hex, pantone: a.pantone, code: a.code },
        quaternary: { hex: q.hex, pantone: q.pantone, code: q.code },
        collar: { hex: a.hex, pantone: a.pantone, code: a.code },
        sleeves: { hex: s.hex, pantone: s.pantone, code: s.code },
      },
    });
  };

  const updateDecal = (decalId, patch, recordHistory = false) => {
    onCommitDesign(
      {
        ...design,
        decals: allDecals.map((d) => (d.id === decalId ? { ...d, ...patch } : d)),
      },
      recordHistory
    );
  };

  const updateVariableSlot = (slotKey, nextSlotObj, recordHistory = false) => {
    onCommitDesign(
      {
        ...design,
        variableSlots: {
          ...design.variableSlots,
          [slotKey]: nextSlotObj,
        },
      },
      recordHistory
    );
  };

  const deleteDecal = (decalId) => {
    onCommitDesign(
      {
        ...design,
        decals: allDecals.filter((d) => d.id !== decalId),
      },
      true
    );
    if (selectedDecalId === decalId) {
      setSelectedDecalId(null);
      setIsEditingLogoDetail(false);
      setIsEditingTextDetail(false);
    }
  };

  const mirrorDecalToSymmetricPiece = (sourceDecal) => {
    const mirror = getMirrorSymmetryTarget(
      design.productModelId,
      sourceDecal.panel || droppablePanels[0]?.panelId,
      sourceDecal.centerMm
    );
    const maxZ = allDecals.reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);
    const cloned = {
      ...sourceDecal,
      id: `decal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      label: `${sourceDecal.label} (Simétrico)`,
      panel: mirror.targetPanel,
      centerMm: mirror.centerMm,
      pinned: false,
      zIndex: maxZ + 5,
    };
    onCommitDesign(
      {
        ...design,
        decals: [...allDecals, cloned],
      },
      true
    );
    setSelectedDecalId(cloned.id);
    setPanel2D(mirror.targetPanel);
    if (PANEL_TO_CAMERA[mirror.targetPanel]) {
      setCameraPreset(PANEL_TO_CAMERA[mirror.targetPanel]);
    }
    showToast(`Espejado en ${getPartSpec(design.productModelId, mirror.targetPanel).shortLabel}`);
  };

  const handleSelectDecalFromStage = (decalId, hitPanel) => {
    const target = allDecals.find((d) => d.id === decalId);
    setSelectedDecalId(decalId);
    setSelectedSlotKey(null);
    if (hitPanel) setPanel2D(hitPanel);

    if (target?.type === 'STATIC_TEXT') {
      setActiveTab('text');
      setIsEditingTextDetail(true);
      setIsEditingLogoDetail(false);
    } else if (target) {
      setActiveTab('logo');
      setIsEditingLogoDetail(true);
      setIsEditingTextDetail(false);
    }
  };

  const handleSelectSlotFromStage = (slotKey, hitPanel) => {
    setSelectedSlotKey(slotKey);
    setSelectedDecalId(null);
    if (hitPanel) setPanel2D(hitPanel);
    setActiveTab('text');
    setIsEditingTextDetail(true);
    setIsEditingLogoDetail(false);
  };

  const insertArtworkOnPanel = (processed, targetPanel = panel2D) => {
    const validPanel = droppablePanels.some((p) => p.panelId === targetPanel)
      ? targetPanel
      : droppablePanels[0]?.panelId || 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const defaultWidthMm =
      validPanel === 'collar'
        ? 38
        : validPanel.includes('arm')
        ? 72
        : validPanel.includes('leg')
        ? 84
        : 112;
    const defaultHeightMm = Math.max(14, Math.round(defaultWidthMm / (processed.aspectRatio || 1)));
    const maxZ = allDecals.reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);

    return {
      id: `decal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      type: processed.isVector ? 'UPLOADED_VECTOR' : 'UPLOADED_RASTER',
      artworkId: processed.artworkId,
      label: processed.fileName.replace(/\.[^.]+$/, '').slice(0, 22),
      panel: validPanel,
      clampToZone: 'ALL',
      pinned: false,
      centerMm: {
        x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
        y: +(spec.heightMm * (validPanel === 'front' ? 0.34 : validPanel.includes('leg') ? 0.62 : 0.48)).toFixed(1),
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
      dataUrl: processed.dataUrl || '',
      previewUrl: processed.previewUrl || '',
    };
  };

  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList || []).filter(
      (f) => /\.(png|svg|webp|jpe?g)$/i.test(f.name) || f.type.startsWith('image/')
    );
    if (files.length === 0) return;

    const added = [];
    for (const file of files) {
      const processed = await processUploadedArtwork(file);
      onRegisterArtwork(processed.artworkId, processed);
      added.push(insertArtworkOnPanel(processed, panel2D));
    }

    if (added.length > 0) {
      onCommitDesign(
        {
          ...design,
          decals: [...allDecals, ...added],
        },
        true
      );
      const last = added[added.length - 1];
      setSelectedDecalId(last.id);
      setSelectedSlotKey(null);
      setActiveTab('logo');
      setIsEditingLogoDetail(true);
      showToast(`${added.length} archivo(s) añadido(s) a ${getPartSpec(design.productModelId, last.panel).shortLabel}`);
    }
  };

  const handleAddPresetCrest = (preset) => {
    const validPanel = droppablePanels.some((p) => p.panelId === panel2D)
      ? panel2D
      : droppablePanels[0]?.panelId || 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const maxZ = allDecals.reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);
    const newDecal = {
      id: `crest_${Date.now().toString(36)}`,
      type: 'PRESET_CREST',
      presetId: preset.id,
      label: preset.label,
      panel: validPanel,
      clampToZone: 'ALL',
      pinned: false,
      centerMm: {
        x: +(spec.widthMm * (validPanel === 'front' ? 0.36 : spec.snapCenterU)).toFixed(1),
        y: +(spec.heightMm * (validPanel === 'front' ? 0.24 : 0.62)).toFixed(1),
      },
      sizeMm: { width: 78, height: 78 },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      zIndex: maxZ + 5,
      isVector: true,
      widthPx: 2400,
    };
    onCommitDesign({ ...design, decals: [...allDecals, newDecal] }, true);
    setSelectedDecalId(newDecal.id);
    setSelectedSlotKey(null);
    setIsEditingLogoDetail(true);
    if (PANEL_TO_CAMERA[validPanel]) setCameraPreset(PANEL_TO_CAMERA[validPanel]);
  };

  const handleAddStaticText = () => {
    const validPanel = droppablePanels.some((p) => p.panelId === panel2D)
      ? panel2D
      : droppablePanels[0]?.panelId || 'front';
    const spec = getPartSpec(design.productModelId, validPanel);
    const maxZ = allDecals.reduce((m, d) => Math.max(m, d.zIndex ?? 10), 10);
    const newText = {
      id: `txt_${Date.now().toString(36)}`,
      type: 'STATIC_TEXT',
      text: 'TU EQUIPO',
      label: 'Texto: TU EQUIPO',
      panel: validPanel,
      clampToZone: 'ALL',
      pinned: false,
      fontFamily: "'Bebas Neue', sans-serif",
      fillHex: '#ffffff',
      strokeHex: '#101820',
      strokeWidthMm: 2.2,
      archDeg: 0,
      centerMm: {
        x: +(spec.widthMm * spec.snapCenterU).toFixed(1),
        y: +(spec.heightMm * (validPanel === 'front' ? 0.42 : 0.52)).toFixed(1),
      },
      sizeMm: { width: 190, height: 48 },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
      zIndex: maxZ + 8,
      isVector: true,
      widthPx: 3200,
    };
    onCommitDesign({ ...design, decals: [...allDecals, newText] }, true);
    setSelectedDecalId(newText.id);
    setSelectedSlotKey(null);
    setActiveTab('text');
    setIsEditingTextDetail(true);
    if (PANEL_TO_CAMERA[validPanel]) setCameraPreset(PANEL_TO_CAMERA[validPanel]);
  };

  // --- Guardado de Bocetos Locales (`Mis bocetos`) ---
  const handleSaveDraft = () => {
    const entry = {
      draftId: `draft_${Date.now().toString(36)}`,
      savedAt: new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      productName: currentProduct.shortName || currentProduct.name,
      productModelId: design.productModelId,
      patternId: design.patternId,
      colors: [
        design.colorZones.primary?.hex,
        design.colorZones.secondary?.hex,
        design.colorZones.accents?.hex,
      ],
      designSnapshot: design,
    };
    const next = [entry, ...savedDrafts].slice(0, 16);
    setSavedDrafts(next);
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar cuota de almacenamiento excedida
    }
    showToast(`Boceto «${entry.productName}» guardado en Mis Bocetos`);
  };

  const handleLoadDraft = (draft) => {
    if (!draft?.designSnapshot) return;
    onCommitDesign(draft.designSnapshot, true);
    setIsDraftsModalOpen(false);
    showToast(`Boceto cargado: ${draft.productName}`);
  };

  const handleDeleteDraft = (draftId) => {
    const next = savedDrafts.filter((d) => d.draftId !== draftId);
    setSavedDrafts(next);
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar
    }
  };

  // --- Aplicar Preset de la Colección México Pro (18 Clubes) ---
  const handleApplyMexicoKit = (kit) => {
    setActiveMexicoKitId(kit.id);

    const baseDesign =
      designsByProduct?.['futbol_jersey_pro_vneck'] ||
      (design.productModelId === 'futbol_jersey_pro_vneck' ? design : null) ||
      createDefaultDesignForProduct('futbol_jersey_pro_vneck');

    const nextRoster = [...roster];
    if (nextRoster[0]) {
      nextRoster[0] = {
        ...nextRoster[0],
        name: kit.sampleName,
        number: kit.sampleNumber,
      };
      onUpdateRoster(nextRoster);
    }

    onCommitDesign({
      ...baseDesign,
      mexicoKitId: kit.id,
      mexicoBaseClubId: kit.baseClubId,
      productModelId: 'futbol_jersey_pro_vneck',
      patternId: kit.patternId,
      colorZones: {
        ...baseDesign.colorZones,
        ...kit.colorZones,
      },
      decals: kit.decals && kit.decals.length > 0 ? kit.decals : (baseDesign.decals || []),
      surfacePatternId: kit.surfacePatternId || 'none',
      surfacePatternOpacity: kit.surfacePatternOpacity ?? 0.16,
      variableSlots: {
        ...baseDesign.variableSlots,
        playerNameBack: {
          ...baseDesign.variableSlots?.playerNameBack,
          fillHex: kit.numberColor,
          outlineHex: kit.numberOutline,
        },
        playerNumberBack: {
          ...baseDesign.variableSlots?.playerNumberBack,
          fillHex: kit.numberColor,
          outlineHex: kit.numberOutline,
        },
        playerNumberFront: {
          ...baseDesign.variableSlots?.playerNumberFront,
          enabled: false,
          fillHex: kit.numberColor,
          outlineHex: kit.numberOutline,
        },
      },
    }, true);

    setIsMexicoKitsModalOpen(false);
    setIsGarmentMenuOpen(false);
    showToast(`Preset cargado en 3D: ${kit.name} (${kit.clubAlias})`);
  };

  // --- Importador Rápido CSV para `Ejemplares` ---
  const handleImportCsvRoster = () => {
    const lines = csvQuickInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const parsed = lines.map((line, i) => {
      const parts = line.split(/[,;\t]/).map((s) => s.trim());
      return {
        id: `p_${Date.now()}_${i}`,
        name: (parts[0] || `JUGADOR ${i + 1}`).toUpperCase(),
        number: parts[1] || String(i + 1),
        size: SIZE_OPTIONS.includes((parts[2] || '').toUpperCase())
          ? parts[2].toUpperCase()
          : 'L',
        cut: 'MEN_PRO_SLIM',
        qty: Math.max(1, parseInt(parts[3], 10) || 1),
      };
    });
    onUpdateRoster([...roster, ...parsed]);
    setCsvQuickInput('');
    showToast(`${parsed.length} jugadores importados a Ejemplares`);
  };

  // --- Auditoría de Pre-Vuelo (`Revisión del diseño`) ---
  const designReviewChecks = useMemo(() => {
    const checks = [];
    let hasWarnings = false;

    for (const d of allDecals) {
      const placement = evaluateDecalPlacement(d, design.productModelId, false, 'SOFT_WARN');
      const dpi = calculateEffectiveDpi(d.widthPx || 1600, d.sizeMm.width, d.scale ?? 1, d.isVector);
      if (placement.isOutOfSafeZone) {
        hasWarnings = true;
        checks.push({
          ok: false,
          title: `«${d.label}» invade margen de costura inferior (${placement.maxOverflowMm} mm)`,
          detail: 'Súbelo ligeramente o cambia a modo All-Over si deseas sangrado completo.',
        });
      }
      if (dpi.level === 'LOW_RES') {
        hasWarnings = true;
        checks.push({
          ok: false,
          title: `«${d.label}» tiene ${dpi.dpi} DPI al tamaño actual`,
          detail: 'Reduce su escala o sube una versión vectorial SVG / PNG mayor a 1200 px.',
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        ok: true,
        title: 'Todos los escudos, archivos PNG/SVG y textos cumplen con márgenes de costura y nitidez RIP.',
        detail: `${allDecals.length} capas gráficas auditadas a escala física 1:1.`,
      });
    }

    checks.push({
      ok: roster.length > 0,
      title: `Lista de Ejemplares lista (${totalUnits} prendas en ${roster.length} filas)`,
      detail: `Tarifa aplicada: ${currentTier.label} ($${unitPrice.toFixed(2)} USD c/u).`,
    });

    return { checks, hasWarnings };
  }, [allDecals, design.productModelId, roster.length, totalUnits, currentTier.label, unitPrice]);

  const handleGenderSwitch = (targetGender) => {
    if (targetGender === genderModule) return;
    setGenderModule(targetGender);

    if (targetGender === 'women') {
      if (design.productModelId === 'basketball_b6_hero') {
        onSwitchProduct('basketball_b7w_epic_women');
      } else if (design.productModelId === 'basketball_shorts_bp6') {
        onSwitchProduct('basketball_shorts_bp7w_women');
      } else if (design.productModelId === 'jacket_softshell_601m_men') {
        onSwitchProduct('jacket_softshell_601w_women');
      } else {
        onSwitchProduct('basketball_b7w_epic_women');
      }
    } else {
      if (design.productModelId === 'basketball_b7w_epic_women') {
        onSwitchProduct('basketball_b6_hero');
      } else if (design.productModelId === 'basketball_shorts_bp7w_women') {
        onSwitchProduct('basketball_shorts_bp6');
      } else if (design.productModelId === 'jacket_softshell_601w_women') {
        onSwitchProduct('jacket_softshell_601m_men');
      } else {
        onSwitchProduct('futbol_jersey_pro_vneck');
      }
    }
  };

  const handleOpenGarmentMenuForGender = (targetGender, section = null) => {
    if (targetGender !== genderModule) {
      handleGenderSwitch(targetGender);
    }
    if (section) {
      setGarmentMenuMenSection(section);
    }
    setIsGarmentMenuOpen(true);
  };

  const filteredMexicoKitsInMenu = useMemo(() => {
    return MEXICO_PRO_KITS.filter((kit) => {
      // Filtro de Versión: Local / Visitante / Todos
      if (mexicoKitEditionFilter !== 'all' && kit.edition !== mexicoKitEditionFilter) {
        return false;
      }

      const q = mexicoKitSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        kit.name.toLowerCase().includes(q) ||
        kit.clubAlias.toLowerCase().includes(q) ||
        kit.location.toLowerCase().includes(q) ||
        kit.description.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (mexicoKitRegionFilter === 'all') return true;
      if (mexicoKitRegionFilter === 'cdmx') return kit.location === 'CDMX';
      if (mexicoKitRegionFilter === 'jalisco') return kit.location === 'Jalisco';
      if (mexicoKitRegionFilter === 'norte') {
        return ['Nuevo León', 'Coahuila', 'Sinaloa', 'Baja California', 'Chihuahua'].includes(kit.location);
      }
      if (mexicoKitRegionFilter === 'centro_bajio') {
        return ['Edo. de México', 'Guanajuato', 'Hidalgo', 'Aguascalientes', 'Puebla', 'Querétaro', 'San Luis Potosí'].includes(kit.location);
      }
      return true;
    });
  }, [mexicoKitSearch, mexicoKitRegionFilter, mexicoKitEditionFilter]);

  // Si hay un kit de la Liga MX activo, identificamos el club y sus 2 versiones oficiales (Local y Visitante)
  const activeMexicoClubKits = useMemo(() => {
    const kitId = design?.mexicoKitId || activeMexicoKitId;
    if (!kitId || design?.productModelId !== 'futbol_jersey_pro_vneck') return null;
    const currentKit = MEXICO_PRO_KITS.find((k) => k.id === kitId);
    if (!currentKit) return null;
    const baseClubId = currentKit.baseClubId;
    const homeKit = MEXICO_PRO_KITS.find((k) => k.baseClubId === baseClubId && k.edition === 'local');
    const awayKit = MEXICO_PRO_KITS.find((k) => k.baseClubId === baseClubId && k.edition === 'visitante');
    return {
      currentKit,
      homeKit,
      awayKit,
      baseClubId,
      clubAlias: currentKit.clubAlias,
      location: currentKit.location,
    };
  }, [design?.mexicoKitId, design?.productModelId, activeMexicoKitId]);

  const menBasketball = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Baloncesto');
  const menFootball = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Fútbol');
  const menJackets = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Chaquetas');

  const womenBasketball = ENGINE_PRODUCTS.filter((p) => p.gender === 'women' && p.sport === 'Baloncesto');
  const womenJackets = ENGINE_PRODUCTS.filter((p) => p.gender === 'women' && p.sport === 'Chaquetas');
  const accessoryProducts = ENGINE_PRODUCTS.filter((p) => p.renderMode === 'FAUX_3D_LAYERED_WEBP');

  const currentSportProducts = useMemo(() => {
    return ENGINE_PRODUCTS.filter(
      (p) => p.gender === genderModule && p.sport === currentProduct.sport
    );
  }, [genderModule, currentProduct.sport]);

  return (
    <div className="h-dvh flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 1. CABECERA MULTI-PRENDA (MÓDULOS CABALLERO & DAMA: BALONCESTO, FÚTBOL, CHAQUETAS SOFTSHELL) */}
      <header className="shrink-0 px-3 sm:px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs z-30">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToStorefront}
            title="Volver a la tienda principal"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-sky-600" />
            <span>← Volver a la Tienda</span>
          </button>

          {/* Segmentos Independientes: ♂ Caballero vs ♀ Dama */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              id="btn-nav-caballero"
              type="button"
              onClick={() => handleOpenGarmentMenuForGender('men')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                genderModule === 'men'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Abrir menú interactivo para Caballero"
            >
              <span>♂ Caballero</span>
            </button>
            <button
              id="btn-nav-dama"
              type="button"
              onClick={() => handleOpenGarmentMenuForGender('women')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                genderModule === 'women'
                  ? 'bg-fuchsia-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Abrir menú interactivo para Dama"
            >
              <span>♀ Dama</span>
            </button>
          </div>

          {/* Menú Interactivo de Deportes y Prendas */}
          <button
            id="btn-open-garment-menu"
            type="button"
            onClick={() => setIsGarmentMenuOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="Abrir catálogo interactivo de deportes"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {currentProduct.sport}: <strong className="text-slate-900">{currentProduct.shortName || currentProduct.name}</strong>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Alternador Rápido de Prendas del Deporte Activo (p. ej. Camiseta ↔ Short) */}
          {currentSportProducts.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {currentSportProducts.map((prod) => {
                const isActive = design.productModelId === prod.id;
                const label = prod.garmentCategory === 'shorts' ? 'Short' : 'Camisa';
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onSwitchProduct(prod.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sincronizador 1-clic Camiseta ↔ Short */}
          {pairedProduct && (
            <button
              type="button"
              onClick={() => {
                onSyncPairedColors?.();
                showToast(`Colores copiados a ${pairedProduct.shortName}`);
              }}
              title={`Copiar la paleta actual a ${pairedProduct.name}`}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[11px] font-bold text-sky-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden xl:inline">Sincronizar colores en {pairedProduct.shortName}</span>
              <span className="xl:hidden">Sincronizar Kit</span>
            </button>
          )}
        </div>

        {/* Carrito */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-sky-600" />
            <span>Cesta ({cartCount})</span>
          </button>
        </div>
      </header>

      {/* Toast flotante de confirmación instantánea */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black shadow-xl flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. CUERPO CENTRAL OWAYO EN 2 COLUMNAS: ESCENARIO INTERACTIVO (IZQ) + PANEL DE 4 PESTAÑAS (DER) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* ESCENARIO 3D INTERACTIVO CON ILUMINACIÓN PROFESIONAL DE ESTUDIO */}
        <main className="flex-1 min-h-[340px] relative bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#f1f5f9_60%,#e2e8f0_100%)] overflow-hidden flex flex-col">
          {isFaux3DAccessory ? (
            <LayerStack25DViewer
              design={design}
              product={currentProduct}
              artworkRegistry={artworkRegistry}
            />
          ) : (
            <GarmentCanvas3D
              design={design}
              activePlayer={activePlayer}
              artworkRegistry={artworkRegistry}
              cameraPreset={cameraPreset}
              onChangeCameraPreset={setCameraPreset}
              autoRotate={autoRotate}
              selectedDecalId={selectedDecalId}
              selectedSlotKey={selectedSlotKey}
              onSelectDecalFrom3D={handleSelectDecalFromStage}
              onSelectSlotFrom3D={handleSelectSlotFromStage}
              onUpdateDecalFrom3D={updateDecal}
              onUpdateSlotFrom3D={updateVariableSlot}
              onDeleteDecalFrom3D={deleteDecal}
              onMirrorDecalFrom3D={mirrorDecalToSymmetricPiece}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
              canvasSnapshotRef={canvasSnapshotRef}
            />
          )}

          {/* Selector rápido inferior derecho de jugador de muestra + Auto-giro */}
          <div className="pointer-events-auto absolute bottom-3 right-3 hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-300 text-[11px] backdrop-blur-sm shadow-xs text-slate-800">
            <span className="text-slate-500 font-bold">Muestra:</span>
            <select
              value={activeRosterIndex}
              onChange={(e) => setActiveRosterIndex(Number(e.target.value))}
              aria-label="Seleccionar jugador de muestra en visor"
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-slate-900 font-bold"
            >
              {roster.map((r, idx) => (
                <option key={r.id || idx} value={idx}>
                  #{r.number} {r.name} ({r.size})
                </option>
              ))}
            </select>

            {!isFaux3DAccessory && (
              <label className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-slate-700 cursor-pointer">
                <span>Giro 360°</span>
                <input
                  type="checkbox"
                  {...{ switch: '' }}
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
              </label>
            )}
          </div>
        </main>

        {/* PANEL LATERAL DERECHO OWAYO (`Diseño | Colores | Text | Logo`) */}
        <aside className="w-full lg:w-[430px] xl:w-[465px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col min-h-0 max-h-[55vh] lg:max-h-none shadow-xs">
          {/* Cabecera del Panel Owayo: Nombre Prenda + Enlace 'Cambiar producto' + Iconos (Menú, Usuario, Cesta) */}
          <div className="shrink-0 p-4 pb-3 border-b border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                  {currentProduct.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsGarmentMenuOpen(true)}
                  className="mt-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Cambiar producto</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGarmentMenuOpen(true)}
                  title="Catálogo interactivo de deportes"
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(true)}
                  title="Lista de ejemplares y tallas"
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenCart}
                  title="Cesta de la compra"
                  className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Pestañas de píldora Owayo: [ Diseño ] [ Colores ] [ Text ] [ Logo ] */}
            <div className="flex items-center gap-2 mt-3.5">
              {OWAYO_TABS.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-[#222222] text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido desplazable de la pestaña activa */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ==================== PESTAÑA 1: DISEÑO ==================== */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                {activeMexicoClubKits ? (
                  /* Modo Liga MX: Exclusivamente Versión Local y Visitante (2 Versiones) */
                  <div className="space-y-3.5">
                    {/* Cabecera del Club Activo */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm border border-slate-700/60">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm">🇲🇽</span>
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                              {activeMexicoClubKits.clubAlias}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {activeMexicoClubKits.location}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 truncate mt-1">
                            Inspiración Liga MX 2025/2026 • 100% Libre de marcas
                          </p>
                        </div>
                        <button
                          type="button"
                          id="btn-change-club-in-design"
                          onClick={() => setIsMexicoKitsModalOpen(true)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0 transition-all cursor-pointer border border-white/10 flex items-center gap-1"
                        >
                          <span>Cambiar Club</span>
                          <span>↺</span>
                        </button>
                      </div>
                    </div>

                    {/* Selector de 2 Versiones: Local y Visitante */}
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>Versiones de Diseño Oficiales (2):</span>
                        </span>
                        <button
                          type="button"
                          id="btn-return-standard-cuts"
                          onClick={() => {
                            setActiveMexicoKitId(null);
                            onCommitDesign({ ...design, mexicoKitId: null }, true);
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Ver cortes estándar ({availableFishDesigns.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2.5">
                        {/* Tarjeta Versión Local */}
                        {activeMexicoClubKits.homeKit && (
                          <button
                            type="button"
                            id="btn-switch-kit-local"
                            onClick={() => handleApplyMexicoKit(activeMexicoClubKits.homeKit)}
                            className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer group ${
                              activeMexicoClubKits.currentKit.edition === 'local'
                                ? 'bg-emerald-50/80 border-2 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  activeMexicoClubKits.currentKit.edition === 'local'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                🏠 Local
                              </span>
                              {activeMexicoClubKits.currentKit.edition === 'local' ? (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                  ✓ Activo en 3D
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                                  Seleccionar
                                </span>
                              )}
                            </div>

                            <div className="py-2 flex justify-center bg-slate-50/60 rounded-xl border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
                              <JerseyThumbnailMiniature kit={activeMexicoClubKits.homeKit} size={64} />
                            </div>

                            <div className="border-t border-slate-100 pt-1.5">
                              <h5 className="text-xs font-black text-slate-900 truncate" title={activeMexicoClubKits.homeKit.name}>
                                {activeMexicoClubKits.homeKit.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                                Corte: {activeMexicoClubKits.homeKit.patternId}
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Tarjeta Versión Visitante */}
                        {activeMexicoClubKits.awayKit && (
                          <button
                            type="button"
                            id="btn-switch-kit-away"
                            onClick={() => handleApplyMexicoKit(activeMexicoClubKits.awayKit)}
                            className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer group ${
                              activeMexicoClubKits.currentKit.edition === 'visitante'
                                ? 'bg-sky-50/80 border-2 border-sky-600 shadow-sm ring-2 ring-sky-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  activeMexicoClubKits.currentKit.edition === 'visitante'
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                ✈️ Visita
                              </span>
                              {activeMexicoClubKits.currentKit.edition === 'visitante' ? (
                                <span className="text-[10px] font-black text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                                  ✓ Activo en 3D
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                                  Seleccionar
                                </span>
                              )}
                            </div>

                            <div className="py-2 flex justify-center bg-slate-50/60 rounded-xl border border-slate-100 group-hover:bg-sky-50/40 transition-colors">
                              <JerseyThumbnailMiniature kit={activeMexicoClubKits.awayKit} size={64} />
                            </div>

                            <div className="border-t border-slate-100 pt-1.5">
                              <h5 className="text-xs font-black text-slate-900 truncate" title={activeMexicoClubKits.awayKit.name}>
                                {activeMexicoClubKits.awayKit.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                                Corte: {activeMexicoClubKits.awayKit.patternId}
                              </p>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Modo Normal: Todos los estilos de corte CAD (16 cortes) */
                  <>
                    {/* Banner de Acceso a Presets México Pro */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-rose-50 border border-slate-200 shadow-xs flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🇲🇽</span>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                            Presets México Pro (36 Uniformes)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          18 Locales + 18 Visitantes • 100% legales para Shopify
                        </p>
                      </div>
                      <button
                        id="btn-open-mexico-kits"
                        type="button"
                        onClick={() => setIsMexicoKitsModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs hover:scale-102"
                      >
                        Ver 36 Kits
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">
                        Estilos de corte disponibles ({availableFishDesigns.length}):
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {currentProduct.owayoCutCode}
                      </span>
                    </div>

                    {/* Cuadrícula Limpia Owayo: Solo Nombres de Estilos de Diseño (Sin imagen) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableFishDesigns.map((dMeta) => {
                        const isSelected = design.patternId === dMeta.id;
                        return (
                          <button
                            key={dMeta.id}
                            type="button"
                            onClick={() => {
                              setActiveMexicoKitId(null);
                              onCommitDesign({ ...design, patternId: dMeta.id, mexicoKitId: null }, true);
                            }}
                            className={`px-3 py-3 rounded-xl border text-center transition-all flex items-center justify-center cursor-pointer min-h-[46px] ${
                              isSelected
                                ? 'bg-slate-100 border-2 border-slate-900 text-slate-950 font-black shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold'
                            }`}
                          >
                            <span className="text-xs truncate w-full tracking-tight">
                              {dMeta.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Textura Geométrica Opcional sobre Zona A */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Trama Sublimada en Zona A</span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">
                      {Math.round((design.surfacePatternOpacity ?? 0.16) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ZONE_SURFACE_PATTERNS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => onCommitDesign({ ...design, surfacePatternId: pat.id }, true)}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border truncate cursor-pointer transition-colors ${
                          (design.surfacePatternId || 'none') === pat.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {pat.name}
                      </button>
                    ))}
                  </div>
                  {design.surfacePatternId && design.surfacePatternId !== 'none' && (
                    <input
                      type="range"
                      min="5"
                      max="55"
                      value={Math.round((design.surfacePatternOpacity ?? 0.16) * 100)}
                      style={rangeVars(Math.round((design.surfacePatternOpacity ?? 0.16) * 100), 5, 55)}
                      onChange={(e) =>
                        onCommitDesign(
                          { ...design, surfacePatternOpacity: Number(e.target.value) / 100 },
                          false
                        )
                      }
                      className="studio-range w-full"
                    />
                  )}
                </div>

                {/* Tejido Técnico Real */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Tejido Técnico (Micro-Relieve 3D)</span>
                  <div className="space-y-1.5">
                    {FABRIC_WEAVES.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onCommitDesign({ ...design, fabricWeaveId: w.id }, true)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                          design.fabricWeaveId === w.id
                            ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{w.name}</div>
                          <div className="text-[10px] text-slate-500">{w.subtitle}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {w.gsm}g
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PESTAÑA 2: COLORES SIMPLIFICADOS (OWAYO STYLE) ==================== */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* Bloques Horizontales de Color: Principal, Secundario, Cuello */}
                <div className="space-y-3">
                  {/* Fila 1: Color Principal + Patrón */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveColorZone('primary')}
                      className={`flex-1 p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                        activeColorZone === 'primary'
                          ? 'border-2 border-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                        style={{ backgroundColor: design.colorZones.primary?.hex || '#ffffff' }}
                      />
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-xs font-bold text-slate-800">Color principal</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {design.colorZones.primary?.hex}
                        </span>
                      </div>
                      {activeColorZone === 'primary' && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 z-10" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('design')}
                      title="Ver o cambiar patrón de diseño"
                      className="w-20 p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <div className="w-full h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        <Sparkles className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-1">Patrón</span>
                    </button>
                  </div>

                  {/* Fila 2: Segundo Color + Contorno */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveColorZone('secondary')}
                      className={`flex-1 p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                        activeColorZone === 'secondary'
                          ? 'border-2 border-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                        style={{ backgroundColor: design.colorZones.secondary?.hex || '#1d4ed8' }}
                      />
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-xs font-bold text-slate-800">Segundo color</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {design.colorZones.secondary?.hex}
                        </span>
                      </div>
                      {activeColorZone === 'secondary' && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 z-10" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveColorZone('accents')}
                      title="Color de detalles y contornos"
                      className={`w-20 p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        activeColorZone === 'accents'
                          ? 'border-2 border-slate-900 bg-white'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                        style={{ backgroundColor: design.colorZones.accents?.hex || '#facc15' }}
                      />
                      <span className="text-[11px] font-bold text-slate-700 mt-1">Contorno</span>
                    </button>
                  </div>

                  {/* Fila 3: Color Cuello (+ Mangas si aplica) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveColorZone('collar')}
                      className={`flex-1 p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                        activeColorZone === 'collar'
                          ? 'border-2 border-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                        style={{
                          backgroundColor:
                            design.colorZones.collar?.hex ||
                            design.colorZones.accents?.hex ||
                            design.colorZones.primary?.hex ||
                            '#101820',
                        }}
                      />
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-xs font-bold text-slate-800">
                          {currentProduct.garmentShape === 'basketball_tank' ? 'Ribetes Sisa / Cuello' : 'Color cuello'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {design.colorZones.collar?.hex || design.colorZones.accents?.hex}
                        </span>
                      </div>
                      {activeColorZone === 'collar' && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 z-10" />
                      )}
                    </button>

                    {/* Zona adicional si la prenda tiene mangas (sleeves) */}
                    {design.colorZones.sleeves && (
                      <button
                        type="button"
                        onClick={() => setActiveColorZone('sleeves')}
                        title="Mangas / Puños"
                        className={`w-20 p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          activeColorZone === 'sleeves'
                            ? 'border-2 border-slate-900 bg-white'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg border border-black/10 shadow-inner"
                          style={{ backgroundColor: design.colorZones.sleeves?.hex || '#ffffff' }}
                        />
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Mangas</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Paleta Oficial de 24 Colores Deportivos Owayo */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Paleta Deportiva ({activeColorZone === 'primary' ? 'Color principal' : activeColorZone === 'secondary' ? 'Segundo color' : 'Color cuello'}):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onCommitDesign(
                          {
                            ...design,
                            colorZones: {
                              ...design.colorZones,
                              primary: design.colorZones.secondary,
                              secondary: design.colorZones.primary,
                            },
                          },
                          true
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Invertir Color Principal y Segundo Color"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Invertir A ↔ B</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {ESSENTIAL_SPORT_COLORS.map((c) => {
                      const isCur =
                        design.colorZones[activeColorZone]?.hex?.toUpperCase() === c.hex.toUpperCase();
                      const isLight = ['#FFFFFF', '#F1F5F9', '#94A3B8', '#FACC15', '#38BDF8'].includes(c.hex.toUpperCase());
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            updateColorZone(activeColorZone, {
                              hex: c.hex,
                              name: c.name,
                              code: c.hex,
                            })
                          }
                          title={c.name}
                          className={`w-full aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
                            isCur
                              ? 'ring-2 ring-slate-900 scale-105 shadow-md z-10'
                              : 'hover:scale-105 border border-slate-300/80 shadow-xs'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isCur && (
                            <Check className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector RGB / HEX Libre para colores corporativos exactos */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">¿Tono institucional exacto?</span>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors">
                      <span>Selector Libre</span>
                      <input
                        type="color"
                        value={design.colorZones[activeColorZone]?.hex || '#1d4ed8'}
                        onChange={(e) =>
                          updateColorZone(activeColorZone, {
                            hex: e.target.value,
                            name: 'Personalizado',
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer border-0"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PESTAÑA 3: TEXTO (NOMBRES, NÚMEROS Y PATROCINADORES) ==================== */}
            {activeTab === 'text' && (
              <div className="space-y-3.5">
                {/* VISTA CONTEXTUAL DE DETALLE: EDITAR TEXTO LIBRE O SLOT VARIABLE */}
                {isEditingTextDetail && (selectedTextDecal || (selectedSlotKey && design.variableSlots?.[selectedSlotKey])) ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingTextDetail(false)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a lista de textos y dorsales
                    </button>

                    {selectedTextDecal ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">Editar Texto Fijo (Idéntico en todo el lote)</span>
                          <button
                            type="button"
                            onClick={() => deleteDecal(selectedTextDecal.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300"
                            title="Eliminar texto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={selectedTextDecal.text || ''}
                          onChange={(e) =>
                            updateDecal(
                              selectedTextDecal.id,
                              {
                                text: e.target.value,
                                label: `Texto: ${e.target.value.slice(0, 18) || 'Vacío'}`,
                              },
                              false
                            )
                          }
                          placeholder="Escribe lema, club o patrocinador..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                        />

                        {/* Pieza destino + Mostrar solo en zona (`clampToZone`) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Pieza de la prenda</label>
                            <select
                              value={selectedTextDecal.panel || droppablePanels[0]?.panelId}
                              onChange={(e) => {
                                const nextP = e.target.value;
                                const sp = getPartSpec(design.productModelId, nextP);
                                updateDecal(
                                  selectedTextDecal.id,
                                  {
                                    panel: nextP,
                                    centerMm: {
                                      x: +(sp.widthMm * sp.snapCenterU).toFixed(1),
                                      y: +(sp.heightMm * 0.45).toFixed(1),
                                    },
                                  },
                                  true
                                );
                                setPanel2D(nextP);
                                if (PANEL_TO_CAMERA[nextP]) setCameraPreset(PANEL_TO_CAMERA[nextP]);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            >
                              {droppablePanels.map((p) => (
                                <option key={p.panelId} value={p.panelId}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Mostrar solo en zona</label>
                            <select
                              value={selectedTextDecal.clampToZone || 'ALL'}
                              onChange={(e) =>
                                updateDecal(selectedTextDecal.id, { clampToZone: e.target.value }, true)
                              }
                              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            >
                              <option value="ALL">Toda la pieza</option>
                              <option value="A">Solo Zona A</option>
                              <option value="B">Solo Zona B</option>
                              <option value="C">Solo Zona C</option>
                              <option value="D">Solo Zona D</option>
                            </select>
                          </div>
                        </div>

                        {/* Tipografías Deportivas */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Fuente Atlética</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {SPORT_FONTS.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                style={{ fontFamily: f.family }}
                                onClick={() => updateDecal(selectedTextDecal.id, { fontFamily: f.family }, true)}
                                className={`px-2.5 py-1.5 rounded-xl border text-sm tracking-wide ${
                                  selectedTextDecal.fontFamily === f.family
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                    : 'bg-slate-900 text-white border-slate-800'
                                }`}
                              >
                                {f.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Escala, Rotación y Arco Circular con Steppers Owayo (- / +) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">Tamaño ({Math.round((selectedTextDecal.scale ?? 1) * 100)}%)</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateDecal(
                                    selectedTextDecal.id,
                                    { scale: Math.max(0.25, +((selectedTextDecal.scale ?? 1) - 0.1).toFixed(2)) },
                                    true
                                  )
                                }
                                className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateDecal(
                                    selectedTextDecal.id,
                                    { scale: Math.min(3.0, +((selectedTextDecal.scale ?? 1) + 0.1).toFixed(2)) },
                                    true
                                  )
                                }
                                className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="25"
                            max="300"
                            value={Math.round((selectedTextDecal.scale ?? 1) * 100)}
                            style={rangeVars(Math.round((selectedTextDecal.scale ?? 1) * 100), 25, 300)}
                            onChange={(e) =>
                              updateDecal(selectedTextDecal.id, { scale: Number(e.target.value) / 100 }, false)
                            }
                            className="studio-range"
                          />

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">Rotación ({selectedTextDecal.rotationDeg || 0}°)</span>
                            <button
                              type="button"
                              onClick={() => updateDecal(selectedTextDecal.id, { rotationDeg: 0 }, true)}
                              className="text-[10px] text-amber-300 font-mono"
                            >
                              Reset 0°
                            </button>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedTextDecal.rotationDeg || 0}
                            style={rangeVars(selectedTextDecal.rotationDeg || 0, -180, 180)}
                            onChange={(e) =>
                              updateDecal(
                                selectedTextDecal.id,
                                { rotationDeg: snapRotationAngle(Number(e.target.value), 5) },
                                false
                              )
                            }
                            className="studio-range"
                          />

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">Curvatura Circular ({selectedTextDecal.archDeg || 0}°)</span>
                            <button
                              type="button"
                              onClick={() => updateDecal(selectedTextDecal.id, { archDeg: 0 }, true)}
                              className="text-[10px] text-amber-300 font-mono"
                            >
                              Recto
                            </button>
                          </div>
                          <input
                            type="range"
                            min="-120"
                            max="120"
                            value={selectedTextDecal.archDeg || 0}
                            style={rangeVars(selectedTextDecal.archDeg || 0, -120, 120)}
                            onChange={(e) =>
                              updateDecal(selectedTextDecal.id, { archDeg: Number(e.target.value) }, false)
                            }
                            className="studio-range"
                          />
                        </div>

                        {/* Color de Relleno y Contorno */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <span>Relleno</span>
                            <input
                              type="color"
                              value={selectedTextDecal.fillHex || '#ffffff'}
                              onChange={(e) =>
                                updateDecal(selectedTextDecal.id, { fillHex: e.target.value }, true)
                              }
                              className="w-7 h-6 rounded cursor-pointer"
                            />
                          </label>
                          <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <span>Contorno</span>
                            <input
                              type="color"
                              value={selectedTextDecal.strokeHex || '#101820'}
                              onChange={(e) =>
                                updateDecal(selectedTextDecal.id, { strokeHex: e.target.value }, true)
                              }
                              className="w-7 h-6 rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        <label className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-200 cursor-pointer">
                          <span>Fijar texto en el tejido (evitar arrastre accidental)</span>
                          <input
                            type="checkbox"
                            {...{ switch: '' }}
                            checked={Boolean(selectedTextDecal.pinned)}
                            onChange={(e) =>
                              updateDecal(selectedTextDecal.id, { pinned: e.target.checked }, true)
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      /* Inspector de Slot Variable (`Nombre` / `Dorsal` vinculado a Ejemplares) */
                      (() => {
                        const slot = design.variableSlots[selectedSlotKey];
                        const isName = selectedSlotKey === 'playerNameBack';
                        const sizeField = isName ? 'capHeightMm' : 'heightMm';
                        const curSizeMm = slot[sizeField] || (isName ? 52 : 68);
                        return (
                          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-black text-white block">
                                  {SLOT_LABELS[selectedSlotKey] || selectedSlotKey}
                                </span>
                                <span className="text-[10px] text-emerald-400">
                                  Vinculado automáticamente a los {totalUnits} jugadores de «Ejemplares»
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                {...{ switch: '' }}
                                checked={Boolean(slot.enabled)}
                                onChange={(e) =>
                                  updateVariableSlot(
                                    selectedSlotKey,
                                    { ...slot, enabled: e.target.checked },
                                    true
                                  )
                                }
                              />
                            </div>

                            {/* Selector de pierna cuando es número de Short */}
                            {selectedSlotKey === 'playerNumberShorts' && (
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Pierna del Short</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { id: 'right_leg', label: 'Pierna Derecha' },
                                    { id: 'left_leg', label: 'Pierna Izquierda' },
                                  ].map((leg) => (
                                    <button
                                      key={leg.id}
                                      type="button"
                                      onClick={() => {
                                        const sp = getPartSpec(design.productModelId, leg.id);
                                        updateVariableSlot(
                                          'playerNumberShorts',
                                          {
                                            ...slot,
                                            panel: leg.id,
                                            centerMm: {
                                              x: +(sp.widthMm * sp.snapCenterU).toFixed(1),
                                              y: slot.centerMm.y,
                                            },
                                          },
                                          true
                                        );
                                        setPanel2D(leg.id);
                                        setCameraPreset(leg.id);
                                      }}
                                      className={`py-1.5 rounded-xl text-xs font-bold border ${
                                        slot.panel === leg.id
                                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                                          : 'bg-slate-900 text-slate-300 border-slate-800'
                                      }`}
                                    >
                                      {leg.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Fuente Atlética del Dorsal/Nombre */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {SPORT_FONTS.map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  style={{ fontFamily: f.family }}
                                  onClick={() =>
                                    updateVariableSlot(selectedSlotKey, { ...slot, fontFamily: f.family }, true)
                                  }
                                  className={`px-2.5 py-1.5 rounded-xl border text-sm ${
                                    slot.fontFamily === f.family
                                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                      : 'bg-slate-900 text-white border-slate-800'
                                  }`}
                                >
                                  {f.name}
                                </button>
                              ))}
                            </div>

                            {/* Altura física real en milímetros / centímetros */}
                            <div>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-300">Altura oficial: {(curSizeMm / 10).toFixed(1)} cm</span>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateVariableSlot(
                                        selectedSlotKey,
                                        { ...slot, [sizeField]: Math.max(24, curSizeMm - 6) },
                                        true
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateVariableSlot(
                                        selectedSlotKey,
                                        { ...slot, [sizeField]: Math.min(280, curSizeMm + 6) },
                                        true
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min={isName ? 28 : 32}
                                max={isName ? 95 : 280}
                                value={curSizeMm}
                                style={rangeVars(curSizeMm, isName ? 28 : 32, isName ? 95 : 280)}
                                onChange={(e) =>
                                  updateVariableSlot(
                                    selectedSlotKey,
                                    { ...slot, [sizeField]: Number(e.target.value) },
                                    false
                                  )
                                }
                                className="studio-range"
                              />
                            </div>

                            {isName && (
                              <div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-300">Arco NBA / Europeo ({slot.archDeg || 0}°)</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateVariableSlot(selectedSlotKey, { ...slot, archDeg: 0 }, true)
                                    }
                                    className="text-[10px] font-mono text-amber-300"
                                  >
                                    Recto
                                  </button>
                                </div>
                                <input
                                  type="range"
                                  min="-65"
                                  max="65"
                                  value={slot.archDeg || 0}
                                  style={rangeVars(slot.archDeg || 0, -65, 65)}
                                  onChange={(e) =>
                                    updateVariableSlot(
                                      selectedSlotKey,
                                      { ...slot, archDeg: Number(e.target.value) },
                                      false
                                    )
                                  }
                                  className="studio-range"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                <span>Color Número</span>
                                <input
                                  type="color"
                                  value={slot.fillHex || '#ffffff'}
                                  onChange={(e) =>
                                    updateVariableSlot(
                                      selectedSlotKey,
                                      { ...slot, fillHex: e.target.value },
                                      true
                                    )
                                  }
                                  className="w-7 h-6 rounded cursor-pointer"
                                />
                              </label>
                              <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                <span>Filete Exterior</span>
                                <input
                                  type="color"
                                  value={slot.outlineHex || '#101820'}
                                  onChange={(e) =>
                                    updateVariableSlot(
                                      selectedSlotKey,
                                      { ...slot, outlineHex: e.target.value },
                                      true
                                    )
                                  }
                                  className="w-7 h-6 rounded cursor-pointer"
                                />
                              </label>
                            </div>

                            <label className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-200 cursor-pointer">
                              <span>Fijar posición (Pin)</span>
                              <input
                                type="checkbox"
                                {...{ switch: '' }}
                                checked={Boolean(slot.pinned)}
                                onChange={(e) =>
                                  updateVariableSlot(
                                    selectedSlotKey,
                                    { ...slot, pinned: e.target.checked },
                                    true
                                  )
                                }
                              />
                            </label>
                          </div>
                        );
                      })()
                    )}
                  </div>
                ) : (
                  /* VISTA GENERAL DE TEXTOS: SLOTS DEL EQUIPO + TEXTOS FIJOS */
                  <div className="space-y-3.5">
                    {/* Bloque Destacado 1: Edición Directa de Dorsal y Nombre en Espalda */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            Dorsal &amp; Nombre en Espalda
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCameraPreset('back')}
                          className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Girar a Espalda</span>
                        </button>
                      </div>

                      {/* Nombre o Apellido */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nombre o Apellidos en la Espalda:
                        </label>
                        <input
                          type="text"
                          value={activePlayer.name || ''}
                          onChange={(e) => {
                            const nextName = e.target.value.toUpperCase();
                            const nextRoster = [...roster];
                            if (nextRoster[activeRosterIndex]) {
                              nextRoster[activeRosterIndex] = { ...nextRoster[activeRosterIndex], name: nextName };
                            } else if (nextRoster[0]) {
                              nextRoster[0] = { ...nextRoster[0], name: nextName };
                            }
                            onUpdateRoster(nextRoster);
                            if (!design.variableSlots?.playerNameBack?.enabled) {
                              updateVariableSlot('playerNameBack', { ...design.variableSlots?.playerNameBack, enabled: true }, false);
                            }
                          }}
                          placeholder="Ej: RODRÍGUEZ, VALVERDE, etc."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-extrabold text-sm text-slate-900 uppercase focus:outline-none focus:border-sky-500 shadow-xs"
                        />
                      </div>

                      {/* Número Dorsal */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Número Dorsal:</label>
                          <input
                            type="text"
                            maxLength={3}
                            value={activePlayer.number || ''}
                            onChange={(e) => {
                              const nextNum = e.target.value;
                              const nextRoster = [...roster];
                              if (nextRoster[activeRosterIndex]) {
                                nextRoster[activeRosterIndex] = { ...nextRoster[activeRosterIndex], number: nextNum };
                              } else if (nextRoster[0]) {
                                nextRoster[0] = { ...nextRoster[0], number: nextNum };
                              }
                              onUpdateRoster(nextRoster);
                              if (!design.variableSlots?.playerNumberBack?.enabled) {
                                updateVariableSlot('playerNumberBack', { ...design.variableSlots?.playerNumberBack, enabled: true }, false);
                              }
                            }}
                            placeholder="10"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-black text-slate-900 text-center text-lg focus:outline-none focus:border-sky-500 shadow-xs"
                          />
                        </div>

                        {/* Color del Dorsal */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Color del Dorsal:</label>
                          <div className="flex items-center gap-1.5 h-[46px]">
                            {['#ffffff', '#000000', '#facc15', '#ccff00', '#dc2626', '#1d4ed8'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  updateVariableSlot('playerNumberBack', { ...design.variableSlots?.playerNumberBack, fillHex: c }, true);
                                  updateVariableSlot('playerNameBack', { ...design.variableSlots?.playerNameBack, fillHex: c }, true);
                                }}
                                className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
                                  design.variableSlots?.playerNumberBack?.fillHex === c ? 'border-sky-600 scale-105 shadow-xs' : 'border-slate-300'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tipografía Atlética */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Tipografía Atlética Oficial:</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SPORT_FONTS.slice(0, 6).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              style={{ fontFamily: f.family }}
                              onClick={() => {
                                updateVariableSlot('playerNumberBack', { ...design.variableSlots?.playerNumberBack, fontFamily: f.family }, true);
                                updateVariableSlot('playerNameBack', { ...design.variableSlots?.playerNameBack, fontFamily: f.family }, true);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer truncate ${
                                design.variableSlots?.playerNumberBack?.fontFamily === f.family
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddStaticText}
                      className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-sky-600" />
                      <span>Añadir texto adicional / lema / sponsor</span>
                    </button>

                    {/* Bloque 1: Nombres y Números individuales por jugador (`Ejemplares`) */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">Nombres y Números de Jugador</span>
                        <button
                          type="button"
                          onClick={() => setIsRosterModalOpen(true)}
                          className="text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          Editar lista ({totalUnits}) →
                        </button>
                      </div>

                      {variableSlotKeysForProduct.map((sKey) => {
                        const slot = design.variableSlots?.[sKey];
                        if (!slot) return null;
                        return (
                          <div
                            key={sKey}
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlotKey(sKey);
                                setSelectedDecalId(null);
                                setIsEditingTextDetail(true);
                                const targetP =
                                  sKey === 'playerNameBack' || sKey === 'playerNumberBack'
                                    ? 'back'
                                    : sKey === 'playerNumberFront'
                                    ? 'front'
                                    : slot.panel || 'front';
                                setPanel2D(targetP);
                                if (PANEL_TO_CAMERA[targetP]) setCameraPreset(PANEL_TO_CAMERA[targetP]);
                              }}
                              className="text-left flex-1 min-w-0"
                            >
                              <div className="text-xs font-bold text-slate-100 truncate">
                                {SLOT_LABELS[sKey] || sKey}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Clic para cambiar fuente, color, arco o altura
                              </div>
                            </button>
                            <input
                              type="checkbox"
                              {...{ switch: '' }}
                              aria-label={`Activar ${SLOT_LABELS[sKey]}`}
                              checked={Boolean(slot.enabled)}
                              onChange={(e) =>
                                updateVariableSlot(sKey, { ...slot, enabled: e.target.checked }, true)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Bloque 2: Textos Idénticos en todas las prendas */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-black text-white block">
                        Textos Fijos en la Prenda ({textDecals.length})
                      </span>
                      {textDecals.length === 0 ? (
                        <p className="text-[11px] text-slate-400">
                          Aún no hay textos fijos. Pulsa «Añadir nuevo texto» arriba.
                        </p>
                      ) : (
                        textDecals.map((td) => (
                          <div
                            key={td.id}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDecalId(td.id);
                                setSelectedSlotKey(null);
                                setIsEditingTextDetail(true);
                                if (td.panel) {
                                  setPanel2D(td.panel);
                                  if (PANEL_TO_CAMERA[td.panel]) setCameraPreset(PANEL_TO_CAMERA[td.panel]);
                                }
                              }}
                              className="text-left flex-1 min-w-0"
                            >
                              <div className="text-xs font-bold text-amber-300 truncate">{td.text}</div>
                              <div className="text-[10px] text-slate-400">
                                Pieza: {getPartSpec(design.productModelId, td.panel).shortLabel}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDecal(td.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== PESTAÑA 4: LOGO (PNG / SVG SIN LÍMITES + EDITAR LOGOTIPO) ==================== */}
            {activeTab === 'logo' && (
              <div className="space-y-3.5">
                {isEditingLogoDetail && selectedLogoDecal ? (
                  /* INSPECTOR CONTEXTUAL OWAYO: `EDITAR EL LOGOTIPO` */
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingLogoDetail(false)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a galería y carga de logos
                    </button>

                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                      {/* Cabecera con miniatura cuadriculada + Auditoría DPI */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl checkered-preview border border-slate-700 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                          {selectedLogoDecal.artworkId &&
                          artworkRegistry[selectedLogoDecal.artworkId]?.previewUrl ? (
                            <img
                              src={artworkRegistry[selectedLogoDecal.artworkId].previewUrl}
                              alt={selectedLogoDecal.label}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Shield className="w-7 h-7 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="text-xs font-black text-white truncate">
                            {selectedLogoDecal.label}
                          </div>
                          {(() => {
                            const dpi = calculateEffectiveDpi(
                              selectedLogoDecal.widthPx || 1600,
                              selectedLogoDecal.sizeMm.width,
                              selectedLogoDecal.scale ?? 1,
                              selectedLogoDecal.isVector
                            );
                            return (
                              <span
                                className={`inline-block text-[10px] px-2 py-0.5 rounded-md border font-bold ${dpi.colorClass}`}
                              >
                                {dpi.label}
                              </span>
                            );
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteDecal(selectedLogoDecal.id)}
                          title="Eliminar logotipo"
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Pieza + Mostrar solo en zona (`clampToZone` de Owayo) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Pieza</label>
                          <select
                            value={selectedLogoDecal.panel || droppablePanels[0]?.panelId}
                            onChange={(e) => {
                              const nextP = e.target.value;
                              const sp = getPartSpec(design.productModelId, nextP);
                              updateDecal(
                                selectedLogoDecal.id,
                                {
                                  panel: nextP,
                                  centerMm: {
                                    x: +(sp.widthMm * sp.snapCenterU).toFixed(1),
                                    y: +(sp.heightMm * 0.42).toFixed(1),
                                  },
                                },
                                true
                              );
                              setPanel2D(nextP);
                              if (PANEL_TO_CAMERA[nextP]) setCameraPreset(PANEL_TO_CAMERA[nextP]);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            {droppablePanels.map((p) => (
                              <option key={p.panelId} value={p.panelId}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Mostrar solo en</label>
                          <select
                            value={selectedLogoDecal.clampToZone || 'ALL'}
                            onChange={(e) =>
                              updateDecal(selectedLogoDecal.id, { clampToZone: e.target.value }, true)
                            }
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="ALL">Toda la pieza</option>
                            <option value="A">Solo Zona A</option>
                            <option value="B">Solo Zona B</option>
                            <option value="C">Solo Zona C</option>
                            <option value="D">Solo Zona D</option>
                          </select>
                        </div>
                      </div>

                      {/* Acciones Rápidas: Centrar, Espejar en manga/pierna opuesta, Voltear y Orden Z */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const sp = getPartSpec(design.productModelId, selectedLogoDecal.panel || 'front');
                            updateDecal(
                              selectedLogoDecal.id,
                              {
                                centerMm: {
                                  ...selectedLogoDecal.centerMm,
                                  x: +(sp.widthMm * sp.snapCenterU).toFixed(1),
                                },
                              },
                              true
                            );
                          }}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-sky-300 flex items-center justify-center gap-1"
                        >
                          <AlignCenterVertical className="w-3.5 h-3.5" />
                          Centrar en eje
                        </button>
                        <button
                          type="button"
                          onClick={() => mirrorDecalToSymmetricPiece(selectedLogoDecal)}
                          className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Espejar simétrico
                        </button>
                      </div>

                      {/* Sliders con botones - / + de Escala, Rotación y Marca de Agua */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">
                            Tamaño ({((selectedLogoDecal.sizeMm.width * (selectedLogoDecal.scale ?? 1)) / 10).toFixed(1)} cm)
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateDecal(
                                  selectedLogoDecal.id,
                                  { scale: Math.max(0.2, +((selectedLogoDecal.scale ?? 1) - 0.1).toFixed(2)) },
                                  true
                                )
                              }
                              className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDecal(
                                  selectedLogoDecal.id,
                                  { scale: Math.min(3.5, +((selectedLogoDecal.scale ?? 1) + 0.1).toFixed(2)) },
                                  true
                                )
                              }
                              className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="350"
                          value={Math.round((selectedLogoDecal.scale ?? 1) * 100)}
                          style={rangeVars(Math.round((selectedLogoDecal.scale ?? 1) * 100), 20, 350)}
                          onChange={(e) =>
                            updateDecal(selectedLogoDecal.id, { scale: Number(e.target.value) / 100 }, false)
                          }
                          className="studio-range"
                        />

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">Rotación ({selectedLogoDecal.rotationDeg || 0}°)</span>
                          <button
                            type="button"
                            onClick={() => updateDecal(selectedLogoDecal.id, { rotationDeg: 0 }, true)}
                            className="text-[10px] font-mono text-amber-300"
                          >
                            0°
                          </button>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedLogoDecal.rotationDeg || 0}
                          style={rangeVars(selectedLogoDecal.rotationDeg || 0, -180, 180)}
                          onChange={(e) =>
                            updateDecal(
                              selectedLogoDecal.id,
                              { rotationDeg: snapRotationAngle(Number(e.target.value), 5) },
                              false
                            )
                          }
                          className="studio-range"
                        />

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">
                            Opacidad / Marca de Agua ({Math.round((selectedLogoDecal.opacity ?? 1) * 100)}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={Math.round((selectedLogoDecal.opacity ?? 1) * 100)}
                          style={rangeVars(Math.round((selectedLogoDecal.opacity ?? 1) * 100), 10, 100)}
                          onChange={(e) =>
                            updateDecal(selectedLogoDecal.id, { opacity: Number(e.target.value) / 100 }, false)
                          }
                          className="studio-range"
                        />
                      </div>

                      {/* Volteo Horizontal/Vertical + Capas Z */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(selectedLogoDecal.id, { flipX: !selectedLogoDecal.flipX }, true)
                          }
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1 ${
                            selectedLogoDecal.flipX
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          <FlipHorizontal2 className="w-3.5 h-3.5" />
                          Espejo H
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(selectedLogoDecal.id, { flipY: !selectedLogoDecal.flipY }, true)
                          }
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1 ${
                            selectedLogoDecal.flipY
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          <FlipVertical2 className="w-3.5 h-3.5" />
                          Espejo V
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(
                              selectedLogoDecal.id,
                              { zIndex: (selectedLogoDecal.zIndex ?? 10) + 6 },
                              true
                            )
                          }
                          title="Traer al frente"
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDecal(
                              selectedLogoDecal.id,
                              { zIndex: Math.max(1, (selectedLogoDecal.zIndex ?? 10) - 6) },
                              true
                            )
                          }
                          title="Enviar atrás"
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Switches Nativos Owayo: Quita-fondo blanco, Recoloración Pantone y Fijar Logo */}
                      {selectedLogoDecal.artworkId && (
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer">
                            <span>Eliminar fondo blanco automáticamente</span>
                            <input
                              type="checkbox"
                              {...{ switch: '' }}
                              checked={Boolean(selectedLogoDecal.removeWhiteBg)}
                              onChange={(e) =>
                                updateDecal(selectedLogoDecal.id, { removeWhiteBg: e.target.checked }, true)
                              }
                            />
                          </label>

                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-300">Recolorear silueta (Tinte Pantone)</span>
                            <div className="flex items-center gap-1.5">
                              {selectedLogoDecal.tintHex && (
                                <button
                                  type="button"
                                  onClick={() => updateDecal(selectedLogoDecal.id, { tintHex: '' }, true)}
                                  className="text-[10px] text-amber-300 font-bold"
                                >
                                  Original
                                </button>
                              )}
                              <input
                                type="color"
                                value={selectedLogoDecal.tintHex || '#ffffff'}
                                onChange={(e) =>
                                  updateDecal(selectedLogoDecal.id, { tintHex: e.target.value }, true)
                                }
                                className="w-7 h-6 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <label className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-200 cursor-pointer">
                        <span>Fijar logotipo (evitar mover por error)</span>
                        <input
                          type="checkbox"
                          {...{ switch: '' }}
                          checked={Boolean(selectedLogoDecal.pinned)}
                          onChange={(e) =>
                            updateDecal(selectedLogoDecal.id, { pinned: e.target.checked }, true)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  /* VISTA GALERÍA DE LOGOS: SUBIR PNG/SVG + ESCUDOS DEPORTIVOS + CAPAS EN PRENDA */
                  <div className="space-y-3.5">
                    {/* Zona Drag & Drop Multi-Archivo */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverUpload(true);
                      }}
                      onDragLeave={() => setIsDragOverUpload(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverUpload(false);
                        handleFilesSelected(e.dataTransfer.files);
                      }}
                      className={`p-4 rounded-2xl border-2 border-dashed text-center transition-colors ${
                        isDragOverUpload
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-slate-700 bg-slate-950/80 hover:border-amber-400/60'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".png,.svg,.webp,.jpg,.jpeg,image/*"
                        onChange={(e) => {
                          handleFilesSelected(e.target.files);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                      <p className="text-xs font-black text-white">
                        Cargar archivos PNG, SVG, WebP o JPG
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">
                        Sanitizador SVG vectorial infinito + recorte automático de márgenes transparentes
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
                      >
                        Seleccionar archivos
                      </button>
                    </div>

                    {/* Logos activos colocados actualmente en la prenda */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-black text-white block">
                        Logos colocados en esta prenda ({logoDecals.length})
                      </span>
                      {logoDecals.length === 0 ? (
                        <p className="text-[11px] text-slate-400">
                          Sube tu escudo o elige uno de la logoteca deportiva abajo.
                        </p>
                      ) : (
                        logoDecals.map((ld) => (
                          <div
                            key={ld.id}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDecalId(ld.id);
                                setSelectedSlotKey(null);
                                setIsEditingLogoDetail(true);
                                if (ld.panel) {
                                  setPanel2D(ld.panel);
                                  if (PANEL_TO_CAMERA[ld.panel]) setCameraPreset(PANEL_TO_CAMERA[ld.panel]);
                                }
                              }}
                              className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                            >
                              <span className="w-9 h-9 rounded-lg checkered-preview border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden p-1">
                                {ld.artworkId && artworkRegistry[ld.artworkId]?.previewUrl ? (
                                  <img
                                    src={artworkRegistry[ld.artworkId].previewUrl}
                                    alt={ld.label}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <Shield className="w-4 h-4 text-amber-400" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{ld.label}</div>
                                <div className="text-[10px] text-slate-400">
                                  {getPartSpec(design.productModelId, ld.panel).shortLabel} • Clic para editar
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDecal(ld.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Mis Archivos Subidos en esta sesión (Reutilizables entre Camiseta y Short) */}
                    {uploadedLibrary.length > 0 && (
                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-xs font-black text-amber-300 block">
                          Mis Logotipos Cargados (Clic para insertar en Camisa o Short)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedLibrary.map((art) => (
                            <button
                              key={art.artworkId}
                              type="button"
                              onClick={() => {
                                const dec = insertArtworkOnPanel(art, panel2D);
                                onCommitDesign({ ...design, decals: [...allDecals, dec] }, true);
                                setSelectedDecalId(dec.id);
                                setIsEditingLogoDetail(true);
                              }}
                              className="p-2 rounded-xl checkered-preview border border-slate-700 hover:border-amber-400 flex flex-col items-center gap-1"
                            >
                              <img
                                src={art.previewUrl}
                                alt={art.fileName}
                                className="h-10 w-full object-contain"
                              />
                              <span className="text-[9px] font-bold text-slate-200 truncate w-full text-center">
                                {art.fileName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Logoteca Deportiva Vectorial Integrada */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-black text-slate-200 block">
                        Logoteca Deportiva Vectorial (300+ DPI)
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {VECTOR_CREST_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleAddPresetCrest(preset)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-200 truncate">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BARRA INFERIOR OWAYO DENTRO DEL PANEL LATERAL */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            {/* 5 Acciones: Guardar | Mis bocetos | Ejemplares | Revisión del diseño | Compartir diseño */}
            <div className="grid grid-cols-5 gap-1 text-center">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer group"
                title="Guardar diseño actual"
              >
                <Save className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold tracking-tight text-slate-700 leading-none">Guardar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer group"
                title="Abrir mis bocetos guardados"
              >
                <FolderOpen className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold tracking-tight text-slate-700 leading-none">Mis bocetos</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer group"
                title="Lista de ejemplares y tallas"
              >
                <Users className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold tracking-tight text-slate-700 leading-none">Ejemplares</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer group"
                title="Revisar resolución y reglas de costura"
              >
                <ClipboardCheck
                  className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                    designReviewChecks.hasWarnings ? 'text-amber-500' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                />
                <span className="text-[10px] font-semibold tracking-tight text-slate-700 leading-none">Revisión</span>
              </button>

              <button
                type="button"
                id="btn-open-production-mold"
                onClick={() => setIsProductionMoldModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-blue-700 hover:text-blue-950 hover:bg-blue-50 transition-colors cursor-pointer group border border-blue-200/80 shadow-xs"
                title="Previsualizar plantilla técnica de confección y corte a escala real 1:1"
              >
                <Scissors className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-tight text-blue-700 leading-none">Plantilla</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                  showToast('Enlace de diseño copiado para compartir');
                }}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer group"
                title="Compartir enlace de este diseño"
              >
                <Share2 className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold tracking-tight text-slate-700 leading-none">Compartir</span>
              </button>
            </div>

            {/* Resumen de Precio y Botón Prominente Añadir a la Cesta */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {totalUnits} uds • ${unitPrice.toFixed(2)} c/u
                </div>
                <div className="text-base font-black text-slate-900">
                  ${totalPrice.toFixed(2)} USD
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenProductionModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Añadir a la cesta</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ==================== MODAL 1: EJEMPLARES (LISTA DE TALLAS, NOMBRES Y NÚMEROS OWAYO) ==================== */}
      <LightDismissModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        titleId="roster-modal-title"
        subtitle="Tabla Relacional Einzelexemplare Owayo (Sin duplicar imágenes)"
        title={`Ejemplares del Equipo (${totalUnits} prendas • $${totalPrice.toFixed(2)} USD)`}
        maxWidthClass="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-300">
              Cada fila genera su propio nombre y dorsal vinculados al mismo ID maestro{' '}
              <code className="text-amber-300 font-mono">{design.designId}</code>. Haz clic en «Ver en 3D» para inspeccionar cualquier talla.
            </p>
            <button
              type="button"
              onClick={() =>
                onUpdateRoster([
                  ...roster,
                  {
                    id: `p_${Date.now()}`,
                    name: 'NUEVO JUGADOR',
                    number: String(roster.length + 1),
                    size: 'L',
                    cut: 'MEN_PRO_SLIM',
                    qty: 1,
                  },
                ])
              }
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Añadir Jugador / Talla
            </button>
          </div>

          <div className="roster-table-wrapper rounded-2xl border border-slate-800 bg-slate-950">
            <table className="roster-data-table text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 text-[11px] uppercase">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Corte</th>
                  <th className="p-2.5">Talla</th>
                  <th className="p-2.5">Cant.</th>
                  <th className="p-2.5">Nombre Espalda</th>
                  <th className="p-2.5">Número</th>
                  <th className="p-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {roster.map((row, idx) => {
                  const isPreviewed = idx === activeRosterIndex;
                  return (
                    <tr
                      key={row.id || idx}
                      className={isPreviewed ? 'bg-amber-400/10' : 'hover:bg-slate-900/50'}
                    >
                      <th scope="row" className="p-2.5 font-mono text-amber-300">
                        {String(idx + 1).padStart(2, '0')}
                      </th>
                      <td className="p-2">
                        <select
                          value={row.cut}
                          onChange={(e) =>
                            onUpdateRoster(
                              roster.map((r, i) => (i === idx ? { ...r, cut: e.target.value } : r))
                            )
                          }
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                        >
                          {CUT_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={row.size}
                          onChange={(e) =>
                            onUpdateRoster(
                              roster.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r))
                            )
                          }
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
                        >
                          {SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={row.qty}
                          onChange={(e) =>
                            onUpdateRoster(
                              roster.map((r, i) =>
                                i === idx ? { ...r, qty: Math.max(1, Number(e.target.value) || 1) } : r
                              )
                            )
                          }
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            onUpdateRoster(
                              roster.map((r, i) =>
                                i === idx ? { ...r, name: e.target.value.toUpperCase() } : r
                              )
                            )
                          }
                          className="w-full min-w-[140px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          maxLength={3}
                          value={row.number}
                          onChange={(e) =>
                            onUpdateRoster(
                              roster.map((r, i) => (i === idx ? { ...r, number: e.target.value } : r))
                            )
                          }
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-black text-center"
                        />
                      </td>
                      <td className="p-2 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRosterIndex(idx);
                            setIsRosterModalOpen(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isPreviewed
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          Ver en 3D
                        </button>
                        {roster.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onUpdateRoster(roster.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pegado rápido desde Excel / CSV */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-200 block">
              Pegado Rápido desde Excel / WhatsApp (`NOMBRE, NÚMERO, TALLA, CANTIDAD`)
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                rows={2}
                value={csvQuickInput}
                onChange={(e) => setCsvQuickInput(e.target.value)}
                placeholder={'JORDAN, 23, XL, 1\nPIPPEN, 33, L, 1'}
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white"
              />
              <button
                type="button"
                onClick={handleImportCsvRoster}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shrink-0"
              >
                Importar Filas
              </button>
            </div>
          </div>
        </div>
      </LightDismissModal>

      {/* ==================== MODAL 2: MIS BOCETOS GUARDADOS ==================== */}
      <LightDismissModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        titleId="drafts-modal-title"
        subtitle="Almacenamiento Local Instantáneo"
        title={`Mis Bocetos Guardados (${savedDrafts.length})`}
        maxWidthClass="max-w-2xl"
      >
        {savedDrafts.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Aún no has guardado bocetos. Pulsa el botón «Guardar» en la barra inferior para conservar versiones de tus uniformes.
          </p>
        ) : (
          <div className="space-y-2.5">
            {savedDrafts.map((dr) => (
              <div
                key={dr.draftId}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex rounded-lg overflow-hidden border border-white/15 shrink-0">
                    {(dr.colors || []).map((hex, i) => (
                      <span key={i} style={{ background: hex || '#1e293b' }} className="w-3.5 h-8 block" />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">
                      {dr.productName} — Patrón «{dr.patternId}»
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{dr.savedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadDraft(dr)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black"
                  >
                    Cargar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(dr.draftId)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </LightDismissModal>

      {/* ==================== MODAL 3: REVISIÓN TÉCNICA DEL DISEÑO ==================== */}
      <LightDismissModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        titleId="review-modal-title"
        subtitle="Auditoría Automática Pre-Impresión Sublimación 300 DPI"
        title="Revisión Técnica del Diseño"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-3">
          {designReviewChecks.checks.map((chk, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                chk.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/35 text-rose-200'
              }`}
            >
              {chk.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-black">{chk.title}</div>
                <div className="text-[11px] opacity-85 mt-0.5">{chk.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </LightDismissModal>

      {/* ==================== MODAL 4: MENÚ INTERACTIVO DE DEPORTES Y PRENDAS (CABALLERO / DAMA) ==================== */}
      <LightDismissModal
        isOpen={isGarmentMenuOpen}
        onClose={() => setIsGarmentMenuOpen(false)}
        titleId="garment-menu-title"
        title={genderModule === 'men' ? 'Catálogo Caballero: Deportes & Liga MX' : 'Catálogo Dama: Patronaje Femenino'}
        subtitle={
          genderModule === 'men'
            ? 'Personaliza desde cero tus prendas o carga los 18 uniformes inspirados en la Liga MX'
            : 'Prendas con patronaje ergonómico adaptado a la morfología femenina'
        }
        maxWidthClass="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Segment switch inside modal: Caballero vs Dama */}
          <div className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl border border-slate-200 max-w-sm mx-auto">
            <button
              id="modal-tab-caballero"
              type="button"
              onClick={() => handleGenderSwitch('men')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                genderModule === 'men'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ♂ Segmento Caballero
            </button>
            <button
              id="modal-tab-dama"
              type="button"
              onClick={() => handleGenderSwitch('women')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                genderModule === 'women'
                  ? 'bg-fuchsia-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ♀ Segmento Dama
            </button>
          </div>

          {/* ==================== SECCIÓN CABALLERO ==================== */}
          {genderModule === 'men' && (
            <div className="space-y-5">
              {/* Sub-navegador Caballero: Personaliza a tu Gusto vs Inspirados en la Liga MX */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-men-tab-custom"
                    type="button"
                    onClick={() => setGarmentMenuMenSection('custom')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      garmentMenuMenSection === 'custom'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <span>Personaliza a tu Gusto</span>
                  </button>
                  <button
                    id="btn-men-tab-ligamx"
                    type="button"
                    onClick={() => setGarmentMenuMenSection('ligamx')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      garmentMenuMenSection === 'ligamx'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span>🇲🇽 Inspirados en la Liga MX</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/30 text-white">
                      18
                    </span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                  {garmentMenuMenSection === 'custom' ? 'Moldes CAD en blanco' : '18 Clubes Primera División'}
                </span>
              </div>

              {/* VISTA 1: PERSONALIZA A TU GUSTO (MOLDES CAD EN BLANCO) */}
              {garmentMenuMenSection === 'custom' && (
                <div className="space-y-5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-slate-900">Personalización Completa desde Cero:</strong> Selecciona una prenda para diseñar tus propios cortes, armonías de colores, escudos y patrocinadores en 3D.
                    </div>
                    <button
                      type="button"
                      onClick={() => setGarmentMenuMenSection('ligamx')}
                      className="text-xs font-black text-emerald-700 hover:text-emerald-800 underline shrink-0 cursor-pointer"
                    >
                      Ver Liga MX (18) →
                    </button>
                  </div>

                  {/* Fútbol */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Fútbol Matchday (2 Piezas)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menFootball.map((p) => {
                        const isCur = design.productModelId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSwitchProduct(p.id);
                              setIsGarmentMenuOpen(false);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isCur
                                ? 'bg-sky-50 border-2 border-sky-600 text-sky-950 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">{p.badge}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              isCur ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isCur ? 'Activo en 3D' : 'Cargar'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Baloncesto */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Baloncesto Arena (2 Piezas)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menBasketball.map((p) => {
                        const isCur = design.productModelId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSwitchProduct(p.id);
                              setIsGarmentMenuOpen(false);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isCur
                                ? 'bg-sky-50 border-2 border-sky-600 text-sky-950 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">{p.badge}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              isCur ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isCur ? 'Activo en 3D' : 'Cargar'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chaqueta */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Chaquetas Técnicas &amp; Paseo
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menJackets.map((p) => {
                        const isCur = design.productModelId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSwitchProduct(p.id);
                              setIsGarmentMenuOpen(false);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isCur
                                ? 'bg-sky-50 border-2 border-sky-600 text-sky-950 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">{p.badge}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              isCur ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isCur ? 'Activo en 3D' : 'Cargar'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Banner inferior para ir a Liga MX */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
                        <span>🇲🇽</span>
                        <span>Colección de Fútbol México Pro (18 Clubes)</span>
                      </h5>
                      <p className="text-[11px] text-slate-600">
                        Cortes y colores de la Primera División sin marcas comerciales para venta legal en Shopify.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGarmentMenuMenSection('ligamx')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs shrink-0 cursor-pointer transition-all"
                    >
                      Explorar 18 Kits →
                    </button>
                  </div>
                </div>
              )}

              {/* VISTA 2: COLECCIÓN INSPIRADA EN LA LIGA MX (18 CLUBES) */}
              {garmentMenuMenSection === 'ligamx' && (
                <div className="space-y-4">
                  {/* Banner explicativo legal */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇲🇽</span>
                        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                          18 Uniformes Inspirados en la Liga MX
                        </h4>
                        <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                          Shopify Legal
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Inspiraciones clásicas sin marcas de fabricantes (Nike/Adidas/Puma) ni patrocinadores registrados. Carga cualquier kit y personalízalo con tu propio nombre, dorsal y logotipo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGarmentMenuMenSection('custom')}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                    >
                      ← Personaliza a tu gusto
                    </button>
                  </div>

                  {/* Selector de Edición (Local vs Visitante) y Búsqueda */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                    {/* Switcher Local vs Visitante */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMexicoKitEditionFilter('local')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          mexicoKitEditionFilter === 'local'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span>🏠</span>
                        <span>Local (18)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMexicoKitEditionFilter('visitante')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          mexicoKitEditionFilter === 'visitante'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span>✈️</span>
                        <span>Visitante (18)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMexicoKitEditionFilter('all')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mexicoKitEditionFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Todos (36)
                      </button>
                    </div>

                    {/* Barra de Búsqueda */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mexicoKitSearch}
                        onChange={(e) => setMexicoKitSearch(e.target.value)}
                        placeholder="Buscar por club, estado o corte..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                      />
                      {mexicoKitSearch && (
                        <button
                          type="button"
                          onClick={() => setMexicoKitSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filtros de Región */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: 'Todas las Regiones' },
                        { id: 'cdmx', label: 'CDMX (3)' },
                        { id: 'jalisco', label: 'Jalisco (2)' },
                        { id: 'norte', label: 'Norte (5)' },
                        { id: 'centro_bajio', label: 'Centro / Bajío (8)' },
                      ].map((reg) => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setMexicoKitRegionFilter(reg.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                            mexicoKitRegionFilter === reg.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {reg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid de Uniformes con Miniatura Realista 2D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[58vh] overflow-y-auto pr-1">
                    {filteredMexicoKitsInMenu.map((kit) => (
                      <div
                        key={kit.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Miniatura Vectorial Realista de la Camiseta */}
                          <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors flex items-center justify-center shrink-0">
                            <JerseyThumbnailMiniature kit={kit} size={54} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {kit.location}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  kit.edition === 'local'
                                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                                    : 'text-sky-700 bg-sky-50 border border-sky-200/60'
                                }`}
                              >
                                {kit.edition === 'local' ? '🏠 Local' : '✈️ Visita'}
                              </span>
                            </div>

                            <h4
                              className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors mt-1 leading-snug line-clamp-1"
                              title={kit.name}
                            >
                              {kit.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                              {kit.description}
                            </p>
                            <div className="mt-1 text-[10px] font-mono text-slate-400">
                              Inspiración: <strong className="text-slate-700">{kit.clubAlias}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] font-mono text-slate-400">
                            Corte: <strong className="text-slate-600">{kit.patternId}</strong>
                          </div>
                          <button
                            id={`btn-menu-kit-${kit.id}`}
                            type="button"
                            onClick={() => {
                              handleApplyMexicoKit(kit);
                              setIsGarmentMenuOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102 flex items-center gap-1"
                          >
                            <span>Cargar en 3D</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredMexicoKitsInMenu.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No se encontraron uniformes con ese filtro. Prueba borrando el texto de búsqueda.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== SECCIÓN DAMA ==================== */}
          {genderModule === 'women' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 text-xs text-fuchsia-950 leading-relaxed">
                <strong>Patronaje Anatómico Dama:</strong> Moldes independientes diseñados especialmente para la silueta femenina, con sisa adaptada, cintura entallada y costuras ergonómicas.
              </div>

              {/* Baloncesto Dama */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Baloncesto Dama (Patronaje Anatómico Femenino)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {womenBasketball.map((p) => {
                    const isCur = design.productModelId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSwitchProduct(p.id);
                          setIsGarmentMenuOpen(false);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isCur
                            ? 'bg-fuchsia-50 border-2 border-fuchsia-600 text-fuchsia-950 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{p.badge}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          isCur ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isCur ? 'Activo en 3D' : 'Cargar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chaqueta Dama */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Chaquetas Técnicas Dama (Corte Entallado)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {womenJackets.map((p) => {
                    const isCur = design.productModelId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSwitchProduct(p.id);
                          setIsGarmentMenuOpen(false);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isCur
                            ? 'bg-fuchsia-50 border-2 border-fuchsia-600 text-fuchsia-950 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{p.badge}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          isCur ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isCur ? 'Activo en 3D' : 'Cargar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </LightDismissModal>

      {/* ==================== MODAL: COLECCIÓN PRESETS MÉXICO PRO (36 UNIFORMES) ==================== */}
      <LightDismissModal
        isOpen={isMexicoKitsModalOpen}
        onClose={() => setIsMexicoKitsModalOpen(false)}
        titleId="mexico-kits-modal-title"
        subtitle="Colección Comercial Libre de Copyright • 36 Uniformes (18 Locales + 18 Visitantes)"
        title="🇲🇽 Presets de Fútbol México Pro"
        maxWidthClass="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong>100% Comercializable para Shopify:</strong> Plantillas de la Temporada 2026/2027 inspiradas en los 18 clubes de Primera División (versiones Local y Visitante). Libres de marcas de fabricantes (Nike/Adidas/Puma) y sin patrocinios.
            </div>
            {/* Switcher Local vs Visitante en Modal */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 shrink-0">
              <button
                type="button"
                onClick={() => setMexicoKitEditionFilter('local')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  mexicoKitEditionFilter === 'local'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏠</span>
                <span>Local (18)</span>
              </button>
              <button
                type="button"
                onClick={() => setMexicoKitEditionFilter('visitante')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  mexicoKitEditionFilter === 'visitante'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✈️</span>
                <span>Visitante (18)</span>
              </button>
              <button
                type="button"
                onClick={() => setMexicoKitEditionFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mexicoKitEditionFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos (36)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredMexicoKitsInMenu.map((kit) => (
              <button
                key={kit.id}
                id={`btn-kit-${kit.id}`}
                type="button"
                onClick={() => handleApplyMexicoKit(kit)}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 shadow-xs cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Miniatura Vectorial Realista de la Camiseta */}
                  <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors flex items-center justify-center shrink-0">
                    <JerseyThumbnailMiniature kit={kit} size={54} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {kit.location}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          kit.edition === 'local'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : 'text-sky-700 bg-sky-50 border border-sky-200/60'
                        }`}
                      >
                        {kit.edition === 'local' ? '🏠 Local' : '✈️ Visita'}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-1 leading-snug line-clamp-1" title={kit.name}>
                      {kit.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                      {kit.description}
                    </p>
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      Inspiración: <strong className="text-slate-700">{kit.clubAlias}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400">
                    Corte: <strong className="text-slate-600">{kit.patternId}</strong>
                  </span>
                  <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                    <span>Cargar en 3D</span>
                    <span>→</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </LightDismissModal>

      {/* ==================== MODAL 6: PLANTILLA 2D DE CONFECCIÓN Y CORTE A ESCALA REAL 1:1 ==================== */}
      <ProductionMoldModal
        isOpen={isProductionMoldModalOpen}
        onClose={() => setIsProductionMoldModalOpen(false)}
        design={design}
        roster={roster}
        artworkRegistry={artworkRegistry}
      />
    </div>
  );
}
