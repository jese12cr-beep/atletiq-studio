import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import HybridStudioWorkspace from './components/studio/HybridStudioWorkspace';
import ProductionPayloadModal from './components/studio/ProductionPayloadModal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProductCatalog from './components/ProductCatalog';
import SizeGuideAndSamples from './components/SizeGuideAndSamples';
import AthleteProof from './components/AthleteProof';
import FaqSection from './components/FaqSection';
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
  const fbShorts = createDefaultDesignForProduct('football_shorts_fp3', fbJersey.colorZones);
  const bkJersey = createDefaultDesignForProduct('basketball_b6_hero');
  const bkShorts = createDefaultDesignForProduct('basketball_shorts_bp6', bkJersey.colorZones);
  const bkWJersey = createDefaultDesignForProduct('basketball_b7w_epic_women');
  const bkWShorts = createDefaultDesignForProduct('basketball_shorts_bp7w_women', bkWJersey.colorZones);
  const jktMen = createDefaultDesignForProduct('jacket_softshell_601m_men');
  const jktWomen = createDefaultDesignForProduct('jacket_softshell_601w_women', jktMen.colorZones);

  return {
    activeProductId: 'futbol_jersey_pro_vneck',
    designsByProduct: {
      futbol_jersey_pro_vneck: fbJersey,
      football_shorts_fp3: fbShorts,
      basketball_b6_hero: bkJersey,
      basketball_shorts_bp6: bkShorts,
      basketball_b7w_epic_women: bkWJersey,
      basketball_shorts_bp7w_women: bkWShorts,
      jacket_softshell_601m_men: jktMen,
      jacket_softshell_601w_women: jktWomen,
    },
  };
}

export default function App() {
  const [appMode, setAppMode] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#studio') {
      return 'studio';
    }
    return 'storefront';
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#studio') {
        setAppMode('studio');
      } else if (window.location.hash === '#storefront' || window.location.hash === '') {
        setAppMode('storefront');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const switchMode = useCallback((mode) => {
    setAppMode(mode);
    if (typeof window !== 'undefined') {
      window.location.hash = mode === 'studio' ? '#studio' : '';
    }
  }, []);

  // Historial Undo/Redo de 50 pasos atómico con memoria independiente por prenda del kit
  const [{ history, historyIdx }, setHistoryState] = useState(() => ({
    history: [createInitialKitSnapshot()],
    historyIdx: 0,
  }));

  const currentSnapshot = history[historyIdx] || history[0];
  const activeProductId = currentSnapshot?.activeProductId || 'futbol_jersey_pro_vneck';
  const design =
    currentSnapshot?.designsByProduct?.[activeProductId] ||
    (currentSnapshot?.designsByProduct
      ? Object.values(currentSnapshot.designsByProduct)[0]
      : createInitialMasterDesign());

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
    setHistoryState((prev) => {
      const curIdx = Math.min(prev.historyIdx, prev.history.length - 1);
      const baseSnap = prev.history[curIdx];
      const nextSnap = typeof updater === 'function' ? updater(baseSnap) : updater;

      if (!recordUndo) {
        const copy = [...prev.history];
        copy[curIdx] = nextSnap;
        return { ...prev, history: copy };
      }
      const sliced = prev.history.slice(0, curIdx + 1).slice(-50);
      const nextArr = [...sliced, nextSnap];
      return {
        history: nextArr,
        historyIdx: nextArr.length - 1,
      };
    });
  }, []);

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
    setHistoryState((prev) => ({
      ...prev,
      historyIdx: Math.max(0, prev.historyIdx - 1),
    }));
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => ({
      ...prev,
      historyIdx: Math.min(prev.history.length - 1, prev.historyIdx + 1),
    }));
  }, []);

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

  const handleSelectCatalogProduct = (engineId) => {
    handleSwitchProduct(engineId);
    setAppMode('studio');
  };

  const handleLaunch3DStudioFromKitLab = (engineId, kitData) => {
    handleSwitchProduct(engineId);
    if (kitData) {
      pushSnapshot((snap) => {
        const curDesign = snap.designsByProduct[engineId];
        if (!curDesign) return snap;
        const updatedZones = { ...curDesign.colorZones };
        if (kitData.primaryColor && updatedZones.primary) {
          updatedZones.primary = { ...updatedZones.primary, hex: kitData.primaryColor };
        }
        if (kitData.accentColor && updatedZones.accent) {
          updatedZones.accent = { ...updatedZones.accent, hex: kitData.accentColor };
        }
        return {
          ...snap,
          activeProductId: engineId,
          designsByProduct: {
            ...snap.designsByProduct,
            [engineId]: {
              ...curDesign,
              colorZones: updatedZones,
            },
          },
        };
      }, true);
    }
    switchMode('studio');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
          onSwitchToStorefront={() => switchMode('storefront')}
        />
      ) : (
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Navbar
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenStudio={() => switchMode('studio')}
            onOpenShopifyGuide={() => setIsShopifyGuideOpen(true)}
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          />
          <main className="flex-1 w-full">
            <Hero
              onStartDesigning={(productId) => {
                if (productId) {
                  handleSelectCatalogProduct(productId);
                } else {
                  switchMode('studio');
                }
              }}
            />
            <ProductCatalog
              onSelectProduct={handleSelectCatalogProduct}
              onOpenQuote={() => setIsQuoteModalOpen(true)}
            />
            <HowItWorks
              onOpenStudio={() => switchMode('studio')}
              onOpenQuote={() => setIsQuoteModalOpen(true)}
            />
            <SizeGuideAndSamples />
            <AthleteProof />
            <FaqSection />
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
