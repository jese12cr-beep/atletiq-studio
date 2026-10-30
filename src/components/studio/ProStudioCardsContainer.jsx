import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Shirt,
  Hash,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  Save,
  CheckCircle2,
} from 'lucide-react';
import PatternCardsGrid from './cards/PatternCardsGrid';
import ColorZoneCards from './cards/ColorZoneCards';
import CollarCutCards from './cards/CollarCutCards';
import TypographyDorsalCard from './cards/TypographyDorsalCard';
import BadgeSponsorCards from './cards/BadgeSponsorCards';
import { ATLETIQ_PRO_PATTERNS } from '../../data/atletiqProPatterns';

const TABS = [
  { id: 'patterns', label: 'Diseños', icon: Sparkles },
  { id: 'colors', label: 'Colores', icon: Palette },
  { id: 'collar', label: 'Cuellos & Corte', icon: Shirt },
  { id: 'numbers', label: 'Dorsales & Textos', icon: Hash },
  { id: 'badges', label: 'Escudos & Patrocinios', icon: Shield },
];

export default function ProStudioCardsContainer({
  activePatternId = 'ATLETIQ_PRO_01',
  onSelectPattern,
  colorZoneMap = {},
  onChangeZoneColor,
  onResetZoneColors,
  activeCollar = 'round',
  onChangeCollar,
  activeCut = 'MEN_PRO_SLIM',
  onChangeCut,
  activeSize = 'L',
  onChangeSize,
  playerNumber = '10',
  onChangeNumber,
  playerName = 'ATLETIQ',
  onChangeName,
  frontNumberActive = false,
  onToggleFrontNumber,
  fontFamily = 'Impact, sans-serif',
  onChangeFont,
  numberFillColor = '#FFFFFF',
  onChangeNumberFill,
  numberOutlineColor = '#0F172A',
  onChangeNumberOutline,
  numberShadowColor = '#000000',
  onChangeNumberShadow,
  nameFillColor = '#FFFFFF',
  onChangeNameFill,
  nameOutlineColor = '#0F172A',
  onChangeNameOutline,
  nameCurveAngle = 0,
  onChangeNameCurve,
  activeCrest = null,
  onSelectCrest,
  onClearCrest,
  onUploadCustomCrest,
  sponsorText = '',
  onChangeSponsorText,
  sponsorImage = null,
  onUploadSponsor,
  onClearSponsor,
  onOpenMoldModal,
  onSaveToGallery,
}) {
  const [activeTab, setActiveTab] = useState('patterns');

  const currentPattern =
    ATLETIQ_PRO_PATTERNS.find((p) => p.id === activePatternId) ||
    ATLETIQ_PRO_PATTERNS[0];

  return (
    <div className="flex flex-col h-full bg-slate-950/95 text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* 1. Barra de Navegación de Pestañas con Píldoras Atléticas */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'bg-slate-850/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-emerald-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Cabecera Informativa Dinámica del Diseño */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Patrón Activo:</span>
          <span className="font-bold text-white">{currentPattern.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-emerald-400 border border-slate-700/60">
            {activeCut.replace('MEN_', '').replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-white border border-slate-700/60">
            Talla {activeSize}
          </span>
        </div>
      </div>

      {/* 3. Área de Contenido de los Recuadros de Personalización (Scrolleable) */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
        {activeTab === 'patterns' && (
          <PatternCardsGrid
            activePatternId={activePatternId}
            onSelectPattern={(p) => {
              onSelectPattern(p);
              // Automáticamente sugerir pasar a la pestaña de colores
            }}
            colorZoneMap={colorZoneMap}
          />
        )}

        {activeTab === 'colors' && (
          <ColorZoneCards
            zones={currentPattern.zones || []}
            colorZoneMap={colorZoneMap}
            onChangeZoneColor={onChangeZoneColor}
            onResetZoneColors={onResetZoneColors}
          />
        )}

        {activeTab === 'collar' && (
          <CollarCutCards
            activeCollar={activeCollar}
            onChangeCollar={onChangeCollar}
            activeCut={activeCut}
            onChangeCut={onChangeCut}
            activeSize={activeSize}
            onChangeSize={onChangeSize}
          />
        )}

        {activeTab === 'numbers' && (
          <TypographyDorsalCard
            playerNumber={playerNumber}
            onChangeNumber={onChangeNumber}
            playerName={playerName}
            onChangeName={onChangeName}
            frontNumberActive={frontNumberActive}
            onToggleFrontNumber={onToggleFrontNumber}
            fontFamily={fontFamily}
            onChangeFont={onChangeFont}
            numberFillColor={numberFillColor}
            onChangeNumberFill={onChangeNumberFill}
            numberOutlineColor={numberOutlineColor}
            onChangeNumberOutline={onChangeNumberOutline}
            numberShadowColor={numberShadowColor}
            onChangeNumberShadow={onChangeNumberShadow}
            nameFillColor={nameFillColor}
            onChangeNameFill={onChangeNameFill}
            nameOutlineColor={nameOutlineColor}
            onChangeNameOutline={onChangeNameOutline}
            nameCurveAngle={nameCurveAngle}
            onChangeNameCurve={onChangeNameCurve}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeSponsorCards
            activeCrest={activeCrest}
            onSelectCrest={onSelectCrest}
            onClearCrest={onClearCrest}
            onUploadCustomCrest={onUploadCustomCrest}
            sponsorText={sponsorText}
            onChangeSponsorText={onChangeSponsorText}
            sponsorImage={sponsorImage}
            onUploadSponsor={onUploadSponsor}
            onClearSponsor={onClearSponsor}
          />
        )}
      </div>

      {/* 4. Pie de Acciones Rápidas */}
      <div className="p-3.5 bg-slate-900/95 border-t border-slate-800/80 flex items-center gap-2">
        {onSaveToGallery && (
          <button
            type="button"
            onClick={onSaveToGallery}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar en Mi Galería</span>
          </button>
        )}

        {onOpenMoldModal && (
          <button
            type="button"
            onClick={onOpenMoldModal}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>Ver Plantilla 2D</span>
          </button>
        )}
      </div>
    </div>
  );
}
