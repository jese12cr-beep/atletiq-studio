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
} from '../../engine/core/designStore';
import { processUploadedArtwork, calculateEffectiveDpi } from '../../engine/core/dpiValidator';
import {
  getDroppablePanelsForProduct,
  getPartSpec,
  getMirrorSymmetryTarget,
  evaluateDecalPlacement,
  isShortsProduct,
  snapRotationAngle,
} from '../../engine/core/boundingBoxMath';

const GarmentCanvas3D = lazy(() => import('../../engine/viewer3d/GarmentCanvas3D'));

const OWAYO_TABS = [
  { id: 'design', label: 'Diseño', icon: Sparkles },
  { id: 'colors', label: 'Colores', icon: Palette },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'logo', label: 'Logo', icon: Shield },
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
      className={`p-0 rounded-3xl bg-slate-900 text-slate-100 border border-slate-700/80 ${maxWidthClass} w-full shadow-2xl m-auto`}
    >
      <div className="p-5 sm:p-6 flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            {subtitle && (
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                {subtitle}
              </span>
            )}
            <h2 id={titleId} className="text-lg sm:text-xl font-black text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar ventana"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
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
    const findMeta = (hex) =>
      PANTONE_CM5_PALETTE.find((p) => p.hex.toLowerCase() === hex.toLowerCase()) || {
        hex,
        pantone: 'PMS Custom',
        code: hex,
      };
    const p = findMeta(harmony.primary);
    const s = findMeta(harmony.secondary);
    const a = findMeta(harmony.accents);
    const q = findMeta(harmony.quaternary);

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

  const menBasketball = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Baloncesto');
  const menFootball = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Fútbol');
  const menJackets = ENGINE_PRODUCTS.filter((p) => p.gender === 'men' && p.sport === 'Chaquetas');

  const womenBasketball = ENGINE_PRODUCTS.filter((p) => p.gender === 'women' && p.sport === 'Baloncesto');
  const womenJackets = ENGINE_PRODUCTS.filter((p) => p.gender === 'women' && p.sport === 'Chaquetas');
  const accessoryProducts = ENGINE_PRODUCTS.filter((p) => p.renderMode === 'FAUX_3D_LAYERED_WEBP');

  return (
    <div className="h-dvh flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* 1. CABECERA MULTI-PRENDA (MÓDULOS CABALLERO & DAMA: BALONCESTO, FÚTBOL, CHAQUETAS SOFTSHELL) */}
      <header className="shrink-0 px-3 sm:px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToStorefront}
            title="Volver a la vitrina comercial"
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vitrina</span>
          </button>

          {/* Selector de Módulo: ♂ Caballero vs ♀ Dama */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleGenderSwitch('men')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                genderModule === 'men'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>♂ Caballero</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderSwitch('women')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                genderModule === 'women'
                  ? 'bg-fuchsia-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>♀ Dama</span>
            </button>
          </div>

          {/* Módulo Caballero */}
          {genderModule === 'men' && (
            <>
              {/* Kit Baloncesto Caballero */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                <span className="px-1.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                  Basket
                </span>
                {menBasketball.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onSwitchProduct(prod.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      design.productModelId === prod.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {prod.id.includes('shorts') ? 'Short BP6' : 'Camisa B6'}
                  </button>
                ))}
              </div>

              {/* Kit Fútbol Caballero */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                <span className="px-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Fútbol
                </span>
                {menFootball.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onSwitchProduct(prod.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      design.productModelId === prod.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {prod.id.includes('shorts') ? 'Short FP3' : 'Camisa F3'}
                  </button>
                ))}
              </div>

              {/* Chaqueta Softshell Caballero */}
              {menJackets.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                  <span className="px-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400">
                    Chaqueta
                  </span>
                  {menJackets.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => onSwitchProduct(prod.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        design.productModelId === prod.id
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      J5 Softshell
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Módulo Dama */}
          {genderModule === 'women' && (
            <>
              {/* Kit Baloncesto Dama */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                <span className="px-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-400">
                  Basket Dama
                </span>
                {womenBasketball.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onSwitchProduct(prod.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      design.productModelId === prod.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {prod.id.includes('shorts') ? 'Short BP7W' : 'Camisa B7W Epic'}
                  </button>
                ))}
              </div>

              {/* Chaqueta Softshell Dama */}
              {womenJackets.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                  <span className="px-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400">
                    Chaqueta Dama
                  </span>
                  {womenJackets.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => onSwitchProduct(prod.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        design.productModelId === prod.id
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      J5W Dama
                    </button>
                  ))}
                </div>
              )}
            </>
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
              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-[11px] font-bold text-sky-300 flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Igualar colores en {pairedProduct.shortName}</span>
              <span className="xl:hidden">Sincronizar Kit</span>
            </button>
          )}
        </div>

        {/* Conmutador Central 3D Real vs Molde 2D Anatómico + Carrito */}
        <div className="flex items-center gap-2">
          {!isFaux3DAccessory && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewportMode('3d')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                  viewportMode === '3d'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                Visor 3D
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('2d')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                  viewportMode === '2d'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                Molde 2D Real
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="relative px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>{cartCount}</span>
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
        {/* ESCENARIO 3D / 2D ANATÓMICO */}
        <main className="flex-1 min-h-[340px] relative bg-[radial-gradient(circle_at_50%_38%,#1e293b_0%,#020617_78%)] overflow-hidden flex flex-col">
          {isFaux3DAccessory ? (
            <LayerStack25DViewer
              design={design}
              product={currentProduct}
              artworkRegistry={artworkRegistry}
            />
          ) : viewportMode === '3d' ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-sm font-mono text-slate-400">
                  Inicializando motor 3D Owayo (.mirl + .fish)...
                </div>
              }
            >
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
            </Suspense>
          ) : (
            <Interactive2DLab
              design={design}
              panel={panel2D}
              onChangePanel={(nextP) => {
                setPanel2D(nextP);
                if (PANEL_TO_CAMERA[nextP]) setCameraPreset(PANEL_TO_CAMERA[nextP]);
              }}
              activePlayer={activePlayer}
              artworkRegistry={artworkRegistry}
              selectedDecalId={selectedDecalId}
              selectedSlotKey={selectedSlotKey}
              onSelectDecal={(id) => handleSelectDecalFromStage(id, panel2D)}
              onSelectSlot={(slotKey) => handleSelectSlotFromStage(slotKey, panel2D)}
              onUpdateDecal={updateDecal}
              onUpdateSlot={updateVariableSlot}
              onDeleteDecal={deleteDecal}
              onMirrorDecal={mirrorDecalToSymmetricPiece}
            />
          )}

          {/* Selector rápido inferior derecho de jugador de muestra + Auto-giro */}
          <div className="pointer-events-auto absolute bottom-3 right-3 hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[11px] backdrop-blur-sm">
            <span className="text-slate-400">Muestra:</span>
            <select
              value={activeRosterIndex}
              onChange={(e) => setActiveRosterIndex(Number(e.target.value))}
              aria-label="Seleccionar jugador de muestra en visor"
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-amber-300 font-bold"
            >
              {roster.map((r, idx) => (
                <option key={r.id || idx} value={idx}>
                  #{r.number} {r.name} ({r.size})
                </option>
              ))}
            </select>

            {viewportMode === '3d' && !isFaux3DAccessory && (
              <label className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-slate-300 cursor-pointer">
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

        {/* PANEL LATERAL DERECHO IDÉNTICO A OWAYO (`Diseño | Colores | Texto | Logo`) */}
        <aside className="w-full lg:w-[430px] xl:w-[465px] shrink-0 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col min-h-0 max-h-[52vh] lg:max-h-none">
          {/* Pestañas Principales con Anchor Positioning (`ul.owayo-tabs`) */}
          <nav aria-label="Secciones del configurador" className="shrink-0 bg-slate-950 border-b border-slate-800">
            <ul role="tablist" className="owayo-tabs grid grid-cols-4">
              {OWAYO_TABS.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <li key={t.id} role="presentation" className={isActive ? 'active' : ''}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveTab(t.id);
                      }}
                      className={`w-full py-3 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-black transition-colors ${
                        isActive ? 'text-amber-400 bg-slate-900/70' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Contenido desplazable de la pestaña activa */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ==================== PESTAÑA 1: DISEÑO ==================== */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{currentProduct.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {availableFishDesigns.length} plantillas multicapa reales `.fish` sin marcas de agua
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-amber-300">
                    {currentProduct.owayoCutCode}
                  </span>
                </div>

                {/* Cuadrícula visual de plantillas `.fish` */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableFishDesigns.map((dMeta) => {
                    const isSelected = design.patternId === dMeta.id;
                    return (
                      <button
                        key={dMeta.id}
                        type="button"
                        onClick={() => onCommitDesign({ ...design, patternId: dMeta.id }, true)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-slate-800/95 border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-white truncate">{dMeta.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            {dMeta.zonesCount}Z
                          </span>
                        </div>
                        {/* Vista previa cromática viva de las zonas activas del diseño */}
                        <div className="h-3.5 w-full rounded-full overflow-hidden flex border border-slate-700/70">
                          <span
                            style={{ backgroundColor: design.colorZones.primary?.hex }}
                            className="flex-1 h-full"
                          />
                          {dMeta.zonesCount >= 2 && (
                            <span
                              style={{ backgroundColor: design.colorZones.secondary?.hex }}
                              className="flex-1 h-full"
                            />
                          )}
                          {dMeta.zonesCount >= 3 && (
                            <span
                              style={{ backgroundColor: design.colorZones.accents?.hex }}
                              className="w-4 h-full"
                            />
                          )}
                          {dMeta.zonesCount >= 4 && (
                            <span
                              style={{ backgroundColor: design.colorZones.quaternary?.hex }}
                              className="w-3 h-full"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{dMeta.subtitle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Textura Geométrica Opcional sobre Zona A */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Trama Sublimada en Zona A</span>
                    <span className="text-[10px] font-mono text-amber-300">
                      {Math.round((design.surfacePatternOpacity ?? 0.16) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ZONE_SURFACE_PATTERNS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => onCommitDesign({ ...design, surfacePatternId: pat.id }, true)}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border truncate ${
                          (design.surfacePatternId || 'none') === pat.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
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
                      className="studio-range"
                    />
                  )}
                </div>

                {/* Tejido Técnico Real (Bump Maps extraídos) */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">Tejido Técnico (Micro-Relieve 3D)</span>
                  <div className="space-y-1.5">
                    {FABRIC_WEAVES.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onCommitDesign({ ...design, fabricWeaveId: w.id }, true)}
                        className={`w-full p-2 rounded-xl border text-left flex items-center justify-between ${
                          design.fabricWeaveId === w.id
                            ? 'bg-slate-800 border-amber-400 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{w.name}</div>
                          <div className="text-[10px] text-slate-400">{w.subtitle}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300">
                          {w.gsm}g
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accesorios adicionales 2.5D */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Otros Artículos (Capas 2.5D)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {accessoryProducts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => onSwitchProduct(acc.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          design.productModelId === acc.id
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {acc.shortName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PESTAÑA 2: COLORES (167 CM5 + PANTONE) ==================== */}
            {activeTab === 'colors' && (
              <div className="space-y-3.5">
                {/* Selector de Zona Activa */}
                <div className="grid grid-cols-2 gap-1.5">
                  {colorZonesMeta.map((z) => {
                    const zVal = design.colorZones[z.id] || { hex: '#1d4ed8', pantone: 'Custom' };
                    const isSelected = activeColorZone === z.id;
                    return (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setActiveColorZone(z.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 shadow'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span
                          style={{ '--swatch-bg': zVal.hex }}
                          className="pantone-dynamic-chip w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black border border-white/20"
                        >
                          {z.short}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{z.label}</div>
                          <div className="text-[9px] font-mono text-slate-400 truncate">
                            {zVal.pantone || zVal.hex}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Armonías Deportivas 1-Clic + Invertir A/B */}
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Combinaciones Rápidas Pro</span>
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
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Invertir A ↔ B
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_HARMONY_SUGGESTIONS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => applyColorHarmony(h)}
                        className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-left"
                      >
                        <span className="flex shrink-0 rounded overflow-hidden border border-white/15">
                          <i style={{ background: h.primary }} className="w-2.5 h-4 block" />
                          <i style={{ background: h.secondary }} className="w-2.5 h-4 block" />
                          <i style={{ background: h.accents }} className="w-2.5 h-4 block" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-200 truncate">{h.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buscador y Filtros CM5 / Pantone */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      placeholder="Buscar Pantone, CM5 o HEX..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <input
                    type="color"
                    value={design.colorZones[activeColorZone]?.hex || '#1d4ed8'}
                    onChange={(e) =>
                      updateColorZone(activeColorZone, {
                        hex: e.target.value,
                        pantone: 'RGB Libre',
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    title="Selector RGB libre"
                    className="w-9 h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                  />
                </div>

                <div className="flex gap-1">
                  {[
                    { id: 'all', label: 'Todos (167)' },
                    { id: 'cm5', label: 'CM5 Sublimación' },
                    { id: 'special', label: 'Neón & Metálicos' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPaletteFilterMode(f.id)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border ${
                        paletteFilterMode === f.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Muestrario Oficial de 167 Colores */}
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 max-h-[300px] overflow-y-auto p-1">
                  {filteredPalette.map((sw) => {
                    const isCurrent =
                      design.colorZones[activeColorZone]?.hex?.toLowerCase() === sw.hex.toLowerCase();
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => updateColorZone(activeColorZone, sw)}
                        title={`${sw.name} (${sw.pantone}) • ${sw.hex}`}
                        style={{ '--swatch-bg': sw.hex }}
                        className={`pantone-dynamic-chip aspect-square rounded-xl flex flex-col items-center justify-center text-[8px] font-mono font-bold border transition-transform hover:scale-105 ${
                          isCurrent
                            ? 'ring-2 ring-amber-400 border-white scale-105'
                            : 'border-white/15'
                        }`}
                      >
                        {isCurrent ? <Check className="w-3.5 h-3.5" /> : sw.code}
                      </button>
                    );
                  })}
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
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleAddStaticText}
                      className="w-full py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir nuevo texto / lema / patrocinador
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
        </aside>
      </div>

      {/* 3. BARRA INFERIOR DE ACCIONES OWAYO (`Guardar | Mis bocetos | Ejemplares | Revisión del diseño | Añadir a la cesta`) */}
      <footer className="shrink-0 px-3 sm:px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDraftsModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Mis bocetos ({savedDrafts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-400/40 text-xs font-black text-amber-300 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ejemplares / Tallas ({totalUnits})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <ClipboardCheck
              className={`w-3.5 h-3.5 ${
                designReviewChecks.hasWarnings ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
            <span className="hidden sm:inline">Revisión del diseño</span>
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">
              {totalUnits} uds • ${unitPrice.toFixed(2)} c/u ({currentTier.label})
            </span>
            <span className="text-base font-black text-white">${totalPrice.toFixed(2)} USD</span>
          </div>

          <button
            type="button"
            onClick={onOpenProductionModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Añadir a la cesta</span>
          </button>
        </div>
      </footer>

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
    </div>
  );
}
