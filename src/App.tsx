import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { PanelNav } from './components/layout/PanelNav.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CartModal } from './components/common/CartModal.tsx';
import { NotificationDrawer } from './components/common/NotificationDrawer.tsx';
import { InvoiceModal } from './components/common/InvoiceModal.tsx';
import { WhatsAppButton } from './components/common/WhatsAppButton.tsx';
import { api } from './services/api.ts';
import { Order } from './types/index.ts';

// Public pages
import { Home } from './pages/public/Home.tsx';
import { ProductsPage } from './pages/public/ProductsPage.tsx';
import { ProductDetailPage } from './pages/public/ProductDetailPage.tsx';
import { ShopsPage } from './pages/public/ShopsPage.tsx';
import { HowItWorksPage } from './pages/public/HowItWorksPage.tsx';
import { CashbackInfoPage } from './pages/public/CashbackInfoPage.tsx';
import { ReferralProgramPage } from './pages/public/ReferralProgramPage.tsx';
import { LoginPage } from './pages/public/LoginPage.tsx';
import { RegisterCustomerPage } from './pages/public/RegisterCustomerPage.tsx';
import { RegisterShopkeeperPage } from './pages/public/RegisterShopkeeperPage.tsx';
import { CheckoutPage } from './pages/public/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/public/OrderConfirmationPage.tsx';
import { PolicyPages } from './pages/public/PolicyPages.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';

// Dedicated Direct Portals (for https://jkmissionnp.com/admin, /shopkeeper, /user)
import { AdminPortalPage } from './pages/portal/AdminPortalPage.tsx';
import { ShopkeeperPortalPage } from './pages/portal/ShopkeeperPortalPage.tsx';
import { UserPortalPage } from './pages/portal/UserPortalPage.tsx';
import { parseCurrentLocation, getViewUrl } from './utils/router.ts';

