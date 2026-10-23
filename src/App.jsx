import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CustomizerStudio from './components/CustomizerStudio';
import ProductCatalog from './components/ProductCatalog';
import QualityShowcase from './components/QualityShowcase';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import TeamRosterModal from './components/TeamRosterModal';
import ShopifyIntegrationGuide from './components/ShopifyIntegrationGuide';
import OrderQuoteModal from './components/OrderQuoteModal';
import { PRODUCTS_CATALOG } from './data/mockData';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS_CATALOG[0]);
  const [design, setDesign] = useState({
    baseColor: '#1d4ed8',
    sleeveColor: '#0f172a',
    collarColor: '#ffffff',
    detailColor: '#facc15',
    pattern: 'stripes-vertical',
    fontStyle: 'font-bebas',
    textColor: '#ffffff',
    textOutlineColor: '#0f172a',
    playerName: 'RODRÍGUEZ',
    playerNumber: '10',
    sponsorText: 'FLY EMIRATES',
    hasSponsor: true,
    badgeSvg: null,
    badgeImage: null,
    collarType: 'v-neck',
    teamRoster: [
      { id: 1, name: 'CARLOS R.', number: '10', size: 'L', notes: 'Capitán' },
      { id: 2, name: 'MATEO V.', number: '7', size: 'M', notes: 'Delantero' },
      { id: 3, name: 'SANTIAGO G.', number: '9', size: 'XL', notes: 'Delantero' },
      { id: 4, name: 'ANDRÉS M.', number: '1', size: 'L', notes: 'Portero' },
      { id: 5, name: 'DANIEL P.', number: '5', size: 'M', notes: 'Defensa' }
    ]
  });

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isShopifyGuideOpen, setIsShopifyGuideOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Add customized item to cart
  const handleAddToCart = (customDesign, product, unitPrice, totalPrice) => {
    const newItem = {
      cartId: `item_${Date.now()}`,
      product: product,
      design: { ...customDesign },
      roster: customDesign.teamRoster ? [...customDesign.teamRoster] : null,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };

    setCartItems([...cartItems, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveItem = (cartId) => {
    setCartItems(cartItems.filter(item => item.cartId !== cartId));
  };

  const handleSaveRoster = (newRoster) => {
    setDesign({
      ...design,
      teamRoster: newRoster,
      playerName: newRoster[0]?.name || design.playerName,
      playerNumber: newRoster[0]?.number || design.playerNumber
    });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleStartDesigning = () => {
    const studioEl = document.getElementById('customizer-studio');
    studioEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenShopifyGuide={() => setIsShopifyGuideOpen(true)}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero onStartDesigning={handleStartDesigning} />

        {/* Live Interactive Customizer Studio */}
        <CustomizerStudio
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          design={design}
          onDesignChange={setDesign}
          onAddToCart={handleAddToCart}
          onOpenRosterModal={() => setIsRosterModalOpen(true)}
        />

        {/* Catalog of Sports Products */}
        <ProductCatalog onSelectProduct={handleSelectProduct} />

        {/* Fabric & Manufacturing Quality */}
        <QualityShowcase />
      </main>

      {/* Footer */}
      <Footer onOpenShopifyGuide={() => setIsShopifyGuideOpen(true)} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveItem}
        onOpenQuoteModal={() => {
          setIsCartOpen(false);
          setIsQuoteModalOpen(true);
        }}
      />

      {/* Team Roster Bulk Builder Modal */}
      <TeamRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        initialRoster={design.teamRoster}
        basePrice={selectedProduct.basePrice}
        onSaveRoster={handleSaveRoster}
      />

      {/* Shopify Integration Guide Modal */}
      <ShopifyIntegrationGuide
        isOpen={isShopifyGuideOpen}
        onClose={() => setIsShopifyGuideOpen(false)}
      />

      {/* Order Quote / Production Spec Sheet Modal */}
      <OrderQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        items={cartItems.length > 0 ? cartItems : [{
          product: selectedProduct,
          design: design,
          roster: design.teamRoster,
          unitPrice: selectedProduct.basePrice,
          totalPrice: (selectedProduct.basePrice * (design.teamRoster?.length || 1)).toFixed(2)
        }]}
      />
    </div>
  );
}
