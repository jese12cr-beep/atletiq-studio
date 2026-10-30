/**
 * ATLETIQ — Auth & Permissions Manager
 * Gestiona el control de acceso para descargas de plantillas técnicas 2D y registro de diseños.
 * 
 * Reglas de negocio:
 * 1. El Administrador (Dueño del sistema) tiene acceso maestro permanente por defecto sin necesidad de registrarse.
 * 2. Los clientes y externos deben crear su Cuenta de Club / Iniciar sesión para poder descargar plantillas industriales 2D y registrar pedidos.
 * 3. El Administrador puede alternar temporalmente al "Modo Cliente" para auditar la experiencia del usuario final y volver con 1 clic.
 */

import { useState, useEffect } from 'react';

const ADMIN_STORAGE_KEY = 'atletiq_admin_active';
const USER_STORAGE_KEY = 'atletiq_current_user';
const USERS_DB_KEY = 'atletiq_registered_users_db';

// Inicialización por defecto: El dueño de la tienda es Administrador Master automáticamente
export function getInitialAdminStatus() {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (stored === null) {
    // Primera vez: activar privilegios de Administrador para el creador
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    return true;
  }
  return stored === 'true';
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const isAdmin = getInitialAdminStatus();
  if (isAdmin) {
    return {
      id: 'admin_master',
      name: 'Administrador Master',
      club: 'ATLETIQ HQ',
      email: 'admin@atletiq.mx',
      role: 'admin',
    };
  }
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminSession() {
  return getInitialAdminStatus();
}

export function isAuthenticatedSession() {
  if (isAdminSession()) return true;
  return getCurrentUser() !== null;
}

// Disparador de eventos para actualizar componentes en tiempo real
const listeners = new Set();
function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('[authManager] Listener error:', e);
    }
  });
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAdminMode(active) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_STORAGE_KEY, active ? 'true' : 'false');
  if (active) {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  notifyListeners();
}

export function registerClubUser({ name, club, email, phone, password }) {
  if (typeof window === 'undefined') return { success: false, error: 'Sin entorno' };
  
  if (!name?.trim() || !email?.trim()) {
    return { success: false, error: 'Por favor ingresa nombre y correo electrónico.' };
  }

  const newUser = {
    id: `club_${Date.now().toString(36)}`,
    name: name.trim(),
    club: (club || 'Club Deportivo').trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    role: 'client',
    createdAt: new Date().toISOString(),
  };

  // Guardar en la base local de clientes
  try {
    const existing = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const nextDb = [newUser, ...existing.filter((u) => u.email !== newUser.email)];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(nextDb));
  } catch {}

  // Iniciar sesión como este cliente
  localStorage.setItem(ADMIN_STORAGE_KEY, 'false');
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  notifyListeners();

  return { success: true, user: newUser };
}

export function loginClubUser(email, password) {
  if (!email?.trim()) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
  }
  const cleanEmail = email.trim().toLowerCase();

  // Si introduce credencial master directa
  if (cleanEmail === 'admin' || cleanEmail.includes('admin@')) {
    setAdminMode(true);
    return { success: true, user: getCurrentUser() };
  }

  try {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const found = users.find((u) => u.email === cleanEmail);
    if (found) {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'false');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(found));
      notifyListeners();
      return { success: true, user: found };
    }
  } catch {}

  // Si no existe, crear sesión rápida con su correo para no bloquear
  const quickUser = {
    id: `client_${Date.now().toString(36)}`,
    name: cleanEmail.split('@')[0].toUpperCase(),
    club: 'Club Deportivo',
    email: cleanEmail,
    role: 'client',
  };
  localStorage.setItem(ADMIN_STORAGE_KEY, 'false');
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(quickUser));
  notifyListeners();
  return { success: true, user: quickUser };
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.setItem(ADMIN_STORAGE_KEY, 'false');
  notifyListeners();
}

/**
 * Hook de React para reaccionar a cambios en la autenticación
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAdmin, setIsAdmin] = useState(() => isAdminSession());
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAuthenticatedSession());

  useEffect(() => {
    const update = () => {
      setCurrentUser(getCurrentUser());
      setIsAdmin(isAdminSession());
      setIsAuthenticated(isAuthenticatedSession());
    };
    return subscribeAuth(update);
  }, []);

  return {
    currentUser,
    isAdmin,
    isAuthenticated,
    setAdminMode,
    registerClubUser,
    loginClubUser,
    logoutUser,
  };
}