function MainApp() {
  const { user, role, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => parseCurrentLocation().view);
  const [viewParam, setViewParam] = useState<string | undefined>(() => parseCurrentLocation().param);

  // Modals
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  const navigateTo = (view: string, param?: string, replace = false) => {
    setCurrentView(view);
    setViewParam(param);
    try {
      const targetUrl = getViewUrl(view, param);
      if (window.location.pathname !== targetUrl) {
        if (replace) {
          window.history.replaceState(null, '', targetUrl);
        } else {
          window.history.pushState(null, '', targetUrl);
        }
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser Back and Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentLocation();
      setCurrentView(parsed.view);
      setViewParam(parsed.param);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenInvoice = async (orderId: string) => {
    try {
      const res = await api.getOrder(orderId);
      if (res.success && res.order) {
        setInvoiceModalOrder(res.order);
      }
    } catch (err) {
      alert('Could not load invoice');
    }
  };

  // Route security guard: keep sub-pages protected while allowing base portals (/admin, /shopkeeper, /user) to render
  useEffect(() => {
    if (isLoading) return;

    // Sub-pages require corresponding role; if not authenticated, redirect to base portal (/admin, /shopkeeper, /user)
    if (currentView.startsWith('admin-') && currentView !== 'admin-dashboard' && role !== 'admin') {
      navigateTo('admin-dashboard', undefined, true);
    } else if (currentView.startsWith('shopkeeper-') && currentView !== 'shopkeeper-dashboard' && role !== 'shopkeeper') {
      navigateTo('shopkeeper-dashboard', undefined, true);
    } else if (currentView.startsWith('customer-') && currentView !== 'customer-dashboard' && role !== 'customer') {
      navigateTo('customer-dashboard', undefined, true);
    } else if (user && (currentView === 'login' || currentView === 'register-customer' || currentView === 'register-shopkeeper')) {
      if (role === 'admin') navigateTo('admin-dashboard', undefined, true);
      else if (role === 'shopkeeper') navigateTo('shopkeeper-dashboard', undefined, true);
      else navigateTo('customer-dashboard', undefined, true);
    }
  }, [currentView, role, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center animate-pulse">
          JK
        </div>
        <p className="text-xs font-bold text-slate-600">Loading JK Mission...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <Home
            onNavigate={navigateTo}
            onSelectProduct={(id) => navigateTo('product-detail', id)}
          />
        );
      case 'products':
        return (
          <ProductsPage
            onSelectProduct={(id) => navigateTo('product-detail', id)}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            productId={viewParam || 'prod_1'}
            onBack={() => navigateTo('products')}
            onProceedToCheckout={() => navigateTo('checkout')}
          />
        );
      case 'shops':
        return (
          <ShopsPage
            onSelectShopProducts={(shopId) => navigateTo('products', shopId)}
          />
        );
      case 'how-it-works':
        return <HowItWorksPage onNavigate={navigateTo} />;
      case 'cashback':
        return <CashbackInfoPage onNavigate={navigateTo} />;
      case 'referral':
        return <ReferralProgramPage onNavigate={navigateTo} />;
      case 'checkout':
        return (
          <CheckoutPage
            onBack={() => navigateTo('products')}
            onOrderSuccess={(orderId) => {
              navigateTo('order-confirmation', orderId);
            }}
            onNavigateLogin={() => navigateTo('login')}
          />
        );
      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            orderId={viewParam}
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'login':
        return (
          <LoginPage
            initialRole={viewParam as 'customer' | 'shopkeeper' | 'admin' | undefined}
            onLoginSuccess={(loggedInRole) => {
              const targetRole = loggedInRole || role;
              if (targetRole === 'admin') navigateTo('admin-dashboard');
              else if (targetRole === 'shopkeeper') navigateTo('shopkeeper-dashboard');
              else navigateTo('customer-dashboard');
            }}
            onNavigateRegister={(r) =>
              navigateTo(r === 'shopkeeper' ? 'register-shopkeeper' : 'register-customer')
            }
          />
        );
      case 'register-customer':
        return (
          <RegisterCustomerPage
            initialSponsor={viewParam}
            onSuccess={() => navigateTo('customer-dashboard')}
            onNavigateLogin={() => navigateTo('login')}
          />
        );
      case 'register-shopkeeper':
        return (
          <RegisterShopkeeperPage
            onSuccess={() => navigateTo('shopkeeper-dashboard')}
            onNavigateLogin={() => navigateTo('login')}
          />
        );
      case 'policy':
        return <PolicyPages initialTab={viewParam || 'terms'} />;
      case 'contact':
        return <ContactPage />;

      // Customer / User Direct Portal (https://jkmissionnp.com/user)
      case 'customer-dashboard':
        return (
          <UserPortalPage
            subView="dashboard"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-wallets':
        return (
          <UserPortalPage
            subView="wallets"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-referrals':
        return (
          <UserPortalPage
            subView="referrals"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-orders':
        return (
          <UserPortalPage
            subView="orders"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-withdrawals':
        return (
          <UserPortalPage
            subView="withdrawals"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-coupons':
        return (
          <UserPortalPage
            subView="coupons"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );

      // Shopkeeper Direct Portal (https://jkmissionnp.com/shopkeeper)
      case 'shopkeeper-dashboard':
        return (
          <ShopkeeperPortalPage
            subView="dashboard"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'shopkeeper-products':
        return (
          <ShopkeeperPortalPage
            subView="products"
            param={viewParam}
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'shopkeeper-inventory':
        return (
          <ShopkeeperPortalPage
            subView="inventory"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'shopkeeper-orders':
        return (
          <ShopkeeperPortalPage
            subView="orders"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'shopkeeper-wallet':
        return (
          <ShopkeeperPortalPage
            subView="wallet"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );

      // Admin Direct Portal (https://jkmissionnp.com/admin)
      case 'admin-dashboard':
        return (
          <AdminPortalPage
            subView="dashboard"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-products':
        return (
          <AdminPortalPage
            subView="products"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-customers':
        return (
          <AdminPortalPage
            subView="customers"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-shopkeepers':
        return (
          <AdminPortalPage
            subView="shopkeepers"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-orders':
        return (
          <AdminPortalPage
            subView="orders"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-withdrawals':
        return (
          <AdminPortalPage
            subView="withdrawals"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-ledgers':
        return (
          <AdminPortalPage
            subView="ledgers"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-settings':
        return (
          <AdminPortalPage
            subView="settings"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-audit-logs':
        return (
          <AdminPortalPage
            subView="audit-logs"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'admin-coupons':
        return (
          <AdminPortalPage
            subView="coupons"
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );

      default:
        return (
          <Home
            onNavigate={navigateTo}
            onSelectProduct={(id) => navigateTo('product-detail', id)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-300 selection:text-slate-950">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      {/* Unified Multi-Role Panel Navigation (Customer, Shopkeeper, Admin) */}
      <PanelNav
        currentView={currentView}
        onNavigate={navigateTo}
      />

      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer onNavigate={navigateTo} currentView={currentView} />

      {/* Cart Modal */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        onProceedToCheckout={() => navigateTo('checkout')}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceModalOrder}
        onClose={() => setInvoiceModalOrder(null)}
        showAdminCommissionSnapshot={role === 'admin'}
      />

      {/* Official WhatsApp Support Floating Action Button */}
      <WhatsAppButton phoneNumber="+9779766133831" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
