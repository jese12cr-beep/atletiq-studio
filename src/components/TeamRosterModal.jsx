import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Users, Check, Flame, Download } from 'lucide-react';
import { BULK_DISCOUNT_TIERS } from '../data/mockData';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '10 (Niño)', '12 (Niño)', '14 (Niño)'];

export default function TeamRosterModal({
  isOpen,
  onClose,
  initialRoster = [],
  basePrice = 32.99,
  onSaveRoster
}) {
  const dialogRef = useRef(null);
  const [players, setPlayers] = useState([
    { id: 1, name: 'CARLOS R.', number: '10', size: 'L', notes: 'Capitán' },
    { id: 2, name: 'MATEO V.', number: '7', size: 'M', notes: 'Delantero' },
    { id: 3, name: 'SANTIAGO G.', number: '9', size: 'XL', notes: 'Delantero' },
    { id: 4, name: 'ANDRÉS M.', number: '1', size: 'L', notes: 'Portero' },
    { id: 5, name: 'DANIEL P.', number: '5', size: 'M', notes: 'Defensa' },
  ]);

  // Sync initialRoster if provided
  useEffect(() => {
    if (initialRoster && initialRoster.length > 0) {
      setPlayers(initialRoster);
    }
  }, [initialRoster]);

  // Handle dialog showModal and closedby fallback per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }

    // Fallback for browsers without closedby support
    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        onClose();
      }
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, onClose]);

  const addPlayer = () => {
    const nextNum = (players.length + 1).toString();
    setPlayers([
      ...players,
      { id: Date.now(), name: '', number: nextNum, size: 'M', notes: '' }
    ]);
  };

  const removePlayer = (id) => {
    if (players.length <= 1) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSave = () => {
    onSaveRoster(players);
    onClose();
  };

  // Bulk discount calculation
  const totalCount = players.length;
  const currentTier = BULK_DISCOUNT_TIERS.find(t => totalCount >= t.min && totalCount <= t.max) || BULK_DISCOUNT_TIERS[0];
  const unitPrice = (basePrice * (1 - currentTier.discountPct / 100)).toFixed(2);
  const totalPrice = (unitPrice * totalCount).toFixed(2);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="roster-modal-title"
      className="p-0 rounded-3xl bg-slate-900 text-slate-100 border border-slate-700/80 max-w-3xl w-full backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm shadow-2xl m-auto"
    >
      <div className="p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="roster-modal-title" className="text-xl sm:text-2xl font-black text-white">
                Roster del Equipo (Pedido al por Mayor)
              </h2>
              <p className="text-xs text-slate-400">
                Añade los nombres, números y tallas de cada jugador para este diseño de camiseta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Discount Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-white uppercase block">
                {currentTier.label}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentTier.discountPct > 0
                  ? `¡Genial! Ahorras el ${currentTier.discountPct}% sobre el precio regular.`
                  : 'Añade 6 o más para desbloquear un 15% de descuento directo.'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Precio por camiseta</span>
            <span className="text-lg font-black text-amber-400">${unitPrice} <span className="text-xs text-slate-400">c/u</span></span>
          </div>
        </div>

        {/* Player Table List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 max-h-[380px]">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-2xl border border-slate-800"
            >
              <div className="col-span-1 text-center font-mono text-xs font-bold text-slate-500">
                #{idx + 1}
              </div>

              {/* Name */}
              <div className="col-span-4">
                <input
                  type="text"
                  placeholder="NOMBRE"
                  value={p.name}
                  onChange={(e) => updatePlayer(p.id, 'name', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Number */}
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={3}
                  placeholder="DORSAL"
                  value={p.number}
                  onChange={(e) => updatePlayer(p.id, 'number', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs text-center text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Size */}
              <div className="col-span-2">
                <select
                  value={p.size}
                  onChange={(e) => updatePlayer(p.id, 'size', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {SIZES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Capitán / Rol"
                  value={p.notes}
                  onChange={(e) => updatePlayer(p.id, 'notes', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Delete */}
              <div className="col-span-1 text-center">
                <button
                  onClick={() => removePlayer(p.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Eliminar jugador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <button
            onClick={addPlayer}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Añadir Jugador
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total ({totalCount} prendas)</span>
              <span className="text-xl font-black text-white">${totalPrice} USD</span>
            </div>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20"
            >
              <Check className="w-4 h-4" />
              Guardar Roster en el Diseño
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
