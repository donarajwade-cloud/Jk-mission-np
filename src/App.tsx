import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { PanelNav } from './components/layout/PanelNav.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CartModal } from './components/common/CartModal.tsx';
import { NotificationDrawer } from './components/common/NotificationDrawer.tsx';
import { InvoiceModal } from './components/common/InvoiceModal.tsx';
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
import { PolicyPages } from './pages/public/PolicyPages.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';

// Customer pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard.tsx';
import { CustomerWallets } from './pages/customer/CustomerWallets.tsx';
import { CustomerReferrals } from './pages/customer/CustomerReferrals.tsx';
import { CustomerOrders } from './pages/customer/CustomerOrders.tsx';
import { CustomerWithdrawals } from './pages/customer/CustomerWithdrawals.tsx';

// Shopkeeper pages
import { ShopkeeperDashboard } from './pages/shopkeeper/ShopkeeperDashboard.tsx';
import { ShopkeeperProducts } from './pages/shopkeeper/ShopkeeperProducts.tsx';
import { ShopkeeperInventory } from './pages/shopkeeper/ShopkeeperInventory.tsx';
import { ShopkeeperOrders } from './pages/shopkeeper/ShopkeeperOrders.tsx';
import { ShopkeeperWallet } from './pages/shopkeeper/ShopkeeperWallet.tsx';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminProducts } from './pages/admin/AdminProducts.tsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.tsx';
import { AdminShopkeepers } from './pages/admin/AdminShopkeepers.tsx';
import { AdminOrders } from './pages/admin/AdminOrders.tsx';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals.tsx';
import { AdminLedgers } from './pages/admin/AdminLedgers.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.tsx';

function MainApp() {
  const { user, role, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Modals
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  const navigateTo = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Route security guard: enforce RBAC strictly & redirect logged in users from auth forms
  useEffect(() => {
    if (isLoading) return;

    if (currentView.startsWith('admin-') && role !== 'admin') {
      setCurrentView('login');
    } else if (currentView.startsWith('shopkeeper-') && role !== 'shopkeeper') {
      setCurrentView('login');
    } else if (currentView.startsWith('customer-') && role !== 'customer') {
      setCurrentView('login');
    } else if (user && (currentView === 'login' || currentView === 'register-customer' || currentView === 'register-shopkeeper')) {
      if (role === 'admin') setCurrentView('admin-dashboard');
      else if (role === 'shopkeeper') setCurrentView('shopkeeper-dashboard');
      else setCurrentView('customer-dashboard');
    }
  }, [currentView, role, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center animate-pulse">
          JK
        </div>
        <p className="text-xs font-bold text-slate-600">Loading JK Mission Nepal...</p>
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
              handleOpenInvoice(orderId);
              navigateTo('customer-orders');
            }}
            onNavigateLogin={() => navigateTo('login')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={() => {
              if (role === 'admin') navigateTo('admin-dashboard');
              else if (role === 'shopkeeper') navigateTo('shopkeeper-dashboard');
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

      // Customer Panel
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            onNavigate={navigateTo}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'customer-wallets':
        return (
          <CustomerWallets
            onNavigateWithdraw={() => navigateTo('customer-withdrawals')}
          />
        );
      case 'customer-referrals':
        return <CustomerReferrals />;
      case 'customer-orders':
        return (
          <CustomerOrders
            onViewInvoice={handleOpenInvoice}
            onNavigateShop={() => navigateTo('products')}
          />
        );
      case 'customer-withdrawals':
        return <CustomerWithdrawals />;

      // Shopkeeper Panel
      case 'shopkeeper-dashboard':
        return <ShopkeeperDashboard onNavigate={navigateTo} />;
      case 'shopkeeper-products':
        return <ShopkeeperProducts />;
      case 'shopkeeper-inventory':
        return <ShopkeeperInventory />;
      case 'shopkeeper-orders':
        return <ShopkeeperOrders onViewInvoice={handleOpenInvoice} />;
      case 'shopkeeper-wallet':
        return <ShopkeeperWallet />;

      // Admin Panel
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigateTo} />;
      case 'admin-products':
        return <AdminProducts />;
      case 'admin-customers':
        return <AdminCustomers />;
      case 'admin-shopkeepers':
        return <AdminShopkeepers />;
      case 'admin-orders':
        return <AdminOrders onViewInvoice={handleOpenInvoice} />;
      case 'admin-withdrawals':
        return <AdminWithdrawals />;
      case 'admin-ledgers':
        return <AdminLedgers />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-audit-logs':
        return <AdminAuditLogs />;

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
