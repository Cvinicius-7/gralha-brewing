import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeVariantBotanicalLabel from './components/home-variants/HomeVariantBotanicalLabel';
import CatalogPage from './components/CatalogPage';
import QuickCartDrawer from './components/QuickCartDrawer';
import AgeGateModal from './components/AgeGateModal';
import Footer from './components/Footer';

export default function App() {
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('gralha_age_verified') === 'true';
  });

  // 'brand' = Página 1 (Home Oficial — Variação 2 Aprovada)
  // 'catalog' = Página 2 (Catálogo de Cervejas & Loja Online)
  const [activePage, setActivePage] = useState('brand');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleConfirmAge = () => {
    localStorage.setItem('gralha_age_verified', 'true');
    setAgeVerified(true);
  };

  const handleResetAgeGate = () => {
    localStorage.removeItem('gralha_age_verified');
    setAgeVerified(false);
  };

  const handleGoToCatalog = () => {
    setActivePage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          style: product.style,
          price: product.price,
          image: product.image || '/logos/voo-rasante.jpg',
          qty: 1,
        },
      ];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#111315] text-[#F4F1EA]">
      <AgeGateModal
        isOpen={!ageVerified}
        onConfirm={handleConfirmAge}
      />

      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        cartCount={totalItemsCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-grow">
        {activePage === 'brand' ? (
          <HomeVariantBotanicalLabel
            onGoToCatalog={handleGoToCatalog}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCartOpen(true)}
          />
        ) : (
          <CatalogPage
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onOpenCart={() => setCartOpen(true)}
            onClearCart={handleClearCart}
            checkoutOpen={checkoutOpen}
            setCheckoutOpen={setCheckoutOpen}
          />
        )}
      </main>

      <Footer
        onResetAgeGate={handleResetAgeGate}
        onNavigate={setActivePage}
      />

      <QuickCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setActivePage('catalog');
          setCheckoutOpen(true);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 80);
        }}
      />
    </div>
  );
}
