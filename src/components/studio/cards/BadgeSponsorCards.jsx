import React, { useRef } from 'react';
import { Shield, Upload, Trash2, Check, Award, Building2 } from 'lucide-react';
import { LIGA_MX_PRESETS } from '../../../data/sportPresetsRegistry';

export default function BadgeSponsorCards({
  activeCrest = null,
  onSelectCrest,
  onClearCrest,
  sponsorText = '',
  onChangeSponsorText,
  sponsorImage = null,
  onUploadSponsor,
  onClearSponsor,
  onUploadCustomCrest,
}) {
  const fileInputRef = useRef(null);
  const sponsorFileInputRef = useRef(null);

  const handleCrestUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUploadCustomCrest?.(url, file.name);
  };

  const handleSponsorUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUploadSponsor?.(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Recuadro de Escudo del Equipo / Club */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Escudo del Club (Pecho Izquierdo)
              </div>
              <p className="text-[11px] text-slate-400">
                Selecciona tu club de Liga MX o sube tu escudo personalizado
              </p>
            </div>
          </div>

          {activeCrest && (
            <button
              type="button"
              onClick={onClearCrest}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Quitar escudo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botón para subir escudo propio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Subir Escudo Personalizado (PNG / SVG)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/svg+xml, image/jpeg"
            onChange={handleCrestUpload}
            className="hidden"
          />
        </div>

        {/* Muestrario de Escudos de Liga MX */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Clubes de Liga MX</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {LIGA_MX_PRESETS.map((club) => {
              const isSelected = activeCrest === club.url;
              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => onSelectCrest(club.url, club.name)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-800 shadow-md ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img
                      src={club.url}
                      alt={club.name}
                      className="max-h-8 max-w-8 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 truncate w-full">
                    {club.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Recuadro de Patrocinador Principal */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Patrocinador Frontal (Pecho Centro)
              </div>
              <p className="text-[11px] text-slate-400">
                Logotipo o tipografía de sponsor principal
              </p>
            </div>
          </div>

          {(sponsorImage || sponsorText) && (
            <button
              type="button"
              onClick={onClearSponsor}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Quitar patrocinador"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input de texto para Patrocinador */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Texto del Patrocinador
          </label>
          <input
            type="text"
            value={sponsorText}
            onChange={(e) => onChangeSponsorText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold uppercase text-sm tracking-wider focus:border-emerald-500 focus:outline-none"
            placeholder="FLY EMIRATES / CORONA / BIMBO"
          />
        </div>

        {/* O Subir Logotipo en Imagen */}
        <div>
          <button
            type="button"
            onClick={() => sponsorFileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>O Cargar Logotipo Gráfico del Patrocinador</span>
          </button>
          <input
            ref={sponsorFileInputRef}
            type="file"
            accept="image/png, image/svg+xml, image/jpeg"
            onChange={handleSponsorUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
