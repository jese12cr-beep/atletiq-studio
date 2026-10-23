import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  Sparkles,
  Download,
  Users,
  ShoppingBag,
  Eye,
  Upload,
  Type,
  Palette,
  Layers,
  Shield,
  Check,
  Flame,
  Info
} from 'lucide-react';
import JerseyViewer from './JerseyViewer';
import OtherProductViewer from './OtherProductViewer';
import { COLOR_PALETTES, PATTERNS, FONTS, PRESET_BADGES, BULK_DISCOUNT_TIERS } from '../data/mockData';

export default function CustomizerStudio({
  selectedProduct,
  onProductChange,
  design,
  onDesignChange,
  onAddToCart,
  onOpenRosterModal
}) {
  const [view, setView] = useState('front'); // 'front' | 'back'
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'pattern' | 'text' | 'badge' | 'team'
  const [isRealisticLighting, setIsRealisticLighting] = useState(true);
  const fileInputRef = useRef(null);

  // Quick color setters
  const updateDesign = (key, value) => {
    onDesignChange({
      ...design,
      [key]: value
    });
  };

  // Randomize styling
  const handleRandomize = () => {
    const randomBase = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)].hex;
    const randomSleeve = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)].hex;
    const randomCollar = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)].hex;
    const randomDetail = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)].hex;
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)].id;
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)].fontClass;

    onDesignChange({
      ...design,
      baseColor: randomBase,
      sleeveColor: randomSleeve,
      collarColor: randomCollar,
      detailColor: randomDetail,
      pattern: randomPattern,
      fontStyle: randomFont
    });
  };

  // Handle user uploaded logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateDesign('badgeImage', event.target?.result);
        updateDesign('badgeSvg', null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Determine current unit price with potential tier discount
  const basePrice = selectedProduct?.basePrice || 32.99;
  const currentQuantity = design.teamRoster?.length || 1;
  const currentTier = BULK_DISCOUNT_TIERS.find(t => currentQuantity >= t.min && currentQuantity <= t.max) || BULK_DISCOUNT_TIERS[0];
  const unitPriceWithDiscount = (basePrice * (1 - currentTier.discountPct / 100)).toFixed(2);
  const totalPrice = (unitPriceWithDiscount * currentQuantity).toFixed(2);

  const isJerseyType = selectedProduct.type === 'jersey' || selectedProduct.type === 'basket';

  return (
    <section id="customizer-studio" className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header of Studio */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            Estudio Interactivo en Vivo 2.0
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personaliza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{selectedProduct.name}</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Modifica telas, franjas, escudos, dorsales y mira los cambios reflejados al instante.
          </p>
        </div>

        {/* Action Controls for Canvas */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRealisticLighting(!isRealisticLighting)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isRealisticLighting
                ? 'bg-slate-800 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Activar textura de tela y pliegues sombreados realistas"
          >
            <Eye className="w-3.5 h-3.5" />
            {isRealisticLighting ? 'Modo Realista: ON' : 'Modo Plano: 2D'}
          </button>

          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5 hover:border-amber-400"
            title="Generar combinación de colores profesional aleatoria"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Estilo Aleatorio
          </button>

          <button
            onClick={() => setView(view === 'front' ? 'back' : 'front')}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Girar Prenda: {view === 'front' ? 'Ver Dorsal / Espalda' : 'Ver Frente'}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT / CENTER: INTERACTIVE PREVIEW CANVAS (7 Cols) ================= */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col items-center justify-between min-h-[560px]">
          {/* Subtle sport court lines background watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Top Canvas Bar */}
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Vista: {view === 'front' ? 'Frontal (Pecho)' : 'Trasera (Dorsal)'}
            </span>

            {/* Quick View toggle pills */}
            <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex gap-1">
              <button
                onClick={() => setView('front')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  view === 'front'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Frente
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  view === 'back'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dorsal
              </button>
            </div>
          </div>

          {/* Product Canvas */}
          <div className="w-full flex-1 flex items-center justify-center my-4 relative">
            {isJerseyType ? (
              <JerseyViewer
                design={design}
                view={view}
                isRealisticLighting={isRealisticLighting}
                className="w-full max-w-[420px]"
              />
            ) : (
              <OtherProductViewer
                productType={selectedProduct.type}
                design={design}
                view={view}
              />
            )}
          </div>

          {/* Bottom Canvas Controls & Summary Badge */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 z-10 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full border border-slate-900 shadow" style={{ backgroundColor: design.baseColor }} title="Color Base" />
                <span className="w-4 h-4 rounded-full border border-slate-900 shadow" style={{ backgroundColor: design.sleeveColor }} title="Color Mangas" />
                <span className="w-4 h-4 rounded-full border border-slate-900 shadow" style={{ backgroundColor: design.detailColor }} title="Color Detalles" />
              </div>
              <span className="text-slate-400 font-mono">
                Patrón: <strong className="text-white">{PATTERNS.find(p => p.id === design.pattern)?.name || 'Liso'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert("¡Maqueta guardada! El archivo SVG / PNG se ha generado con resolución HD listo para confección.");
                }}
                className="text-slate-300 hover:text-amber-400 flex items-center gap-1 font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Maqueta
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STUDIO CONTROLS & CONFIGURATOR (5 Cols) ================= */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          {/* Navigation Tabs for Customizer */}
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab('colors')}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'colors'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              Colores
            </button>

            <button
              onClick={() => setActiveTab('pattern')}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'pattern'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Patrones
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              Dorsal / Texto
            </button>

            <button
              onClick={() => setActiveTab('badge')}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'badge'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Escudo / Logo
            </button>
          </div>

          {/* TAB 1: COLORES */}
          {activeTab === 'colors' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Color Principal / Cuerpo */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Color Principal (Cuerpo de la Prenda)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => updateDesign('baseColor', c.hex)}
                      className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center relative ${
                        design.baseColor === c.hex
                          ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {design.baseColor === c.hex && (
                        <Check className="w-4 h-4" style={{ color: c.text }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color de Mangas */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  2. Color de Mangas y Hombros
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={`sleeve-${c.hex}`}
                      onClick={() => updateDesign('sleeveColor', c.hex)}
                      className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                        design.sleeveColor === c.hex
                          ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {design.sleeveColor === c.hex && (
                        <Check className="w-4 h-4" style={{ color: c.text }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color de Cuello y Ribetes */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  3. Cuello y Acentos / Ribetes
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={`collar-${c.hex}`}
                      onClick={() => {
                        updateDesign('collarColor', c.hex);
                        updateDesign('detailColor', c.hex);
                      }}
                      className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                        design.collarColor === c.hex
                          ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {design.collarColor === c.hex && (
                        <Check className="w-4 h-4" style={{ color: c.text }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Tipo de Cuello (V-Neck vs Redondo) */}
              {isJerseyType && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Estilo de Cuello
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateDesign('collarType', 'v-neck')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        design.collarType === 'v-neck'
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Cuello en "V" Atlético
                    </button>
                    <button
                      onClick={() => updateDesign('collarType', 'round')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        design.collarType === 'round'
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Cuello Redondo Clásico
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PATRONES Y TEXTURAS */}
          {activeTab === 'pattern' && (
            <div className="space-y-4 animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Selecciona la Textura Deportiva
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updateDesign('pattern', p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      design.pattern === p.id
                        ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      {design.pattern === p.id && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-1">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DORSAL Y TEXTO */}
          {activeTab === 'text' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Tip: Gira la prenda al <strong>Dorsal</strong> para visualizar el nombre y número en tiempo real.</span>
              </div>

              {/* Nombre de Jugador */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Nombre en Espalda
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={design.playerName}
                  onChange={(e) => updateDesign('playerName', e.target.value.toUpperCase())}
                  placeholder="EJ. RODRÍGUEZ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Número Dorsal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Número Dorsal
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={design.playerNumber}
                    onChange={(e) => updateDesign('playerNumber', e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-center font-bold text-lg focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Color Números
                  </label>
                  <div className="flex gap-1.5 h-11 items-center">
                    {['#ffffff', '#0f172a', '#facc15', '#dc2626'].map((hex) => (
                      <button
                        key={`num-color-${hex}`}
                        onClick={() => updateDesign('textColor', hex)}
                        className={`w-7 h-7 rounded-lg border-2 ${
                          design.textColor === hex ? 'border-amber-400 scale-110' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tipografía Deportiva */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Tipografía Oficial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateDesign('fontStyle', f.fontClass)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        design.fontStyle === f.fontClass
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-base block ${f.fontClass}`}>
                        {f.name} 10
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patrocinador Frontal */}
              {isJerseyType && (
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Patrocinador / Sponsor Pecho
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={design.sponsorText}
                    onChange={(e) => updateDesign('sponsorText', e.target.value.toUpperCase())}
                    placeholder="FLY EMIRATES / AUDI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESCUDO Y LOGO */}
          {activeTab === 'badge' && (
            <div className="space-y-4 animate-fadeIn">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Subir Escudo del Club o Logotipo Propio
              </label>

              {/* Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-400/20 text-slate-300 group-hover:text-amber-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Haz clic para cargar tu escudo (PNG transparente o SVG)
                </p>
                <p className="text-xs text-slate-400">
                  Recomendado: 500x500px sin fondo. Se adapta al pecho automáticamente.
                </p>
              </div>

              {/* Preset Badges */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  O elige un Escudo Predefinido
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        updateDesign('badgeSvg', b.svg);
                        updateDesign('badgeImage', null);
                      }}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 transition-all flex flex-col items-center gap-2 group"
                      title={b.name}
                    >
                      <div
                        className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform"
                        dangerouslySetInnerHTML={{ __html: b.svg }}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold truncate w-full text-center">
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Summary & Purchase Card */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            {/* Volume Tier Pill */}
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">
                  {currentQuantity > 1 ? `Equipo: ${currentQuantity} camisetas` : 'Pedido Individual (1 unidad)'}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {currentTier.discountPct > 0 ? `-${currentTier.discountPct}% de Descuento` : 'Precio Estándar'}
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Estimado</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">${totalPrice}</span>
                  <span className="text-xs text-slate-400">(${unitPriceWithDiscount}/ud)</span>
                </div>
              </div>

              {/* Roster Modal Trigger */}
              <button
                onClick={onOpenRosterModal}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                Añadir Nombres del Equipo ({currentQuantity})
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(design, selectedProduct, unitPriceWithDiscount, totalPrice)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide uppercase shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Añadir Pedido al Carrito
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              ✓ Compatible con Shopify Line Item Properties. Incluye mockup de producción en alta resolución.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
