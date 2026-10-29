import React, { useState } from 'react';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function KitLabShowcase({ onLaunch3DStudio, onQuickOrder }) {
  const [selectedGarment, setSelectedGarment] = useState('futbol');
  const [viewMode, setViewMode] = useState('front'); // 'front' | 'back'
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'crest' | 'sponsor' | 'colors'
  const [showGrid, setShowGrid] = useState(true);

  // Live kit state in 2D preview
  const [playerName, setPlayerName] = useState('VALVERDE');
  const [playerNumber, setPlayerNumber] = useState('10');
  const [numFont, setNumFont] = useState('teko'); // 'teko' | 'mono' | 'syne'
  const [sponsorText, setSponsorText] = useState('CYBER·TECH // 2025');
  const [crestPreset, setCrestPreset] = useState('apex');
  const [crestPos, setCrestPos] = useState('left');
  const [primaryColor, setPrimaryColor] = useState('#111318');
  const [accentColor, setAccentColor] = useState('#ccff00');
  const [numberColor, setNumberColor] = useState('#ccff00');
  const [quantity, setQuantity] = useState(15);

  const garmentPrices = {
    futbol: 65,
    basketball: 55,
    tracksuit: 75,
    polo: 45,
  };

  const garmentEngineIds = {
    futbol: 'futbol_jersey_pro_vneck',
    basketball: 'basketball_b6_hero',
    tracksuit: 'jacket_softshell_601m_men',
    polo: 'futbol_jersey_pro_vneck',
  };

  const unitBasePrice = garmentPrices[selectedGarment] || 65;
  const discountRate = quantity >= 25 ? 0.25 : quantity >= 15 ? 0.15 : quantity >= 10 ? 0.10 : 0;
  const discountedUnitPrice = unitBasePrice * (1 - discountRate);
  const totalPrice = discountedUnitPrice * quantity;

  const handleLaunch3D = () => {
    const engineId = garmentEngineIds[selectedGarment] || 'futbol_jersey_pro_vneck';
    onLaunch3DStudio(engineId, {
      playerName,
      playerNumber,
      sponsorText,
      primaryColor,
      accentColor,
    });
  };

  return (
    <section
      id="customizer-section"
      className="w-full bg-[#0b0e14] py-16 px-4 sm:px-8 lg:px-12 relative border-b border-[#1f2634]"
    >
      {/* Header of Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-spec-code text-xs text-[#ccff00] tracking-widest uppercase font-bold">
            <span className="w-2.5 h-2.5 bg-[#ccff00]"></span>
            <span>KIT LAB // ESTUDIO DE PERSONALIZACIÓN DEPORTIVA</span>
          </div>
          <h2 className="font-headline-lg text-3xl sm:text-4xl uppercase tracking-tight text-white font-black">
            CONFIGURADOR PRO <span className="text-[#ccff00] font-normal">// EQUIPACIÓN EN VIVO</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setPlayerName('VALVERDE');
              setPlayerNumber('10');
              setSponsorText('CYBER·TECH // 2025');
              setPrimaryColor('#111318');
              setAccentColor('#ccff00');
            }}
            className="font-spec-code text-xs text-[#a2abb8] hover:text-[#ccff00] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span> [RESTAURAR KIT]
          </button>
          <div className="px-4 py-1.5 bg-[#1f2634] border border-[#283142] font-spec-code text-xs text-[#ccff00] uppercase tracking-widest font-bold">
            PASO 01: ESCUDO &amp; DORSAL
          </div>
        </div>
      </div>

      {/* Selector of Base Garments */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setSelectedGarment('futbol')}
          className={`p-4 text-left transition-all relative border cursor-pointer ${
            selectedGarment === 'futbol'
              ? 'bg-[#181d28] border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
              : 'bg-[#121620] hover:bg-[#181d28] border-[#283142]'
          }`}
        >
          {selectedGarment === 'futbol' && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ccff00]" />
          )}
          <span className="font-spec-code text-[11px] text-[#ccff00] uppercase font-bold tracking-widest block">
            01 // COMPETICIÓN
          </span>
          <p className="font-headline-sm text-base sm:text-lg text-white uppercase mt-1 truncate font-bold">
            Kit Pro Fútbol Matchday
          </p>
          <span className="font-spec-code text-xs text-[#a2abb8] mt-1 block">
            CAMISETA + PANTALÓN // €65.00
          </span>
        </button>

        <button
          onClick={() => setSelectedGarment('basketball')}
          className={`p-4 text-left transition-all relative border cursor-pointer ${
            selectedGarment === 'basketball'
              ? 'bg-[#181d28] border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
              : 'bg-[#121620] hover:bg-[#181d28] border-[#283142]'
          }`}
        >
          {selectedGarment === 'basketball' && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ccff00]" />
          )}
          <span className="font-spec-code text-[11px] text-[#a2abb8] uppercase font-bold tracking-widest block">
            02 // COURT ARENA
          </span>
          <p className="font-headline-sm text-base sm:text-lg text-white uppercase mt-1 truncate font-bold">
            Basketball Pro Jersey &amp; Shorts
          </p>
          <span className="font-spec-code text-xs text-[#a2abb8] mt-1 block">
            MESH TRANSPIRABLE // €55.00
          </span>
        </button>

        <button
          onClick={() => setSelectedGarment('tracksuit')}
          className={`p-4 text-left transition-all relative border cursor-pointer ${
            selectedGarment === 'tracksuit'
              ? 'bg-[#181d28] border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
              : 'bg-[#121620] hover:bg-[#181d28] border-[#283142]'
          }`}
        >
          {selectedGarment === 'tracksuit' && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ccff00]" />
          )}
          <span className="font-spec-code text-[11px] text-[#a2abb8] uppercase font-bold tracking-widest block">
            03 // VIAJE &amp; BANQUILLO
          </span>
          <p className="font-headline-sm text-base sm:text-lg text-white uppercase mt-1 truncate font-bold">
            Chaqueta Técnica Softshell
          </p>
          <span className="font-spec-code text-xs text-[#a2abb8] mt-1 block">
            SOFTSHELL REPELENTE // €75.00
          </span>
        </button>

        <button
          onClick={() => setSelectedGarment('polo')}
          className={`p-4 text-left transition-all relative border cursor-pointer ${
            selectedGarment === 'polo'
              ? 'bg-[#181d28] border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
              : 'bg-[#121620] hover:bg-[#181d28] border-[#283142]'
          }`}
        >
          {selectedGarment === 'polo' && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ccff00]" />
          )}
          <span className="font-spec-code text-[11px] text-[#a2abb8] uppercase font-bold tracking-widest block">
            04 // CORTE FEMENINO
          </span>
          <p className="font-headline-sm text-base sm:text-lg text-white uppercase mt-1 truncate font-bold">
            Línea Pro Damas Matchday
          </p>
          <span className="font-spec-code text-xs text-[#a2abb8] mt-1 block">
            FIT ENTALLADO ERGONÓMICO // €65.00
          </span>
        </button>
      </div>

      {/* Main Workbench: Interactive Jersey Viewport & Dynamic Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Viewport Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#121620] relative border border-[#283142] shadow-2xl min-h-[580px] p-4 overflow-hidden">
          {/* Top HUD */}
          <div className="flex items-center justify-between w-full z-20">
            <div className="flex items-center gap-2 bg-[#080a0e]/90 border border-[#1f2634] px-3 py-1 font-spec-code text-xs">
              <span className="text-[#ccff00] font-bold">VISTA KIT:</span>
              <span className="text-white uppercase font-bold">
                {viewMode === 'front' ? 'FRONTAL [PECHO & PATROCINADOR]' : 'DORSAL [NOMBRE & NÚMERO]'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('front')}
                className={`px-4 py-1 font-spec-code text-xs uppercase font-extrabold transition-colors cursor-pointer ${
                  viewMode === 'front'
                    ? 'bg-[#ccff00] text-black shadow-sm'
                    : 'bg-[#181d28] text-[#a2abb8] hover:text-white border border-[#1f2634]'
                }`}
              >
                DELANTERA
              </button>
              <button
                onClick={() => setViewMode('back')}
                className={`px-4 py-1 font-spec-code text-xs uppercase font-extrabold transition-colors cursor-pointer ${
                  viewMode === 'back'
                    ? 'bg-[#ccff00] text-black shadow-sm'
                    : 'bg-[#181d28] text-[#a2abb8] hover:text-white border border-[#1f2634]'
                }`}
              >
                DORSAL (ESPALDA)
              </button>
              <div className="h-4 w-px bg-[#283142] mx-1" />
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 border border-[#1f2634] transition-colors cursor-pointer ${
                  showGrid ? 'bg-[#ccff00] text-black' : 'bg-[#181d28] text-[#a2abb8] hover:text-[#ccff00]'
                }`}
                title="Cuadrícula técnica"
              >
                <span className="material-symbols-outlined text-sm">grid_4x4</span>
              </button>
              <button
                onClick={handleLaunch3D}
                className="px-3 py-1 bg-[#ccff00] hover:bg-white text-black font-spec-code text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                title="Abrir en 3D CAD Completo"
              >
                <span className="material-symbols-outlined text-sm">view_in_ar</span>
                <span>VER 3D</span>
              </button>
            </div>
          </div>

          {/* Central Interactive Mockup Container */}
          <div className="relative flex-1 flex items-center justify-center py-6 select-none overflow-hidden">
            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                <div className="w-full h-px bg-[#ccff00]" />
                <div className="h-full w-px bg-[#ccff00] absolute" />
                <div className="w-72 h-72 border border-[#ccff00]/40 rounded-full absolute" />
                <span className="absolute top-4 left-4 font-spec-code text-[10px] text-[#ccff00]/80">
                  FIFA APPAREL SPEC #882
                </span>
                <span className="absolute bottom-4 right-4 font-spec-code text-[10px] text-[#ccff00]/80">
                  [AREA DE SUBLIMACIÓN ACTIVA 360°]
                </span>
              </div>
            )}

            {/* Base Jersey Graphic */}
            <div className="relative w-[340px] sm:w-[420px] aspect-square flex items-center justify-center">
              <img
                src={resolveAssetUrl('/assets/stitch/ghost_mannequin.png')}
                alt="Jersey Deportivo Apex"
                className="w-full h-full object-contain filter contrast-125 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
              />

              {/* Dynamic Decals Layer */}
              <div
                className="absolute w-56 sm:w-60 h-56 sm:h-60 bg-[#ccff00]/5 flex flex-col items-center justify-center border border-[#ccff00]/30 shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                style={{ top: '26%', left: '23%' }}
              >
                {/* Front View Decals */}
                {viewMode === 'front' ? (
                  <div className="flex flex-col items-center justify-center w-full px-2">
                    {/* Club Crest */}
                    <div
                      className={`w-14 h-14 flex items-center justify-center filter drop-shadow-md transition-all ${
                        crestPos === 'left'
                          ? '-translate-x-8'
                          : crestPos === 'right'
                          ? 'translate-x-8'
                          : ''
                      }`}
                      style={{ color: accentColor }}
                    >
                      {crestPreset === 'apex' && (
                        <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
                          <polygon
                            fill="#0b0e14"
                            points="50,4 92,20 92,54 50,96 8,54 8,20"
                            stroke="currentColor"
                            strokeWidth="5"
                          />
                          <polygon
                            fill="none"
                            points="50,14 82,27 82,50 50,84 18,50 18,27"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          />
                          <circle cx="50" cy="46" fill="currentColor" r="14" />
                          <path
                            d="M44 46 L48 50 L56 42"
                            fill="none"
                            stroke="#0b0e14"
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                        </svg>
                      )}
                      {crestPreset === 'lion' && (
                        <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="6" />
                          <polygon fill="currentColor" points="50,22 72,66 28,66" />
                        </svg>
                      )}
                      {crestPreset === 'falcon' && (
                        <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
                          <polygon fill="none" points="50,15 90,85 10,85" stroke="currentColor" strokeWidth="6" />
                          <line stroke="currentColor" strokeWidth="6" x1="25" x2="75" y1="60" y2="60" />
                        </svg>
                      )}
                      {crestPreset === 'crown' && (
                        <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
                          <path d="M15,75 L85,75 L85,60 L70,45 L50,60 L30,45 L15,60 Z" fill="currentColor" />
                          <circle cx="50" cy="25" fill="currentColor" r="8" />
                        </svg>
                      )}
                    </div>

                    {/* Chest Sponsor Wordmark */}
                    <div className="mt-3 px-3 py-1 bg-black/70 border border-[#ccff00]/40 backdrop-blur-sm rounded-sm">
                      <p className="font-spec-code text-xs sm:text-sm uppercase tracking-widest text-white font-extrabold truncate max-w-[200px]">
                        {sponsorText || 'SPONSOR'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Back View Decals */
                  <div className="flex flex-col items-center justify-center w-full">
                    <p className="font-spec-code text-base uppercase tracking-widest text-white font-black truncate max-w-[200px]">
                      {playerName || 'JUGADOR'}
                    </p>
                    <div
                      className="text-7xl font-black leading-none select-none tracking-tight drop-shadow-lg"
                      style={{
                        fontFamily:
                          numFont === 'teko'
                            ? "'Teko', sans-serif"
                            : numFont === 'mono'
                            ? "'JetBrains Mono', monospace"
                            : "'Syne', sans-serif",
                        color: numberColor,
                      }}
                    >
                      {playerNumber || '10'}
                    </div>
                    <span className="font-spec-code text-[9px] uppercase tracking-wider text-white bg-black/80 px-2 py-0.5 mt-1 border border-white/20">
                      APEX PRO FIT
                    </span>
                  </div>
                )}
              </div>

              {/* Color chips readout badge */}
              <div className="absolute bottom-2 left-2 z-30 flex items-center gap-2 bg-[#080a0e]/95 border border-[#283142] px-3 py-1 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="font-spec-code text-[10px] text-white font-bold">
                    BASE: {primaryColor}
                  </span>
                </div>
                <span className="text-[#283142]">|</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-spec-code text-[10px] text-[#ccff00] font-bold">
                    ACENTO: {accentColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Viewport Bar */}
          <div className="flex items-center justify-between z-20 pt-2 font-spec-code text-xs text-[#a2abb8] border-t border-[#283142]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-white">
                <span className="material-symbols-outlined text-sm text-[#ccff00]">drag_indicator</span>
                PREVISUALIZACIÓN VECTORIAL HD
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-[#ccff00]">SUBLIMACIÓN DIGITAL 300 DPI</span>
            </div>
            <button
              onClick={handleLaunch3D}
              className="text-[#ccff00] hover:text-white underline font-bold flex items-center gap-1"
            >
              <span>Abrir en motor 3D interactivo con 94 patrones</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Modular Tool Rack (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#181d28] p-4 border border-[#283142] shadow-2xl">
          <div className="flex flex-col gap-4">
            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#080a0e] p-1 border border-[#283142]">
              <button
                onClick={() => setActiveTab('player')}
                className={`py-1.5 font-spec-code text-[11px] uppercase font-bold text-center cursor-pointer transition-colors ${
                  activeTab === 'player'
                    ? 'bg-[#ccff00] text-black'
                    : 'text-[#a2abb8] hover:text-white'
                }`}
              >
                DORSAL
              </button>
              <button
                onClick={() => setActiveTab('crest')}
                className={`py-1.5 font-spec-code text-[11px] uppercase font-bold text-center cursor-pointer transition-colors ${
                  activeTab === 'crest'
                    ? 'bg-[#ccff00] text-black'
                    : 'text-[#a2abb8] hover:text-white'
                }`}
              >
                ESCUDO
              </button>
              <button
                onClick={() => setActiveTab('sponsor')}
                className={`py-1.5 font-spec-code text-[11px] uppercase font-bold text-center cursor-pointer transition-colors ${
                  activeTab === 'sponsor'
                    ? 'bg-[#ccff00] text-black'
                    : 'text-[#a2abb8] hover:text-white'
                }`}
              >
                SPONSOR
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`py-1.5 font-spec-code text-[11px] uppercase font-bold text-center cursor-pointer transition-colors ${
                  activeTab === 'colors'
                    ? 'bg-[#ccff00] text-black'
                    : 'text-[#a2abb8] hover:text-white'
                }`}
              >
                COLORES
              </button>
            </div>

            {/* TAB 1: DORSAL */}
            {activeTab === 'player' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8] flex justify-between">
                    <span>NOMBRE DE JUGADOR</span>
                    <span className="text-[#ccff00]">{playerName.length}/14</span>
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    className="w-full bg-[#080a0e] border border-[#283142] px-3 py-2 font-spec-code text-sm uppercase text-white focus:outline-none focus:border-[#ccff00] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                      NÚMERO DORSAL
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={playerNumber}
                      onChange={(e) => setPlayerNumber(e.target.value)}
                      className="w-full bg-[#080a0e] border border-[#283142] px-3 py-2 font-athletic-num text-3xl font-bold uppercase text-[#ccff00] focus:outline-none focus:border-[#ccff00] transition-colors text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                      TALLA BASE
                    </label>
                    <select className="w-full bg-[#080a0e] border border-[#283142] px-3 py-2.5 font-spec-code text-xs uppercase text-white focus:outline-none focus:border-[#ccff00] cursor-pointer">
                      <option>PRO S (36-38)</option>
                      <option>PRO M (40-42)</option>
                      <option>PRO L (44-46)</option>
                      <option>PRO XL (48-50)</option>
                      <option>PACK EQUIPO MIXTO</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                    TIPOGRAFÍA OFICIAL
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setNumFont('teko')}
                      className={`p-2 bg-[#080a0e] border text-center font-athletic-num text-2xl transition-colors cursor-pointer ${
                        numFont === 'teko'
                          ? 'border-[#ccff00] text-white'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      COLLEGIATE
                    </button>
                    <button
                      onClick={() => setNumFont('mono')}
                      className={`p-2 bg-[#080a0e] border text-center font-spec-code text-xs transition-colors cursor-pointer ${
                        numFont === 'mono'
                          ? 'border-[#ccff00] text-white'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      CYBER MONO
                    </button>
                    <button
                      onClick={() => setNumFont('syne')}
                      className={`p-2 bg-[#080a0e] border text-center font-headline-sm text-xs font-black transition-colors cursor-pointer ${
                        numFont === 'syne'
                          ? 'border-[#ccff00] text-white'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      CONDENSED
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ESCUDO */}
            {activeTab === 'crest' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                    PRESETS DE ESCUDO DISPONIBLES
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setCrestPreset('apex')}
                      className={`p-2 bg-[#080a0e] border flex items-center justify-center cursor-pointer transition-colors ${
                        crestPreset === 'apex'
                          ? 'border-[#ccff00] text-[#ccff00]'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 100 100">
                        <polygon
                          fill="none"
                          points="50,5 92,20 92,54 50,95 8,54 8,20"
                          stroke="currentColor"
                          strokeWidth="6"
                        />
                        <circle cx="50" cy="46" fill="currentColor" r="14" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCrestPreset('lion')}
                      className={`p-2 bg-[#080a0e] border flex items-center justify-center cursor-pointer transition-colors ${
                        crestPreset === 'lion'
                          ? 'border-[#ccff00] text-[#ccff00]'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="6" />
                        <polygon fill="currentColor" points="50,22 72,66 28,66" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCrestPreset('falcon')}
                      className={`p-2 bg-[#080a0e] border flex items-center justify-center cursor-pointer transition-colors ${
                        crestPreset === 'falcon'
                          ? 'border-[#ccff00] text-[#ccff00]'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 100 100">
                        <polygon fill="none" points="50,15 90,85 10,85" stroke="currentColor" strokeWidth="6" />
                        <line stroke="currentColor" strokeWidth="6" x1="25" x2="75" y1="60" y2="60" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCrestPreset('crown')}
                      className={`p-2 bg-[#080a0e] border flex items-center justify-center cursor-pointer transition-colors ${
                        crestPreset === 'crown'
                          ? 'border-[#ccff00] text-[#ccff00]'
                          : 'border-[#283142] text-[#a2abb8] hover:text-white'
                      }`}
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 100 100">
                        <path d="M15,75 L85,75 L85,60 L70,45 L50,60 L30,45 L15,60 Z" fill="currentColor" />
                        <circle cx="50" cy="25" fill="currentColor" r="8" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                    POSICIÓN DEL ESCUDO
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setCrestPos('left')}
                      className={`py-1.5 font-spec-code text-[11px] uppercase font-bold cursor-pointer transition-colors ${
                        crestPos === 'left'
                          ? 'bg-[#ccff00] text-black'
                          : 'bg-[#080a0e] text-[#a2abb8] hover:text-white border border-[#283142]'
                      }`}
                    >
                      Pecho Izq.
                    </button>
                    <button
                      onClick={() => setCrestPos('center')}
                      className={`py-1.5 font-spec-code text-[11px] uppercase font-bold cursor-pointer transition-colors ${
                        crestPos === 'center'
                          ? 'bg-[#ccff00] text-black'
                          : 'bg-[#080a0e] text-[#a2abb8] hover:text-white border border-[#283142]'
                      }`}
                    >
                      Centro
                    </button>
                    <button
                      onClick={() => setCrestPos('right')}
                      className={`py-1.5 font-spec-code text-[11px] uppercase font-bold cursor-pointer transition-colors ${
                        crestPos === 'right'
                          ? 'bg-[#ccff00] text-black'
                          : 'bg-[#080a0e] text-[#a2abb8] hover:text-white border border-[#283142]'
                      }`}
                    >
                      Pecho Der.
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPONSOR */}
            {activeTab === 'sponsor' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                    TEXTO O MARCA PATROCINADOR
                  </label>
                  <input
                    type="text"
                    maxLength={22}
                    value={sponsorText}
                    onChange={(e) => setSponsorText(e.target.value.toUpperCase())}
                    className="w-full bg-[#080a0e] border border-[#283142] px-3 py-2 font-spec-code text-sm uppercase text-white focus:outline-none focus:border-[#ccff00] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                    PRESETS PATROCINADOR RÁPIDO
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {['FLY AIRWAYS', 'CYBER·TECH // 2025', 'APEX ENERGY', 'KINETIC LABS'].map((sp) => (
                      <button
                        key={sp}
                        onClick={() => setSponsorText(sp)}
                        className="p-2 bg-[#080a0e] hover:bg-[#1f2634] border border-[#283142] text-left font-spec-code text-xs text-white cursor-pointer transition-colors"
                      >
                        ⚡ {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: COLORES */}
            {activeTab === 'colors' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                      COLOR PRINCIPAL (BASE)
                    </label>
                    <span className="font-spec-code text-[11px] text-[#ccff00] font-bold">
                      {primaryColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {['#111318', '#F8FAFC', '#0B1B3D', '#DC2626', '#064E3B', '#F59E0B'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setPrimaryColor(col)}
                        className={`w-full h-8 border transition-transform hover:scale-105 cursor-pointer ${
                          primaryColor === col ? 'border-2 border-[#ccff00]' : 'border-[#283142]'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="font-spec-code text-xs uppercase tracking-wider text-[#a2abb8]">
                      COLOR SECUNDARIO (ACENTO)
                    </label>
                    <span className="font-spec-code text-[11px] text-[#ccff00] font-bold">
                      {accentColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {['#CCFF00', '#FF5500', '#00E5FF', '#FFFFFF', '#FF0055', '#A855F7'].map((col) => (
                      <button
                        key={col}
                        onClick={() => {
                          setAccentColor(col);
                          setNumberColor(col);
                        }}
                        className={`w-full h-8 border transition-transform hover:scale-105 cursor-pointer ${
                          accentColor === col ? 'border-2 border-white' : 'border-[#283142]'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Volume Quantity Slider */}
            <div className="flex flex-col gap-2 bg-[#080a0e] p-3 border border-[#283142]">
              <div className="flex justify-between font-spec-code text-xs text-[#a2abb8]">
                <span>CANTIDAD ESTIMADA DE KITS</span>
                <span className="text-white font-bold">
                  {quantity} UNIDADES {discountRate > 0 ? `(-${discountRate * 100}% CLUB)` : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer h-1.5 bg-[#1f2634]"
              />
            </div>
          </div>

          {/* Pricing Breakdown & Submission */}
          <div className="flex flex-col gap-2 pt-4 mt-4 bg-[#080a0e] p-4 border border-[#283142] shadow-inner">
            <div className="flex justify-between font-spec-code text-xs text-[#a2abb8]">
              <span>PRECIO UNITARIO KIT:</span>
              <span className="text-white font-bold">€{discountedUnitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-spec-code text-xs text-[#a2abb8]">
              <span>VOLUMEN SELECCIONADO:</span>
              <span className="text-[#ccff00] font-bold">
                {quantity} kits {discountRate > 0 ? `(Descuento -${discountRate * 100}%)` : ''}
              </span>
            </div>
            <div className="h-px bg-[#283142] my-1" />
            <div className="flex justify-between items-baseline">
              <span className="font-spec-code text-xs uppercase tracking-widest text-[#a2abb8]">
                PRESUPUESTO TOTAL:
              </span>
              <span className="font-headline-md text-2xl font-black text-[#ccff00]">
                €{totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleLaunch3D}
                className="w-full py-3 bg-[#ccff00] hover:bg-white text-black font-spec-code text-xs uppercase tracking-widest font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">view_in_ar</span>
                <span>ABRIR EN MOTOR 3D CAD</span>
              </button>
              <button
                onClick={() => onQuickOrder && onQuickOrder({ garment: selectedGarment, quantity, totalPrice })}
                className="w-full py-2.5 bg-[#1f2634] hover:bg-[#283142] text-white font-spec-code text-xs uppercase tracking-wider font-bold border border-[#283142] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#ccff00]">
                  shopping_cart_checkout
                </span>
                <span>SOLICITAR PRESUPUESTO CLUB</span>
              </button>
            </div>
            <span className="font-spec-code text-[10px] text-[#a2abb8] text-center mt-1">
              ENVÍO A FEDERACIÓN &amp; CLUBES EN MÉXICO Y ESTADOS UNIDOS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
