import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  CreditCard,
  FileText,
  Settings,
  ClipboardList,
  ShieldCheck,
  Package,
  Layers,
  Award,
  ExternalLink,
  LogOut,
  ChevronRight,
  Ticket
} from 'lucide-react';

interface PanelNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const PanelNav: React.FC<PanelNavProps> = ({ currentView, onNavigate }) => {
  const { user, role, logout, shop } = useAuth();
  const [pendingStats, setPendingStats] = useState<{ pendingShopkeepers: number; pendingProducts: number }>({
    pendingShopkeepers: 0,
    pendingProducts: 0
  });

  useEffect(() => {
    if (role === 'admin') {
      api.getAdminOverview()
        .then(res => {
          if (res.success && res.stats) {
            setPendingStats({
              pendingShopkeepers: res.stats.pendingShopkeepers || 0,
              pendingProducts: res.stats.pendingProducts || 0
            });
          }
        })
        .catch(() => {});
    }
  }, [role, currentView]);

  const isPanelRoute =
    currentView.startsWith('admin-') ||
    currentView.startsWith('shopkeeper-') ||
    currentView.startsWith('customer-');

  // If we are not on any panel route, do not render panel nav
  if (!isPanelRoute || !user) {
    return null;
  }

  // Define tab items for each role
  const adminTabs = [
    { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-products', label: 'Product Approvals', icon: ShoppingBag },
    { id: 'admin-shopkeepers', label: 'Shopkeepers', icon: Store },
    { id: 'admin-customers', label: 'Customer Trees', icon: Users },
    { id: 'admin-orders', label: 'Orders & Sales', icon: Package },
    { id: 'admin-coupons', label: 'Cashback Coupons (20%)', icon: Ticket },
    { id: 'admin-withdrawals', label: 'Withdrawals (15-Day)', icon: CreditCard },
    { id: 'admin-ledgers', label: 'Ledgers & Tax', icon: FileText },
    { id: 'admin-settings', label: 'Platform Config', icon: Settings },
    { id: 'admin-audit-logs', label: 'Audit Logs', icon: ClipboardList }
  ];

  const shopkeeperTabs = [
    { id: 'shopkeeper-dashboard', label: 'Shop Dashboard', icon: LayoutDashboard },
    { id: 'shopkeeper-products', label: 'My Products', icon: ShoppingBag },
    { id: 'shopkeeper-inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'shopkeeper-orders', label: 'Orders & Sales', icon: FileText },
    { id: 'shopkeeper-wallet', label: 'Commission Wallet', icon: CreditCard }
  ];

  const customerTabs = [
    { id: 'customer-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'customer-wallets', label: 'Wallets & Cashback', icon: Award },
    { id: 'customer-coupons', label: 'My Coupons', icon: Ticket },
    { id: 'customer-referrals', label: '3-Level Team', icon: Users },
    { id: 'customer-orders', label: 'My Orders & Invoices', icon: Package },
    { id: 'customer-withdrawals', label: 'Withdrawal Requests', icon: CreditCard }
  ];

  const activeTabs =
    role === 'admin'
      ? adminTabs
      : role === 'shopkeeper'
      ? shopkeeperTabs
      : customerTabs;

  const roleTitle =
    role === 'admin'
      ? 'Administrator Portal'
      : role === 'shopkeeper'
      ? (shop?.name ? `Merchant Panel — ${shop.name}` : 'Shopkeeper Panel')
      : `Customer Panel — ${user.name}`;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white shadow-md sticky top-16 z-30">
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Info Bar */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-amber-400 tracking-wide uppercase text-[11px]">
              {roleTitle}
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline font-mono">
              ID: {user.referralId || user.mobile}
            </span>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center space-x-1.5 font-semibold text-[11px]"
              title="Preview public storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Store</span>
            </button>
            <button
              onClick={logout}
              className="px-2.5 py-1 rounded-lg hover:bg-red-950/80 text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 font-semibold text-[11px]"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="py-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-1 min-w-max">
            {activeTabs.map((tab) => {
              const isActive = currentView === tab.id;
              const Icon = tab.icon;
              let badgeCount = 0;
              if (role === 'admin') {
                if (tab.id === 'admin-shopkeepers') badgeCount = pendingStats.pendingShopkeepers;
                if (tab.id === 'admin-products') badgeCount = pendingStats.pendingProducts;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{tab.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
