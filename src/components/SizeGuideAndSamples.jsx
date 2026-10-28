import React, { useState } from 'react';
import { Ruler, Package, Check, Sparkles, Send, ShieldCheck, Info } from 'lucide-react';

const SIZE_TABLES = {
  men: {
    label: 'Hombre / Unisex (Corte Pro)',
    headers: ['Talla', 'Pecho (cm)', 'Cintura (cm)', 'Largo Espalda (cm)', 'Estatura Recomendada'],
    rows: [
      ['S', '88 - 94', '76 - 82', '71', '165 - 173 cm'],
      ['M', '95 - 102', '83 - 90', '73', '172 - 180 cm'],
      ['L', '103 - 110', '91 - 98', '75', '178 - 186 cm'],
      ['XL', '111 - 118', '99 - 106', '77', '184 - 192 cm'],
      ['2XL', '119 - 126', '107 - 114', '79', '188 - 196 cm'],
      ['3XL', '127 - 134', '115 - 122', '81', '190+ cm'],
    ],
  },
  women: {
    label: 'Dama (Corte Anatómico Femenino)',
    headers: ['Talla', 'Pecho (cm)', 'Cintura (cm)', 'Cadera (cm)', 'Largo Espalda (cm)'],
    rows: [
      ['XS', '80 - 85', '64 - 69', '88 - 93', '63'],
      ['S', '86 - 91', '70 - 75', '94 - 99', '65'],
      ['M', '92 - 97', '76 - 81', '100 - 105', '67'],
      ['L', '98 - 103', '82 - 87', '106 - 111', '69'],
      ['XL', '104 - 109', '88 - 93', '112 - 117', '71'],
      ['2XL', '110 - 116', '94 - 100', '118 - 124', '73'],
    ],
  },
  kids: {
    label: 'Junior / Escolar',
    headers: ['Talla / Edad', 'Estatura (cm)', 'Pecho (cm)', 'Cintura (cm)', 'Largo (cm)'],
    rows: [
      ['116 (6 años)', '111 - 116', '58 - 62', '53 - 56', '49'],
      ['128 (8 años)', '123 - 128', '63 - 67', '57 - 60', '53'],
      ['140 (10 años)', '135 - 140', '68 - 73', '61 - 65', '57'],
      ['152 (12 años)', '147 - 152', '74 - 79', '66 - 70', '61'],
      ['164 (14 años)', '159 - 164', '80 - 85', '71 - 75', '65'],
    ],
  },
};

export default function SizeGuideAndSamples() {
  const [activeTab, setActiveTab] = useState('sizes'); // 'sizes' | 'samples'
  const [sizeCategory, setSizeCategory] = useState('men');
  const [sampleSubmitted, setSampleSubmitted] = useState(false);
  const [sampleForm, setSampleForm] = useState({
    clubName: '',
    contactName: '',
    email: '',
    phone: '',
    sport: 'futbol',
    address: '',
    notes: '',
  });

  const handleSampleSubmit = (e) => {
    e.preventDefault();
    setSampleSubmitted(true);
  };

  return (
    <section id="tallas-muestras" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
            Garantía de Ajuste y Tejidos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Guía de Tallas &amp; Muestras para Clubes
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Asegúrate de que cada miembro de tu equipo vista la talla perfecta. Consulta las tablas oficiales o solicita una caja de prueba física sin costo.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('sizes')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sizes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4 text-sky-600" />
            <span>Tabla de Tallas</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>Muestrario Físico Gratis</span>
          </button>
        </div>
      </div>

      {activeTab === 'sizes' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Subtabs for Men, Women, Kids */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
            <div className="flex flex-wrap gap-2">
              {Object.keys(SIZE_TABLES).map((key) => (
                <button
                  key={key}
                  onClick={() => setSizeCategory(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sizeCategory === key
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {SIZE_TABLES[key].label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Medidas corporales exactas en centímetros (cm).</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  {SIZE_TABLES[sizeCategory].headers.map((h, i) => (
                    <th key={i} className="py-3.5 px-4 font-extrabold text-slate-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {SIZE_TABLES[sizeCategory].rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-sky-50/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3.5 px-4 ${
                          cIdx === 0
                            ? 'font-black text-slate-900 bg-slate-50/70'
                            : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips for measuring */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">A. Contorno de Pecho:</span>
              Mide horizontalmente alrededor de la parte más ancha del pecho, pasando por debajo de las axilas con la cinta firme pero sin apretar.
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">B. Cintura:</span>
              Mide la circunferencia natural de la cintura, justo por encima del hueso de la cadera en posición relajada.
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-1">C. Entre dos tallas:</span>
              Si buscas un ajuste más atlético o ceñido elige la talla menor; para un ajuste holgado o usar prendas térmicas debajo, elige la superior.
            </div>
          </div>
        </div>
      ) : (
        /* Samples Form */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Servicio de Prueba para Clubes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Prueba las tallas y tejidos con tu equipo antes de pedir
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Te enviamos una caja con prendas de muestra en diferentes tallas y nuestra carta de 24 colores deportivos impresa en tejido real para que toda la plantilla elija su talla con total seguridad.
            </p>

            <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Muestras reales de Fútbol, Baloncesto y Chaqueta Softshell.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Carta de colores y muestras de sublimación HD 500 DPI.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Envío gratuito de ida y devolución incluida con etiqueta prepagada.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
            {sampleSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  ¡Solicitud de Muestras Recibida!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Nos pondremos en contacto con <strong>{sampleForm.contactName}</strong> en las próximas 24 horas para confirmar la dirección de envío de tu club ({sampleForm.clubName}).
                </p>
                <button
                  onClick={() => setSampleSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Solicitar otra muestra
                </button>
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Formulario de Envío de Muestras
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Club o Colegio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Club Deportivo San Isidro"
                      value={sampleForm.clubName}
                      onChange={(e) => setSampleForm({ ...sampleForm, clubName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-sky-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Persona de Contacto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellidos"
                      value={sampleForm.contactName}
                      onChange={(e) => setSampleForm({ ...sampleForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-sky-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Oficial *</label>
                    <input
                      type="email"
                      required
                      placeholder="contacto@tuclub.com"
                      value={sampleForm.email}
                      onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-sky-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+52 55 1234 5678 / +1 800..."
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-sky-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Deporte Principal</label>
                  <select
                    value={sampleForm.sport}
                    onChange={(e) => setSampleForm({ ...sampleForm, sport: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-sky-600"
                  >
                    <option value="futbol">Fútbol / Fútbol Sala</option>
                    <option value="basket">Baloncesto / Basketball</option>
                    <option value="chaquetas">Chaquetas Técnicas &amp; Paseo</option>
                    <option value="completo">Muestrario Multideporte Completo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Solicitar Muestras Gratuitas Ahora</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
