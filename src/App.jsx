import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { MainShowcase } from './components/home/MainShowcase';
import { TacticalGuarantees } from './components/home/TacticalGuarantees';
import { CommunityDropBanner } from './components/home/CommunityDropBanner';
import { CategoryPage } from './components/CategoryPage';
import { ProductPage } from './components/ProductPage';
import { GuaranteesPage } from './components/GuaranteesPage';
import { HelpPage } from './components/HelpPage';
import { RulesPage } from './components/RulesPage';
import { InstructionsPage } from './components/InstructionsPage';
import { NfaWarrantyPage } from './components/NfaWarrantyPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { ReviewsPage } from './components/ReviewsPage';
import { CryptoPayModal } from './components/CryptoPayModal';
import { WarrantyModal } from './components/WarrantyModal';
import { IntroSplash } from './components/IntroSplash';
import { BrowserShield } from './components/BrowserShield';
import { AuthModal } from './components/AuthModal';
import { UserCabinetModal } from './components/UserCabinetModal';
import { AdminPage } from './components/AdminPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { syncLiveStockFromSupplier } from './utils/stockSync';
import { PRODUCTS } from './data/mockData';

function AppContent() {
  const { user, verifyEmail } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState('cs2nfa');
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyingProduct, setBuyingProduct] = useState(null);

  // Warranty modal state
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [warrantyInitialToken, setWarrantyInitialToken] = useState('');

  // Splash Intro State (Cinematic Vector Logo Animation)
  const [showIntro, setShowIntro] = useState(true);

  // Auth & Cabinet modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);

  // Live stock and dynamic profit margin sync on mount & periodic polling (every 45s)
  useEffect(() => {
    syncLiveStockFromSupplier();
    const interval = setInterval(() => {
      syncLiveStockFromSupplier();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize hash route, pathname (/admin) and query params
  useEffect(() => {
    const handleHashAndParams = () => {
      try {
        const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
        if (pathname === '/admin') {
          setCurrentRoute('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const fullHash = window.location.hash.replace('#', '');
        let [routePart, queryPart] = fullHash.split('?');
        if (!routePart) routePart = '';

        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(queryPart || '');

        const token = hashParams.get('token') || hashParams.get('warranty') || searchParams.get('token') || searchParams.get('warranty');
        if (token && routePart !== 'nfa-warranty') {
          setWarrantyInitialToken(token);
          setIsWarrantyOpen(true);
        } else {
          setIsWarrantyOpen(false);
        }

        const verifyToken = searchParams.get('verify') || hashParams.get('verify');
        if (verifyToken) {
          verifyEmail(verifyToken);
          setIsCabinetOpen(true);
        }

        if (routePart.startsWith('category/')) {
          const cat = routePart.replace('category/', '');
          setSelectedCategoryId(cat);
          setCurrentRoute('category');
        } else if (routePart.startsWith('product/')) {
          const pId = routePart.replace('product/', '');
          const found = PRODUCTS.find((p) => p.id === pId);
          if (found) {
            setSelectedProduct(found);
            setCurrentRoute('product');
          }
        } else if (['catalog', 'guarantees', 'help', 'rules', 'instructions', 'extra', 'nfa-warranty', 'privacy', 'info', 'reviews'].includes(routePart)) {
          if (routePart === 'extra') setCurrentRoute('instructions');
          else if (routePart === 'info') setCurrentRoute('privacy');
          else setCurrentRoute(routePart);
        } else {
          setCurrentRoute('home');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {}
    };

    handleHashAndParams();
    window.addEventListener('hashchange', handleHashAndParams);
    window.addEventListener('popstate', handleHashAndParams);
    return () => {
      window.removeEventListener('hashchange', handleHashAndParams);
      window.removeEventListener('popstate', handleHashAndParams);
    };
  }, [verifyEmail]);

  const navigate = (route) => {
    setCurrentRoute(route);
    if (route === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
      window.location.hash = route === 'home' ? '' : route;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
    setCurrentRoute('category');
    window.location.hash = `category/${catId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    let target = product;
    if (typeof product === 'string') {
      target = PRODUCTS.find((p) => p.id === product) || PRODUCTS[0];
    } else if (product && product.id) {
      target = PRODUCTS.find((p) => p.id === product.id) || product;
    }
    setSelectedProduct(target);
    setCurrentRoute('product');
    window.location.hash = `product/${target.id || 'cs2-1'}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBuyModal = (product) => {
    setBuyingProduct(product);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0E0D0C] text-[#F3F1EC]">
      {/* 🎬 Кинематографичный сплэш-интро SHARPBUY */}
      {showIntro && <IntroSplash onFinish={() => setShowIntro(false)} />}

      {/* Сквозной Header с переключателем валют и авторизацией */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCabinet={() => setIsCabinetOpen(true)}
        onOpenWarranty={(tok) => {
          setWarrantyInitialToken(tok || '');
          setIsWarrantyOpen(true);
        }}
      />

      {/* Основной контент */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <>
            <Hero onNavigate={navigate} />
            <MainShowcase
              onSelectProduct={handleSelectProduct}
              onNavigate={navigate}
              onSelectCategory={handleSelectCategory}
            />
            <TacticalGuarantees onNavigate={navigate} />
            <CommunityDropBanner />
          </>
        )}

        {(currentRoute === 'catalog' || currentRoute === 'category') && (
          <CategoryPage
            categoryId={currentRoute === 'catalog' ? 'all' : selectedCategoryId}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
            onBuy={handleOpenBuyModal}
          />
        )}

        {currentRoute === 'product' && (
          <ProductPage
            product={selectedProduct}
            onNavigate={navigate}
            onBuy={handleOpenBuyModal}
          />
        )}

        {currentRoute === 'guarantees' && (
          <GuaranteesPage onNavigate={navigate} />
        )}

        {currentRoute === 'reviews' && (
          <ReviewsPage onNavigate={navigate} />
        )}

        {currentRoute === 'help' && (
          <HelpPage onNavigate={navigate} />
        )}

        {currentRoute === 'rules' && (
          <RulesPage onNavigate={navigate} />
        )}

        {currentRoute === 'instructions' && (
          <InstructionsPage onNavigate={navigate} />
        )}

        {currentRoute === 'nfa-warranty' && (
          <NfaWarrantyPage onNavigate={navigate} />
        )}

        {currentRoute === 'privacy' && (
          <PrivacyPolicyPage onNavigate={navigate} />
        )}

        {currentRoute === 'admin' && (
          <AdminPage onNavigate={navigate} onOpenAuth={() => setIsAuthOpen(true)} />
        )}
      </main>

      {/* Сквозной Footer */}
      <Footer 
        onNavigate={navigate} 
        onOpenWarranty={(tok) => {
          setWarrantyInitialToken(tok || '');
          setIsWarrantyOpen(true);
        }}
      />

      {/* Окно быстрой крипто-покупки */}
      <CryptoPayModal
        product={buyingProduct}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />

      {/* Окно Авторизации & Регистрации */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenCabinet={() => setIsCabinetOpen(true)}
      />

      {/* Личный кабинет пользователя (История заказов, Токены, Баланс) */}
      <UserCabinetModal
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
      />

      {/* 🛡️ Окно Автоматической Гарантии и Замен */}
      <WarrantyModal
        isOpen={isWarrantyOpen}
        onClose={() => {
          setIsWarrantyOpen(false);
          setWarrantyInitialToken('');
        }}
        initialToken={warrantyInitialToken}
      />
    </div>
  );
}

export function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;
