import React from 'react';

/**
 * ATLETIQ — JerseyThumbnailMiniature
 * Miniatura vectorial 2D ultranítida de la camiseta con su corte, colores oficiales,
 * patrón geométrico icónico (Chevron, Franja, Puma, Rayas, 50/50, etc.) y escudo del club.
 * Reemplaza los simples puntos de colores por una representación visual realista.
 */
export default function JerseyThumbnailMiniature({ kit, size = 68, className = '' }) {
  if (!kit) return null;

  const primary = kit.colorZones?.primary?.hex || '#ffffff';
  const secondary = kit.colorZones?.secondary?.hex || '#0f172a';
  const accents = kit.colorZones?.accents?.hex || '#ffcd00';
  const collar = kit.colorZones?.collar?.hex || secondary;
  const sleeves = kit.colorZones?.sleeves?.hex || primary;
  const id = kit.id || '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 drop-shadow-sm select-none ${className}`}
      style={{ width: size, height: size * 1.08 }}
      title={`${kit.name} — ${kit.clubAlias}`}
    >
      <svg
        viewBox="0 0 100 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-106"
      >
        <defs>
          {/* Silueta anatómica del cuerpo para enmascarar patrones */}
          <clipPath id={`jersey-clip-${id}`}>
            <path d="M28 20 L20 40 L31 43 L32 94 Q50 99 68 94 L69 43 L80 40 L72 20 L58 20 Q50 28 42 20 Z" />
          </clipPath>

          {/* Sombra suave de los pliegues */}
          <linearGradient id={`fold-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.16" />
            <stop offset="25%" stopColor="#000" stopOpacity="0" />
            <stop offset="75%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* --- 1. Mangas Izquierda y Derecha --- */}
        {/* Manga izquierda */}
        <path
          d="M28 20 L14 43 L27 48 L32 35 Z"
          fill={sleeves}
          stroke="#00000022"
          strokeWidth="1"
        />
        {/* Manga derecha */}
        <path
          d="M72 20 L86 43 L73 48 L68 35 Z"
          fill={sleeves}
          stroke="#00000022"
          strokeWidth="1"
        />

        {/* --- 2. Cuerpo Principal (con ClipPath) --- */}
        <g clipPath={`url(#jersey-clip-${id})`}>
          {/* Color Base */}
          <rect x="10" y="10" width="80" height="90" fill={primary} />

          {/* --- PATRONES ESPECÍFICOS SEGÚN EL CLUB --- */}

          {/* AMÉRICA: V Azteca tricolor */}
          {id.includes('america') && (
            <g>
              {/* Hombrera marina */}
              <polygon points="10,10 90,10 90,36 50,56 10,36" fill={secondary} />
              {/* Triángulos rojos exteriores */}
              <polygon points="10,36 24,36 17,44" fill={accents} />
              <polygon points="24,36 38,42 31,50" fill={accents} />
              <polygon points="38,42 50,56 44,62" fill={accents} />
              <polygon points="50,56 62,42 56,62" fill={accents} />
              <polygon points="62,42 76,36 69,50" fill={accents} />
              <polygon points="76,36 90,36 83,44" fill={accents} />
              {/* Rombo punta */}
              <polygon points="50,58 53,64 50,70 47,64" fill={accents} stroke="#FFC72C" strokeWidth="1" />
            </g>
          )}

          {/* PUMAS: Cabeza Felina Monumental */}
          {id.includes('pumas') && (
            <g>
              {/* Puma felino en pecho */}
              <path
                d="M40 42 Q50 45 60 42 Q68 44 68 54 Q65 68 50 74 Q35 68 32 54 Q32 44 40 42 Z"
                fill={secondary}
                stroke={kit.edition === 'visitante' || kit.edition === 'away' ? primary : '#D4AF37'}
                strokeWidth="1.5"
              />
              {/* Ojos y nariz */}
              <polygon points="44,52 48,50 44,47" fill={primary} />
              <polygon points="56,52 52,50 56,47" fill={primary} />
              <polygon points="50,54 52,60 48,60" fill={primary} />
            </g>
          )}

          {/* TIGRES: Franja Horizontal Pecho con Vivos */}
          {id.includes('tigres') && (
            <g>
              <rect x="10" y="44" width="80" height="20" fill={secondary} />
              <rect x="10" y="44" width="80" height="1.8" fill="#ffffff" />
              <rect x="10" y="62.2" width="80" height="1.8" fill="#ffffff" />
              <text x="50" y="56" fill={primary} fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
                TIGRES
              </text>
            </g>
          )}

          {/* PUEBLA: La Franja Diagonal */}
          {id.includes('puebla') && (
            <g>
              <polygon points="12,25 32,15 88,78 68,88" fill={secondary} />
              <line x1="12" y1="25" x2="68" y2="88" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="32" y1="15" x2="88" y2="78" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {/* ATLAS: División 50/50 Roja y Negra */}
          {id.includes('atlas') && (
            <g>
              <rect x="10" y="10" width="40" height="90" fill={primary} />
              <rect x="50" y="10" width="40" height="90" fill={secondary} />
              <line x1="50" y1="10" x2="50" y2="100" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            </g>
          )}

          {/* CHIVAS: 5 Rayas Verticales Rojas y Blancas */}
          {id.includes('chivas') && (
            <g>
              <rect x="10" y="10" width="80" height="90" fill={secondary} />
              <rect x="23" y="10" width="9" height="90" fill={primary} />
              <rect x="41" y="10" width="9" height="90" fill={primary} />
              <rect x="59" y="10" width="9" height="90" fill={primary} />
              <rect x="77" y="10" width="9" height="90" fill={primary} />
            </g>
          )}

          {/* RAYADOS: Rayas Verticales Azul Marino */}
          {id.includes('rayados') && (
            <g>
              <rect x="10" y="10" width="80" height="90" fill={secondary} />
              <rect x="26" y="10" width="13" height="90" fill={primary} />
              <rect x="44" y="10" width="12" height="90" fill={primary} />
              <rect x="61" y="10" width="13" height="90" fill={primary} />
            </g>
          )}

          {/* NECAXA / PACHUCA / SAN LUIS / QUERETARO: Rayas Verticales */}
          {(id.includes('necaxa') || id.includes('pachuca') || id.includes('san_luis') || id.includes('queretaro')) && (
            <g>
              <rect x="10" y="10" width="80" height="90" fill={primary} />
              <rect x="24" y="10" width="10" height="90" fill={secondary} />
              <rect x="45" y="10" width="10" height="90" fill={secondary} />
              <rect x="66" y="10" width="10" height="90" fill={secondary} />
            </g>
          )}

          {/* SANTOS: Rayas Horizontales Verdes */}
          {id.includes('santos') && (
            <g>
              <rect x="10" y="10" width="80" height="90" fill={secondary} />
              <rect x="10" y="24" width="80" height="11" fill={primary} />
              <rect x="10" y="46" width="80" height="11" fill={primary} />
              <rect x="10" y="68" width="80" height="11" fill={primary} />
            </g>
          )}

          {/* TOLUCA: Llamas Geométricas */}
          {id.includes('toluca') && (
            <g opacity="0.4">
              <polygon points="20,70 30,55 40,70" fill={secondary} />
              <polygon points="40,70 50,50 60,70" fill={secondary} />
              <polygon points="60,70 70,55 80,70" fill={secondary} />
            </g>
          )}

          {/* JUÁREZ: "X" Gigante */}
          {id.includes('juarez') && (
            <g>
              <line x1="20" y1="25" x2="80" y2="85" stroke="#111111" strokeWidth="8" />
              <line x1="80" y1="25" x2="20" y2="85" stroke={secondary} strokeWidth="8" />
              <line x1="20" y1="25" x2="80" y2="85" stroke={primary} strokeWidth="1.5" />
              <line x1="80" y1="25" x2="20" y2="85" stroke={primary} strokeWidth="1.5" />
            </g>
          )}

          {/* --- PATRONES GENERALES DE DISEÑO PERSONALIZABLE ATLETIQ --- */}
          {(id === 'tackle' || id === 'rayas_clasicas' || id === 'franjas_elite' || id === 'steps' || id.includes('stripes')) && (
            <g>
              <rect x="25" y="10" width="10" height="90" fill={secondary} />
              <rect x="45" y="10" width="10" height="90" fill={secondary} />
              <rect x="65" y="10" width="10" height="90" fill={secondary} />
              <line x1="30" y1="10" x2="30" y2="100" stroke={accents} strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="100" stroke={accents} strokeWidth="1" />
              <line x1="70" y1="10" x2="70" y2="100" stroke={accents} strokeWidth="1" />
            </g>
          )}

          {(id === 'strike' || id === 'diagonal_hyper' || id === 'banda_cruzada' || id.includes('diagonal')) && (
            <g>
              <polygon points="12,25 32,15 88,78 68,88" fill={secondary} />
              <line x1="12" y1="25" x2="68" y2="88" stroke={accents} strokeWidth="2" />
              <line x1="32" y1="15" x2="88" y2="78" stroke={accents} strokeWidth="2" />
            </g>
          )}

          {(id === 'city' || id === 'horizon' || id === 'fusion_prisma' || id.includes('chest_band')) && (
            <g>
              <rect x="10" y="44" width="80" height="20" fill={secondary} />
              <rect x="10" y="42" width="80" height="2" fill={accents} />
              <rect x="10" y="64" width="80" height="2" fill={accents} />
            </g>
          )}

          {(id === 'champion' || id === 'chevron_center' || id.includes('chevron')) && (
            <g>
              <polygon points="10,30 50,55 90,30 90,44 50,69 10,44" fill={secondary} />
              <polygon points="10,48 50,73 90,48 90,56 50,81 10,56" fill={accents} />
            </g>
          )}

          {(id === 'gladiator' || id === 'dinamico_pro' || id.includes('gladiator')) && (
            <g>
              <polygon points="10,10 50,60 90,10" fill={secondary} opacity="0.85" />
              <polygon points="20,10 50,50 80,10" fill={accents} opacity="0.6" />
              <polygon points="10,95 50,45 90,95" fill={secondary} opacity="0.7" />
            </g>
          )}

          {(id === 'fight' || id === 'vanguardia_dual' || id.includes('half_split')) && (
            <g>
              <polygon points="10,10 90,10 10,95" fill={secondary} />
              <polygon points="90,10 90,95 10,95" fill={primary} />
              <line x1="90" y1="10" x2="10" y2="95" stroke={accents} strokeWidth="2" />
            </g>
          )}

          {(id === 'level' || id === 'mosaico_cyber' || id.includes('matrix')) && (
            <g opacity="0.5">
              <line x1="10" y1="30" x2="90" y2="30" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="10" y1="50" x2="90" y2="50" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="10" y1="70" x2="90" y2="70" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="10" x2="30" y2="95" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="10" x2="50" y2="95" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="70" y1="10" x2="70" y2="95" stroke={secondary} strokeWidth="1" strokeDasharray="3,3" />
            </g>
          )}

          {(id === 'style' || id === 'acento_hombros') && (
            <g>
              <polygon points="10,10 90,10 90,32 50,42 10,32" fill={secondary} />
              <line x1="10" y1="32" x2="50" y2="42" stroke={accents} strokeWidth="2" />
              <line x1="90" y1="32" x2="50" y2="42" stroke={accents} strokeWidth="2" />
            </g>
          )}

          {id === 'rayo' && (
            <g>
              <polygon points="45,10 58,10 38,50 62,50 35,95 48,56 28,56" fill={accents} stroke={secondary} strokeWidth="1" />
            </g>
          )}

          {(id === 'sweep' || id === 'topografia_tech') && (
            <g opacity="0.7">
              <path d="M10 35 Q50 60 90 35" stroke={secondary} strokeWidth="3" fill="none" />
              <path d="M10 55 Q50 80 90 55" stroke={accents} strokeWidth="3" fill="none" />
              <path d="M10 75 Q50 100 90 75" stroke={secondary} strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Sombra de relieve de pliegues */}
          <rect x="10" y="10" width="80" height="90" fill={`url(#fold-grad-${id})`} />
        </g>

        {/* --- 3. Escudo en el Pecho Izquierdo (Opcional) --- */}
        {kit.showShield !== false && (
          <g>
            <circle cx="62" cy="36" r="5" fill="#ffffff" stroke={secondary} strokeWidth="1.2" />
            <circle cx="62" cy="36" r="3.2" fill={secondary} />
            <circle cx="62" cy="36" r="1.5" fill={accents} />
          </g>
        )}

        {/* --- 4. Cuello V-Neck Anatómico --- */}
        <path
          d="M42 20 L50 32 L58 20 Q50 25 42 20 Z"
          fill={collar}
          stroke="#00000033"
          strokeWidth="1"
        />

        {/* --- 5. Contorno General y Costuras --- */}
        <path
          d="M28 20 L20 40 L31 43 L32 94 Q50 99 68 94 L69 43 L80 40 L72 20 L58 20 Q50 28 42 20 Z"
          fill="none"
          stroke="#00000028"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
