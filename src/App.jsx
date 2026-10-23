import React, { useState } from 'react';
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
  generateDesignId,
} from './engine/core/designStore';

export default function App() {
  // 'studio' abre directamente el nuevo Motor Híbrido v3.0 Fullscreen; 'storefront' muestra la vitrina comercial
  const [appMode, setAppMode] = useState('studio');

  // Historial Undo/Redo del Documento Maestro de Diseño
  const [history, setHistory] = useState([createInitialMasterDesign()]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const design = history[historyIdx];

  const [roster, setRoster] = useState(INITIAL_TEAM_ROSTER);
  const [artworkRegistry, setArtworkRegistry] = useState({});

  const [cartItems, setCartItems] = useState([]);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShopifyGuideOpen, setIsShopifyGuideOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];

  const handleCommitDesign = (nextDesign, recordUndo = true) => {
    if (!recordUndo) {
      const copy = [...history];
      copy[historyIdx] = nextDesign;
      setHistory(copy);
      return;
    }
    const sliced = history.slice(0, historyIdx + 1).slice(-25);
    setHistory([...sliced, nextDesign]);
    setHistoryIdx(sliced.length);
  };

  const handleUndo = () => {
    if (historyIdx > 0) setHistoryIdx(historyIdx - 1);
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) setHistoryIdx(historyIdx + 1);
  };

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

    // Generar nuevo designId limpio si el usuario desea crear otro lote distinto
    handleCommitDesign({ ...design, designId: generateDesignId() }, true);
    setIsCartOpen(true);
  };

  // Mapear selección desde el catálogo de la Vitrina al Motor v3
  const handleSelectCatalogProduct = (catalogProd) => {
    const mapTypeToEngineId = {
      jersey: 'futbol_jersey_pro_vneck',
      basket: 'esports_pro_jersey',
      hoodie: 'cycling_aero_maillot',
      cap: 'cap_snapback_6panel',
      bottle: 'bottle_inox_laser_750',
      shinguards: 'shinguards_carbon_pro',
    };
    const targetId = mapTypeToEngineId[catalogProd.type] || 'futbol_jersey_pro_vneck';
    handleCommitDesign({ ...design, productModelId: targetId }, true);
    setAppMode('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {appMode === 'studio' ? (
        <HybridStudioWorkspace
          design={design}
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

      {/* Inspector Zakeke Print-Ready + Payload Shopify */}
      <ProductionPayloadModal
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
        design={design}
        product={currentProduct}
        roster={roster}
        onConfirmAddToCart={handleConfirmAddToCart}
      />

      {/* Carrito */}
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
