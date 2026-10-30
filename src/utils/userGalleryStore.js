/**
 * ATLETIQ SPORTS ATELIER — User Design Gallery Storage Engine
 * Gestiona el almacenamiento local persistente de creaciones deportivas del usuario.
 */

const STORAGE_KEY = 'atletiq_user_gallery_v1';

export function loadUserGallery() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error al cargar la galería de diseños:', err);
    return [];
  }
}

export function saveDesignToGallery({
  name,
  design,
  productModelId,
  productName,
  category = 'futbol',
  roster = [],
  unitPrice = 34,
  totalUnits = 1,
  totalPrice = 34,
  thumbnail = null,
}) {
  if (typeof window === 'undefined') return null;

  try {
    const existing = loadUserGallery();
    const newEntry = {
      id: `kit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name?.trim() || `Equipación ${productName || 'Personalizada'}`,
      savedAt: new Date().toISOString(),
      productModelId: productModelId || design?.productModelId || 'futbol_jersey_pro_vneck',
      productName: productName || 'Camiseta Competición',
      category: category,
      design: JSON.parse(JSON.stringify(design)),
      roster: JSON.parse(JSON.stringify(roster)),
      unitPrice: Number(unitPrice) || 34,
      totalUnits: Number(totalUnits) || (roster?.length || 1),
      totalPrice: Number(totalPrice) || 34,
      thumbnail: thumbnail || null,
      colorPalette: [
        design?.colorZones?.primary?.hex || '#ffffff',
        design?.colorZones?.secondary?.hex || '#000000',
        design?.colorZones?.accents?.hex || '#facc15',
      ].filter(Boolean),
    };

    const updated = [newEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('atletiq_gallery_updated', { detail: updated }));
    return newEntry;
  } catch (err) {
    console.error('Error al guardar diseño en la galería:', err);
    return null;
  }
}

export function deleteDesignFromGallery(designId) {
  if (typeof window === 'undefined') return false;
  try {
    const existing = loadUserGallery();
    const updated = existing.filter((item) => item.id !== designId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('atletiq_gallery_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.error('Error al eliminar diseño de la galería:', err);
    return false;
  }
}

export function duplicateDesignInGallery(designId) {
  if (typeof window === 'undefined') return null;
  try {
    const existing = loadUserGallery();
    const target = existing.find((item) => item.id === designId);
    if (!target) return null;

    const cloned = {
      ...JSON.parse(JSON.stringify(target)),
      id: `kit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: `${target.name} (Copia)`,
      savedAt: new Date().toISOString(),
    };

    const updated = [cloned, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('atletiq_gallery_updated', { detail: updated }));
    return cloned;
  } catch (err) {
    console.error('Error al duplicar diseño en la galería:', err);
    return null;
  }
}
