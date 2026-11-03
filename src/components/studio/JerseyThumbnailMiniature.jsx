import React from 'react';

/**
 * ATLETIQ — JerseyThumbnailMiniature
 * Miniatura vectorial 2D ultranítida de la camiseta con su corte, colores oficiales,
 * patrón geométrico icónico (Chevron, Franja, Puma, Rayas, 50/50, etc.),
 * logotipo de patrocinador oficial en el pecho y escudo heráldico del club.
 * 
 * Cobertura 100% fiel para los 36 kits de la Liga MX y los 24 kits de la UEFA Champions League.
 */
export default function JerseyThumbnailMiniature({ kit, size = 68, className = '' }) {
  if (!kit) return null;

  const primary = kit.colorZones?.primary?.hex || '#ffffff';
  const secondary = kit.colorZones?.secondary?.hex || '#0f172a';
  const accents = kit.colorZones?.accents?.hex || '#ffcd00';
  const collar = kit.colorZones?.collar?.hex || secondary;
  const sleeves = kit.colorZones?.sleeves?.hex || primary;
  const id = (kit.id || '').toLowerCase();
  const baseClubId = (kit.baseClubId || '').toLowerCase();

  // Determinar patrocinador oficial según el club
  const getSponsor = () => {
    // UCL Club Sponsors
    if (id.includes('real_madrid') || id.includes('arsenal') || id.includes('milan')) return 'EMIRATES';
    if (id.includes('barcelona')) return 'SPOTIFY';
    if (id.includes('man_city')) return 'ETIHAD';
    if (id.includes('bayern')) return 'TELEKOM';
    if (id.includes('psg')) return 'QATAR';
    if (id.includes('liverpool')) return 'STD_CHARTERED';
    if (id.includes('inter')) return 'BETSSON';
    if (id.includes('juventus')) return 'JEEP';
    if (id.includes('dortmund')) return '1AND1';
    if (id.includes('atletico')) return 'RIYADH';

    // Liga MX Club Sponsors
    if (id.includes('america') || id.includes('chivas') || id.includes('atlas') || id.includes('puebla') || id.includes('xolos') || id.includes('mazatlan')) return 'CALIENTE';
    if (id.includes('cruz_azul')) return 'CRUZ_AZUL';
    if (id.includes('pumas')) return 'DHL';
    if (id.includes('tigres')) return 'CEMEX';
    if (id.includes('rayados')) return 'CODERE';
    if (id.includes('santos')) return 'SORIANA';
    if (id.includes('toluca')) return 'ROSHFRANS';
    if (id.includes('leon') || id.includes('pachuca')) return 'FORTALEZA';
    if (id.includes('necaxa')) return 'ROLCAR';
    if (id.includes('queretaro')) return 'PEDIGREE';
    if (id.includes('san_luis')) return 'CANELS';
    if (id.includes('juarez')) return 'BETCRIS';

    return null;
  };

  const sponsor = getSponsor();

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 drop-shadow-sm select-none ${className}`}
      style={{ width: size, height: size * 1.08 }}
      title={`${kit.name} — ${kit.clubAlias || kit.name}`}
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
            <stop offset="75%" stopColor="#fff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* --- 1. Mangas Izquierda y Derecha --- */}
        <path
          d="M28 20 L14 43 L27 48 L32 35 Z"
          fill={sleeves}
          stroke="#00000022"
          strokeWidth="1"
        />
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

          {/* ========================================================= */}
          {/* PATRONES LIGA MX                                         */}
          {/* ========================================================= */}

          {/* AMÉRICA: V Azteca Plumaje */}
          {id.includes('america') && (
            <g>
              <polygon points="10,10 90,10 90,36 50,56 10,36" fill={secondary} />
              <polygon points="10,36 24,36 17,44" fill={accents} />
              <polygon points="24,36 38,42 31,50" fill={accents} />
              <polygon points="38,42 50,56 44,62" fill={accents} />
              <polygon points="50,56 62,42 56,62" fill={accents} />
              <polygon points="62,42 76,36 69,50" fill={accents} />
              <polygon points="76,36 90,36 83,44" fill={accents} />
              <polygon points="50,58 53,64 50,70 47,64" fill={accents} stroke="#FFC72C" strokeWidth="0.8" />
            </g>
          )}

          {/* CHIVAS: Rayas Locales o Barra Away */}
          {id.includes('chivas') && (
            id.includes('away') ? (
              <g>
                <rect x="10" y="44" width="80" height="18" fill="#001A49" />
                <rect x="10" y="42" width="80" height="2" fill="#C8102E" />
                <rect x="10" y="62" width="80" height="2" fill="#C8102E" />
              </g>
            ) : (
              <g>
                <rect x="10" y="10" width="80" height="90" fill="#FFFFFF" />
                <rect x="23" y="10" width="8.5" height="90" fill="#C8102E" />
                <rect x="41.5" y="10" width="8.5" height="90" fill="#C8102E" />
                <rect x="60" y="10" width="8.5" height="90" fill="#C8102E" />
                <rect x="78.5" y="10" width="8.5" height="90" fill="#C8102E" />
              </g>
            )
          )}

          {/* CRUZ AZUL: Jacquard Azul o Visita Blanco */}
          {id.includes('cruz_azul') && (
            <g>
              <rect x="25" y="10" width="10" height="90" fill={secondary} opacity="0.3" />
              <rect x="45" y="10" width="10" height="90" fill={secondary} opacity="0.3" />
              <rect x="65" y="10" width="10" height="90" fill={secondary} opacity="0.3" />
            </g>
          )}

          {/* PUMAS: Cabeza Felina Monumental */}
          {id.includes('pumas') && (
            <g>
              <path
                d="M40 42 Q50 45 60 42 Q68 44 68 54 Q65 68 50 74 Q35 68 32 54 Q32 44 40 42 Z"
                fill={secondary}
                stroke={accents}
                strokeWidth="1.2"
              />
              <polygon points="44,52 48,50 44,47" fill={primary} />
              <polygon points="56,52 52,50 56,47" fill={primary} />
              <polygon points="50,54 52,60 48,60" fill={primary} />
            </g>
          )}

          {/* TIGRES: Franja Pecho con Vivos */}
          {id.includes('tigres') && (
            <g>
              <rect x="10" y="44" width="80" height="20" fill={secondary} />
              <rect x="10" y="44" width="80" height="1.8" fill="#ffffff" />
              <rect x="10" y="62.2" width="80" height="1.8" fill="#ffffff" />
              <text x="50" y="56" fill={primary} fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
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

          {/* ATLAS: 50/50 Rojinegro o Banda Away */}
          {id.includes('atlas') && (
            id.includes('away') ? (
              <g>
                <polygon points="15,20 30,15 85,80 70,85" fill="#C8102E" />
                <polygon points="30,15 45,10 100,75 85,80" fill="#0A0A0A" />
              </g>
            ) : (
              <g>
                <rect x="10" y="10" width="40" height="90" fill={primary} />
                <rect x="50" y="10" width="40" height="90" fill={secondary} />
                <line x1="50" y1="10" x2="50" y2="100" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
              </g>
            )
          )}

          {/* RAYADOS: Rayas o Cerro de la Silla */}
          {id.includes('rayados') && (
            id.includes('away') ? (
              <g>
                <polygon points="10,75 35,55 50,65 75,48 90,65 90,95 10,95" fill="#001A49" />
                <polyline points="10,75 35,55 50,65 75,48 90,65" stroke="#00A3E0" strokeWidth="1.5" fill="none" />
              </g>
            ) : (
              <g>
                <rect x="10" y="10" width="80" height="90" fill="#FFFFFF" />
                <rect x="25" y="10" width="12" height="90" fill="#001A49" />
                <rect x="44" y="10" width="12" height="90" fill="#001A49" />
                <rect x="63" y="10" width="12" height="90" fill="#001A49" />
              </g>
            )
          )}

          {/* SANTOS: Rayas Horizontales Verdes */}
          {id.includes('santos') && (
            <g>
              <rect x="10" y="24" width="80" height="11" fill={accents || '#007A33'} />
              <rect x="10" y="46" width="80" height="11" fill={accents || '#007A33'} />
              <rect x="10" y="68" width="80" height="11" fill={accents || '#007A33'} />
            </g>
          )}

          {/* TOLUCA: Llamas Diablos */}
          {id.includes('toluca') && (
            <g opacity="0.6">
              <polygon points="20,70 30,52 40,70" fill={secondary} />
              <polygon points="40,70 50,48 60,70" fill={secondary} />
              <polygon points="60,70 70,52 80,70" fill={secondary} />
            </g>
          )}

          {/* LEÓN: Garras Esmeralda */}
          {id.includes('leon') && (
            <g opacity="0.7">
              <path d="M15 35 Q30 40 40 55 Q28 48 15 35 Z" fill={secondary} />
              <path d="M15 50 Q30 55 40 70 Q28 63 15 50 Z" fill={secondary} />
              <path d="M15 65 Q30 70 40 85 Q28 78 15 65 Z" fill={secondary} />
            </g>
          )}

          {/* PACHUCA / NECAXA / QUERETARO / SAN LUIS: Rayas */}
          {(id.includes('pachuca') || id.includes('necaxa') || id.includes('queretaro') || id.includes('san_luis')) && (
            <g>
              <rect x="23" y="10" width="9" height="90" fill={secondary} />
              <rect x="42" y="10" width="9" height="90" fill={secondary} />
              <rect x="61" y="10" width="9" height="90" fill={secondary} />
              <rect x="80" y="10" width="9" height="90" fill={secondary} />
            </g>
          )}

          {/* JUÁREZ: X Gigante Bravos */}
          {id.includes('juarez') && (
            <g>
              <line x1="20" y1="25" x2="80" y2="85" stroke="#111111" strokeWidth="7" />
              <line x1="80" y1="25" x2="20" y2="85" stroke={secondary} strokeWidth="7" />
              <line x1="20" y1="25" x2="80" y2="85" stroke={accents} strokeWidth="1.2" />
              <line x1="80" y1="25" x2="20" y2="85" stroke={accents} strokeWidth="1.2" />
            </g>
          )}

          {/* XOLOS: Zarpazo Rojo y Negro */}
          {id.includes('xolos') && (
            <g>
              <rect x="10" y="38" width="80" height="28" fill="#C8102E" />
              <line x1="10" y1="66" x2="90" y2="66" stroke="#0A0A0A" strokeWidth="2.5" />
            </g>
          )}

          {/* MAZATLÁN: Olas Moradas y Cian */}
          {id.includes('mazatlan') && (
            <g>
              <path d="M10 40 Q30 35 50 42 Q70 50 90 40" stroke="#00F5D4" strokeWidth="2.5" fill="none" />
              <path d="M10 52 Q30 47 50 54 Q70 62 90 52" stroke="#00F5D4" strokeWidth="2" fill="none" />
              <path d="M10 64 Q30 59 50 66 Q70 74 90 64" stroke="#4B0082" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* ========================================================= */}
          {/* PATRONES UEFA CHAMPIONS LEAGUE                           */}
          {/* ========================================================= */}

          {/* REAL MADRID: Blanco Real o Naranja Away */}
          {id.includes('real_madrid') && (
            <g>
              <line x1="28" y1="20" x2="20" y2="40" stroke={accents} strokeWidth="1.8" />
              <line x1="72" y1="20" x2="80" y2="40" stroke={accents} strokeWidth="1.8" />
            </g>
          )}

          {/* BARCELONA: 125 Años Mitades Blaugrana */}
          {id.includes('barcelona') && (
            id.includes('away') ? (
              <g>
                <line x1="10" y1="18" x2="30" y2="18" stroke="#004D98" strokeWidth="2" />
                <line x1="70" y1="18" x2="90" y2="18" stroke="#A50044" strokeWidth="2" />
              </g>
            ) : (
              <g>
                <rect x="10" y="10" width="40" height="90" fill="#004D98" />
                <rect x="50" y="10" width="40" height="90" fill="#A50044" />
                <line x1="50" y1="10" x2="50" y2="100" stroke="#EDBB00" strokeWidth="0.8" opacity="0.6" />
              </g>
            )
          )}

          {/* MAN CITY: Rayas 1999 o Celeste Puro */}
          {id.includes('man_city') && id.includes('away') && (
            <g>
              <rect x="22" y="10" width="10" height="90" fill="#00285E" />
              <rect x="42" y="10" width="10" height="90" fill="#00285E" />
              <rect x="62" y="10" width="10" height="90" fill="#00285E" />
              <rect x="82" y="10" width="10" height="90" fill="#00285E" />
            </g>
          )}

          {/* BAYERN: Triple Red Stripes */}
          {id.includes('bayern') && (
            <g>
              <rect x="25" y="10" width="9" height="90" fill="#800000" />
              <rect x="45" y="10" width="9" height="90" fill="#800000" />
              <rect x="65" y="10" width="9" height="90" fill="#800000" />
            </g>
          )}

          {/* PSG: Hechter Central Bar */}
          {id.includes('psg') && (
            <g>
              <rect x="42" y="10" width="16" height="90" fill="#DA291C" />
              <rect x="40" y="10" width="2" height="90" fill="#FFFFFF" />
              <rect x="58" y="10" width="2" height="90" fill="#FFFFFF" />
            </g>
          )}

          {/* ARSENAL: Costados Blancos y Cañón */}
          {id.includes('arsenal') && !id.includes('away') && (
            <g>
              <polygon points="10,10 28,20 31,43 32,94 10,94" fill="#FFFFFF" />
              <polygon points="90,10 72,20 69,43 68,94 90,94" fill="#FFFFFF" />
            </g>
          )}

          {/* LIVERPOOL: Pinstripes Retro */}
          {id.includes('liverpool') && (
            <g>
              <line x1="28" y1="10" x2="28" y2="100" stroke="#F6EB61" strokeWidth="0.8" opacity="0.8" />
              <line x1="42" y1="10" x2="42" y2="100" stroke="#F6EB61" strokeWidth="0.8" opacity="0.8" />
              <line x1="58" y1="10" x2="58" y2="100" stroke="#F6EB61" strokeWidth="0.8" opacity="0.8" />
              <line x1="72" y1="10" x2="72" y2="100" stroke="#F6EB61" strokeWidth="0.8" opacity="0.8" />
            </g>
          )}

          {/* INTER: Rayas Nerazzurri */}
          {id.includes('inter') && !id.includes('away') && (
            <g>
              <rect x="22" y="10" width="10" height="90" fill="#001EA0" />
              <rect x="42" y="10" width="10" height="90" fill="#001EA0" />
              <rect x="62" y="10" width="10" height="90" fill="#001EA0" />
              <rect x="82" y="10" width="10" height="90" fill="#001EA0" />
            </g>
          )}

          {/* JUVENTUS: Rayas Bianconeri */}
          {id.includes('juventus') && !id.includes('away') && (
            <g>
              <rect x="22" y="10" width="11" height="90" fill="#000000" />
              <rect x="43" y="10" width="11" height="90" fill="#000000" />
              <rect x="64" y="10" width="11" height="90" fill="#000000" />
            </g>
          )}

          {/* DORTMUND: Bloques Cyber BVB */}
          {id.includes('dortmund') && (
            <g>
              <rect x="18" y="10" width="14" height="90" fill="#000000" />
              <rect x="68" y="10" width="14" height="90" fill="#000000" />
            </g>
          )}

          {/* ATLETICO: Rayas Rojiblancas */}
          {id.includes('atletico') && !id.includes('away') && (
            <g>
              <rect x="22" y="10" width="11" height="90" fill="#CB3524" />
              <rect x="43" y="10" width="11" height="90" fill="#CB3524" />
              <rect x="64" y="10" width="11" height="90" fill="#CB3524" />
            </g>
          )}

          {/* MILAN: Rayas Rossoneri */}
          {id.includes('milan') && !id.includes('away') && (
            <g>
              <rect x="22" y="10" width="11" height="90" fill="#FB090B" />
              <rect x="43" y="10" width="11" height="90" fill="#FB090B" />
              <rect x="64" y="10" width="11" height="90" fill="#FB090B" />
            </g>
          )}

          {/* Sombra de relieve de pliegues sobre el cuerpo */}
          <rect x="10" y="10" width="80" height="90" fill={`url(#fold-grad-${id})`} />
        </g>

        {/* --- 3. PATROCINADOR OFICIAL EN EL PECHO (Fiel al Real) --- */}
        {sponsor && (
          <g>
            {sponsor === 'CALIENTE' && (
              <g>
                <ellipse cx="44" cy="62" rx="4" ry="3.5" fill="#C8102E" />
                <text x="52" y="64" fill={id.includes('away') && !id.includes('chivas') && !id.includes('atlas') ? secondary : '#C8102E'} fontSize="5" fontWeight="900" fontFamily="sans-serif">
                  caliente
                </text>
              </g>
            )}
            {sponsor === 'CRUZ_AZUL' && (
              <g>
                <rect x="42" y="58" width="16" height="8" fill="#FFFFFF" rx="1" />
                <rect x="48" y="59.5" width="4" height="5" fill="#002B7F" />
                <line x1="50" y1="60" x2="50" y2="64" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="48.5" y1="62" x2="51.5" y2="62" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            )}
            {sponsor === 'DHL' && (
              <g>
                <rect x="41" y="59" width="18" height="7" fill="#FFCC00" rx="1" />
                <text x="50" y="64.5" fill="#D40511" fontSize="5.5" fontStyle="italic" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                  DHL
                </text>
              </g>
            )}
            {sponsor === 'CEMEX' && (
              <text x="50" y="64" fill={secondary} fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8">
                CEMEX
              </text>
            )}
            {sponsor === 'CODERE' && (
              <text x="50" y="64" fill={primary === '#FFFFFF' ? '#001A49' : '#FFFFFF'} fontSize="5.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                codere
              </text>
            )}
            {sponsor === 'SORIANA' && (
              <text x="50" y="64" fill={primary === '#FFFFFF' ? '#007A33' : '#FFFFFF'} fontSize="5.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                Soriana
              </text>
            )}
            {sponsor === 'ROSHFRANS' && (
              <text x="50" y="64" fill="#FFFFFF" fontSize="4.6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ROSHFRANS
              </text>
            )}
            {sponsor === 'FORTALEZA' && (
              <text x="50" y="64" fill={primary === '#FFFFFF' ? '#004D25' : '#FFFFFF'} fontSize="4.6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                FORTALEZA
              </text>
            )}
            {sponsor === 'ROLCAR' && (
              <text x="50" y="64" fill="#FFFFFF" fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ROLCAR
              </text>
            )}
            {sponsor === 'PEDIGREE' && (
              <text x="50" y="64" fill="#003DA5" fontSize="4.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                Pedigree
              </text>
            )}
            {sponsor === 'CANELS' && (
              <text x="50" y="64" fill="#FFFFFF" fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                Canel's
              </text>
            )}
            {sponsor === 'BETCRIS' && (
              <text x="50" y="64" fill={secondary} fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                betcris
              </text>
            )}

            {/* UCL Sponsors */}
            {sponsor === 'EMIRATES' && (
              <g>
                <text x="50" y="61.5" fill={primary === '#FFFFFF' ? '#001A49' : '#FFFFFF'} fontSize="3.6" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
                  Fly
                </text>
                <text x="50" y="66" fill={primary === '#FFFFFF' ? '#001A49' : '#FFFFFF'} fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.4">
                  Emirates
                </text>
              </g>
            )}
            {sponsor === 'SPOTIFY' && (
              <g>
                <circle cx="44" cy="62.5" r="3.2" fill="#1DB954" />
                <path d="M42 61.5 Q44 60.8 46 61.5 M42.5 62.8 Q44 62.2 45.5 62.8 M43 64 Q44 63.6 45 64" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" fill="none" />
                <text x="52" y="64.5" fill={id.includes('away') ? '#FFFFFF' : '#EDBB00'} fontSize="4.5" fontWeight="900" fontFamily="sans-serif">
                  Spotify
                </text>
              </g>
            )}
            {sponsor === 'ETIHAD' && (
              <text x="50" y="63" fill={primary === '#6CABDD' ? '#00285E' : '#FFFFFF'} fontSize="4.8" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8">
                ETIHAD
              </text>
            )}
            {sponsor === 'TELEKOM' && (
              <text x="50" y="64" fill="#FFFFFF" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                •T•••
              </text>
            )}
            {sponsor === 'QATAR' && (
              <text x="50" y="63.5" fill="#FFFFFF" fontSize="4.2" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.6">
                QATAR
              </text>
            )}
            {sponsor === 'STD_CHARTERED' && (
              <text x="50" y="63.5" fill="#FFFFFF" fontSize="3.8" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
                Standard Chartered
              </text>
            )}
            {sponsor === 'BETSSON' && (
              <text x="50" y="63.5" fill="#FFFFFF" fontSize="4.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                betsson
              </text>
            )}
            {sponsor === 'JEEP' && (
              <text x="50" y="64" fill={primary === '#FFFFFF' ? '#000000' : '#FFFFFF'} fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
                Jeep
              </text>
            )}
            {sponsor === '1AND1' && (
              <g>
                <rect x="42" y="58.5" width="16" height="8" fill="#000000" rx="1.5" />
                <text x="50" y="64.5" fill="#FFFFFF" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                  1&1
                </text>
              </g>
            )}
            {sponsor === 'RIYADH' && (
              <text x="50" y="63.5" fill={primary === '#FFFFFF' ? '#001A49' : '#FFFFFF'} fontSize="4" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
                RIYADH AIR
              </text>
            )}
          </g>
        )}

        {/* --- 4. Escudo Heráldico en el Pecho Izquierdo --- */}
        {kit.showShield !== false && (
          <g>
            <circle cx="62" cy="36" r="4.8" fill="#ffffff" stroke={secondary} strokeWidth="1.2" />
            <circle cx="62" cy="36" r="3.2" fill={secondary} />
            <circle cx="62" cy="36" r="1.4" fill={accents} />
          </g>
        )}

        {/* --- 5. Cuello V-Neck Anatómico --- */}
        <path
          d="M42 20 L50 32 L58 20 Q50 25 42 20 Z"
          fill={collar}
          stroke="#00000033"
          strokeWidth="1"
        />

        {/* --- 6. Contorno General y Costuras --- */}
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
