import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import HybridStudioWorkspace from './components/studio/HybridStudioWorkspace';
import ProductionPayloadModal from './components/studio/ProductionPayloadModal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import QualityShowcase from './components/QualityShowcase';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ShopifyIntegrationGuide from './components/ShopifyIntegrationGuide';
import OrderQuoteModal from './components/OrderQuoteModal';
import {
  ENGINE_PRODUCTS,
  INITIAL_TEAM_ROSTER,
  createInitialMasterDesign,
  createDefaultDesignForProduct,
  generateDesignId,
} from './engine/core/designStore';

function createInitialKitSnapshot() {
  const fbJersey = createInitialMasterDesign();
  const fbShorts = createDefaultDesignForProduct('futbol_shorts_fp3', fbJersey.colorZones);
  const bkJersey = createDefaultDesignForProduct('basketball_jersey_b6_hero');
  const bkShorts = createDefaultDesignForProduct('basketball_shorts_bp6', bkJersey.colorZones);

  return {
    activeProductId: 'basketball_jersey_b6_hero',
    designsByProduct: {
      futbol_jersey_pro_vneck: fbJersey,
      futbol_shorts_fp3: fbShorts,
      basketball_jersey_b6_hero: bkJersey,
      basketball_shorts_bp6: bkShorts,
    },
  };
}

