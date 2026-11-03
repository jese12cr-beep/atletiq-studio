import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Check, 
  Copy, 
  Smartphone, 
  Monitor,
  Flame,
  Award
} from 'lucide-react';

const FORMATS = [
  { id: 'story', label: 'Story / Reel (9:16)', width: 1080, height: 1920, aspectClass: 'aspect-[9/16]' },
  { id: 'post', label: 'Post Cuadrado / IG (4:5)', width: 1080, height: 1350, aspectClass: 'aspect-[4/5]' },
  { id: 'banner', label: 'Banner / Landscape (16:9)', width: 1920, height: 1080, aspectClass: 'aspect-[16/9]' },
];

export default function SocialMediaMockupModal({
  isOpen,
  onClose,
  design,
  product,
  activePlayer,
  canvasSnapshotRef,
}) {
  const [selectedFormat, setSelectedFormat] = useState('post');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState('');

  const currentFmt = FORMATS.find((f) => f.id === selectedFormat) || FORMATS[1];
  const primaryHex = design?.colorZones?.primary?.hex || '#FFF0B5';
  const secondaryHex = design?.colorZones?.secondary?.hex || '#0A1A3A';
  const accentHex = design?.colorZones?.accent?.hex || '#DC2626';

  const teamName = (activePlayer?.name || design?.sampleName || 'ATLETIQ PRO').toUpperCase();
  const playerNumber = String(activePlayer?.number || design?.sampleNumber || '10');

  if (!isOpen) return null;

  // Obtener la captura 3D actual del canvas WebGL de forma segura
  let snapshotUrl = '';
  try {
    if (typeof canvasSnapshotRef?.current === 'function') {
      snapshotUrl = canvasSnapshotRef.current();
    } else if (canvasSnapshotRef?.current?.toDataURL) {
      snapshotUrl = canvasSnapshotRef.current.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('Snapshot error:', err);
  }

  const handleCopyShareLink = () => {
    try {
      const shareData = {
        p: design?.productModelId || 'futbol_jersey_pro_vneck',
        c1: primaryHex,
        c2: secondaryHex,
        c3: accentHex,
        num: playerNumber,
        name: teamName,
      };
      const encoded = btoa(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}${window.location.pathname}#studio?share=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadMockup = () => {
    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    canvas.width = currentFmt.width;
    canvas.height = currentFmt.height;
    const ctx = canvas.getContext('2d');

    // Fondo degradado deportivo premium tipo vestidor de estadio
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.45,
      canvas.width * 0.1,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.8
    );
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Luces de estadio / reflector superior
    const spotGrad = ctx.createRadialGradient(
      canvas.width * 0.5,
      0,
      10,
      canvas.width * 0.5,
      0,
      canvas.height * 0.6
    );
    spotGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    spotGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Si hay captura del 3D, dibujarla en el centro
    const drawJersey = (img) => {
      const jW = canvas.width * 0.75;
      const jH = (jW * 3) / 4;
      const jX = (canvas.width - jW) / 2;
      const jY = canvas.height * 0.22;

      // Sombra proyectada suave bajo la playera
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, jY + jH * 0.95, jW * 0.35, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.filter = 'blur(20px)';
      ctx.fill();
      ctx.restore();

      if (img) {
        ctx.drawImage(img, jX, jY, jW, jH);
      }

      // Marca de Agua y Certificación ATLETIQ
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ATLETIQ SPORT STUDIO', canvas.width * 0.5, canvas.height * 0.12);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('CUSTOM 3D MATCHDAY KIT • EDICIÓN PRO', canvas.width * 0.5, canvas.height * 0.155);

      // Pie de foto: Info del Kit
      const bY = canvas.height * 0.88;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px Arial, sans-serif';
      ctx.fillText(`${teamName}  #${playerNumber}`, canvas.width * 0.5, bY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText(`${product.name} • Paleta Oficial Sublimada`, canvas.width * 0.5, bY + 35);

      // Descargar archivo
      const a = document.createElement('a');
      a.download = `mockup_${design.designId || 'kit'}_${selectedFormat}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      setIsGenerating(false);
    };

    if (snapshotUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawJersey(img);
      img.onerror = () => drawJersey(null);
      img.src = snapshotUrl;
    } else {
      drawJersey(null);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Generador de Mockups para Redes Sociales</h2>
              <p className="text-xs text-slate-300">Crea imágenes fotorealistas de tu uniforme en alta resolución listas para Instagram y TikTok</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col md:flex-row gap-6 bg-slate-50">
          {/* Previsualización del Mockup */}
          <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-2xl p-4 shadow-inner relative overflow-hidden">
            {/* Luces y brillo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.2)_0%,transparent_70%)] pointer-events-none" />

            <div className={`relative max-h-[460px] w-auto ${currentFmt.aspectClass} rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 flex flex-col justify-between p-5 text-center`}>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-sky-400">ATLETIQ PRO</span>
                <h3 className="text-sm font-black text-white tracking-tight mt-0.5">MATCHDAY MOCKUP</h3>
              </div>

              {/* Render del Canvas 3D */}
              <div className="flex-1 flex items-center justify-center py-2">
                {snapshotUrl ? (
                  <img src={snapshotUrl} alt="3D Jersey Render" className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]" />
                ) : (
                  <div className="text-slate-500 text-xs font-bold">Generando vista 3D...</div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <div className="text-xs font-black text-white tracking-wide">{teamName} #{playerNumber}</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: primaryHex }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: secondaryHex }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: accentHex }} />
                </div>
              </div>
            </div>
          </div>

          {/* Opciones y Acciones */}
          <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-900 block mb-2">Formato de Exportación:</label>
                <div className="space-y-2">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedFormat === fmt.id
                          ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-black shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {fmt.id === 'banner' ? <Monitor className="w-4 h-4 text-sky-600" /> : <Smartphone className="w-4 h-4 text-sky-600" />}
                        <span className="text-xs">{fmt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{fmt.width}x{fmt.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Copiar Enlace para Compartir */}
              <div className="pt-2 border-t border-slate-200">
                <label className="text-xs font-black text-slate-900 block mb-2">Enlace Directo del Kit:</label>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Enlace Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copiar Enlace para WhatsApp / Web</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Descargar Mockup */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadMockup}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando imagen HD...' : 'Descargar Mockup en Alta Definición'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
