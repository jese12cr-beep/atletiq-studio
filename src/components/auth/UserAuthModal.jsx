import React, { useState } from 'react';
import { Shield, UserPlus, LogIn, Lock, CheckCircle2, Building, Mail, Phone, KeyRound, Sparkles } from 'lucide-react';
import { registerClubUser, loginClubUser, setAdminMode, useAuth } from '../../engine/auth/authManager';

/**
 * ATLETIQ — UserAuthModal
 * Modal de registro / inicio de sesión para clientes externos antes de descargar
 * plantillas de patronaje 2D o registrar equipaciones en el sistema.
 * 
 * Incluye acceso rápido de Administrador para que el dueño nunca quede bloqueado.
 */
export default function UserAuthModal({ isOpen, onClose, onSuccess, actionLabel = 'descargar la plantilla' }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [formData, setFormData] = useState({
    name: '',
    club: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Por favor completa tu nombre y correo electrónico.');
      return;
    }
    const res = registerClubUser(formData);
    if (!res.success) {
      setErrorMsg(res.error || 'Error al crear la cuenta.');
      return;
    }
    setSuccessMsg(`¡Cuenta de Club registrada con éxito!`);
    setTimeout(() => {
      onSuccess?.(res.user);
      onClose();
    }, 600);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }
    const res = loginClubUser(formData.email, formData.password);
    if (!res.success) {
      setErrorMsg(res.error || 'Error al iniciar sesión.');
      return;
    }
    setSuccessMsg('¡Sesión iniciada con éxito!');
    setTimeout(() => {
      onSuccess?.(res.user);
      onClose();
    }, 600);
  };

  const handleAdminBypass = () => {
    setAdminMode(true);
    setSuccessMsg('🛡️ Modo Administrador activado. Acceso total concedido.');
    setTimeout(() => {
      onSuccess?.({ role: 'admin' });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header con identidad ATLETIQ */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-white uppercase">
                  Acceso Exclusivo de Club
                </h3>
                <p className="text-xs text-slate-400">
                  Registra tu club para {actionLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pestañas Registrar / Iniciar Sesión */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Cuenta de Club</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Contenido del Formulario */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-shake">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Nombre y Apellidos *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="ej. Carlos Mendoza"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Nombre del Club o Escuela Deportiva
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="club"
                    placeholder="ej. Halcones FC / Academia Dragones"
                    value={formData.club}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="correo@tuclub.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                    WhatsApp / Teléfono
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="55 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar Cuenta y Continuar</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="correo@tuclub.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión de Club</span>
              </button>
            </form>
          )}

          {/* Separador y Acceso Rápido del Administrador */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900">
                    ¿Eres el Administrador de ATLETIQ?
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Acceso con credencial maestra sin registro
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdminBypass}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Acceso Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