export default function App() {
  const [appMode, setAppMode] = useState('studio');

  // Historial Undo/Redo de 50 pasos con memoria independiente por prenda del kit (Camiseta ↔ Short)
  const [history, setHistory] = useState([createInitialKitSnapshot]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const currentSnapshot = history[historyIdx];
  const activeProductId = currentSnapshot.activeProductId;
  const design =
    currentSnapshot.designsByProduct[activeProductId] ||
    Object.values(currentSnapshot.designsByProduct)[0];

  const [roster, setRoster] = useState(INITIAL_TEAM_ROSTER);
  const [artworkRegistry, setArtworkRegistry] = useState({});

  const [cartItems, setCartItems] = useState([]);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShopifyGuideOpen, setIsShopifyGuideOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];

  const pushSnapshot = useCallback((updater, recordUndo = true) => {
    setHistory((prevHistory) => {
      const curIdx = Math.min(historyIdx, prevHistory.length - 1);
      const baseSnap = prevHistory[curIdx];
      const nextSnap = typeof updater === 'function' ? updater(baseSnap) : updater;

      if (!recordUndo) {
        const copy = [...prevHistory];
        copy[curIdx] = nextSnap;
        return copy;
      }
      const sliced = prevHistory.slice(0, curIdx + 1).slice(-50);
      const nextArr = [...sliced, nextSnap];
      setHistoryIdx(nextArr.length - 1);
      return nextArr;
    });
  }, [historyIdx]);

  const handleCommitDesign = useCallback(
    (nextDesign, recordUndo = true) => {
      pushSnapshot((snap) => {
        const pid = nextDesign.productModelId || snap.activeProductId;
        return {
          activeProductId: pid,
          designsByProduct: {
            ...snap.designsByProduct,
            [pid]: nextDesign,
          },
        };
      }, recordUndo);
    },
    [pushSnapshot]
  );

  const handleSwitchProduct = useCallback(
    (targetProductId) => {
      pushSnapshot((snap) => {
        const curDesign = snap.designsByProduct[snap.activeProductId];
        const existing = snap.designsByProduct[targetProductId];
        const resolved =
          existing || createDefaultDesignForProduct(targetProductId, curDesign?.colorZones || null);
        return {
          activeProductId: targetProductId,
          designsByProduct: {
            ...snap.designsByProduct,
            [targetProductId]: resolved,
          },
        };
      }, true);
    },
    [pushSnapshot]
  );

  const handleSyncPairedColors = useCallback(() => {
    const pairedId = currentProduct.pairedProductId;
    if (!pairedId) return;
    pushSnapshot((snap) => {
      const sourceDesign = snap.designsByProduct[snap.activeProductId];
      const targetExisting =
        snap.designsByProduct[pairedId] ||
        createDefaultDesignForProduct(pairedId, sourceDesign?.colorZones);
      return {
        ...snap,
        designsByProduct: {
          ...snap.designsByProduct,
          [pairedId]: {
            ...targetExisting,
            colorZones: JSON.parse(JSON.stringify(sourceDesign.colorZones)),
          },
        },
      };
    }, true);
  }, [currentProduct.pairedProductId, pushSnapshot]);

  const handleUndo = useCallback(() => {
    setHistoryIdx((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryIdx((idx) => (idx < history.length - 1 ? idx + 1 : idx));
  }, [history.length]);

  // Atajos globales de teclado Ctrl+Z / Ctrl+Y idénticos a Owayo
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleRegisterArtwork = (artworkId, assetData) => {
    setArtworkRegistry((prev) => ({ ...prev, [artworkId]: assetData }));
  };

  const handleConfirmAddToCart = (bundle) => {
    const newItem = {
      cartId: `item_${Date.now()}`,
      product: {
        id: currentProduct.id,
        name: currentProduct.name,
        type: currentProduct.renderMode,
        description: `${bundle.pricing.totalUnits} prendas vinculadas a ${design.designId}`,
      },
      design: {
        baseColor: design.colorZones.primary?.hex,
        sleeveColor: design.colorZones.sleeves?.hex,
        pattern: design.patternId,
        playerName: roster[0]?.name || 'EQUIPO',
        playerNumber: roster[0]?.number || '10',
        sponsorText: (design.decals || []).find((d) => d.type === 'STATIC_TEXT')?.text || '',
      },
      roster: roster.map((r, i) => ({
        id: r.id || i,
        name: r.name,
        number: r.number,
        size: `${r.size} (${r.cut}) x${r.qty}`,
      })),
      unitPrice: bundle.pricing.unitPrice.toFixed(2),
      totalPrice: bundle.pricing.totalOrderPrice.toFixed(2),
    };

    setCartItems((prev) => [...prev, newItem]);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } });

    handleCommitDesign({ ...design, designId: generateDesignId() }, true);
    setIsCartOpen(true);
  };

  const handleSelectCatalogProduct = (catalogProd) => {
    const mapTypeToEngineId = {
      jersey: 'futbol_jersey_pro_vneck',
      basket: 'basketball_jersey_b6_hero',
      hoodie: 'futbol_shorts_fp3',
      cap: 'cap_snapback_6panel',
      bottle: 'bottle_inox_laser_750',
      shinguards: 'shinguards_carbon_pro',
    };
    const targetId = mapTypeToEngineId[catalogProd.type] || 'futbol_jersey_pro_vneck';
    handleSwitchProduct(targetId);
    setAppMode('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {appMode === 'studio' ? (
        <HybridStudioWorkspace
          design={design}
          designsByProduct={currentSnapshot.designsByProduct}
          onSwitchProduct={handleSwitchProduct}
          onSyncPairedColors={handleSyncPairedColors}
          onCommitDesign={handleCommitDesign}
          canUndo={historyIdx > 0}
          canRedo={historyIdx < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          roster={roster}
          onUpdateRoster={setRoster}
          artworkRegistry={artworkRegistry}
          onRegisterArtwork={handleRegisterArtwork}
          onOpenProductionModal={() => setIsProductionModalOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.length}
          onSwitchToStorefront={() => setAppMode('storefront')}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenShopifyGuide={() => setIsShopifyGuideOpen(true)}
            onOpenRosterModal={() => setAppMode('studio')}
          />
          <main className="flex-1">
            <Hero onStartDesigning={() => setAppMode('studio')} />
            <ProductCatalog onSelectProduct={handleSelectCatalogProduct} />
            <QualityShowcase />
          </main>
          <Footer onOpenShopifyGuide={() => setIsShopifyGuideOpen(true)} />
        </div>
      )}

      <ProductionPayloadModal
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
        design={design}
        product={currentProduct}
        roster={roster}
        onConfirmAddToCart={handleConfirmAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((x) => x.cartId !== id))}
        onOpenQuoteModal={() => {
          setIsCartOpen(false);
          setIsQuoteModalOpen(true);
        }}
      />

      <ShopifyIntegrationGuide
        isOpen={isShopifyGuideOpen}
        onClose={() => setIsShopifyGuideOpen(false)}
      />

      <OrderQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        items={cartItems}
      />
    </div>
  );
}
