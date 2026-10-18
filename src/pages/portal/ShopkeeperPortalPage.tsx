import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Store, LogIn, AlertCircle, Sparkles, Building2, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { ShopkeeperDashboard } from '../shopkeeper/ShopkeeperDashboard.tsx';
import { ShopkeeperProducts } from '../shopkeeper/ShopkeeperProducts.tsx';
import { ShopkeeperInventory } from '../shopkeeper/ShopkeeperInventory.tsx';
import { ShopkeeperOrders } from '../shopkeeper/ShopkeeperOrders.tsx';
import { ShopkeeperWallet } from '../shopkeeper/ShopkeeperWallet.tsx';
import { RegisterShopkeeperPage } from '../public/RegisterShopkeeperPage.tsx';

interface ShopkeeperPortalPageProps {
  subView?: string;
  onNavigate: (view: string, param?: string) => void;
  onViewInvoice?: (id: string) => void;
}

export const ShopkeeperPortalPage: React.FC<ShopkeeperPortalPageProps> = ({
  subView = 'dashboard',
  onNavigate,
  onViewInvoice
}) => {
  const { user, role, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as Shopkeeper, render requested subView directly at /shopkeeper
  if (role === 'shopkeeper' && user) {
    switch (subView) {
      case 'products':
        return <ShopkeeperProducts />;
      case 'inventory':
        return <ShopkeeperInventory />;
      case 'orders':
        return <ShopkeeperOrders onViewInvoice={onViewInvoice || (() => {})} />;
      case 'wallet':
        return <ShopkeeperWallet />;
      default:
        return <ShopkeeperDashboard onNavigate={onNavigate} />;
    }
  }

  const handleShopkeeperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success && res.user?.role === 'shopkeeper') {
        // Automatically re-renders into ShopkeeperDashboard at /shopkeeper
      } else if (res.success && res.user?.role !== 'shopkeeper') {
        setError(`This account is registered as ${res.user?.role}. Please use your registered Shopkeeper credentials for /shopkeeper.`);
      } else {
        setError(res.error || 'Invalid shopkeeper credentials. Please verify your phone or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (phone: string, pass: string) => {
    setIdentifier(phone);
    setPassword(pass);
  };

  // If logged in as another role, offer a smooth switcher
  if (user && role !== 'shopkeeper') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Route: https://jkmissionnp.com/shopkeeper
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Shopkeeper Portal
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are currently signed in as a <span className="font-bold capitalize text-slate-900">{role}</span> ({user.name}).
              To manage your shop and merchant orders, sign in with your Shopkeeper account.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => logout()}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign Out & Enter Shopkeeper Credentials</span>
            </button>
            <button
              onClick={() => onNavigate(role === 'admin' ? 'admin-dashboard' : 'customer-dashboard')}
              className="py-3 px-6 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all"
            >
              Return to {role === 'admin' ? 'Admin Panel' : 'Customer Panel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: If user clicked Register tab, display the registration form directly
  if (activeTab === 'register') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              https://jkmissionnp.com/shopkeeper
            </span>
            <h1 className="text-2xl font-black text-slate-950 mt-1">Merchant Registration</h1>
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            ← Back to Shopkeeper Login
          </button>
        </div>

        <RegisterShopkeeperPage
          onSuccess={() => setActiveTab('login')}
          onNavigateLogin={() => setActiveTab('login')}
        />
      </div>
    );
  }

  // Not logged in: Dedicated Shopkeeper Portal Login Screen at /shopkeeper
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6">
        {/* Brand & Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-400/40">
            <Store className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>https://jkmissionnp.com/shopkeeper</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight pt-1">
            Shopkeeper Merchant Portal
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage your store inventory, confirm customer order pickups, and track your NPR commission wallet.
          </p>
        </div>

        {/* Feature Badges for Merchants */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700">
          <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>0% Platform Commission</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Fast NPR Wallet Payouts</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Shopkeeper Login Form */}
        <form onSubmit={handleShopkeeperLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Registered Shopkeeper Mobile or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+97798XXXXXXXX or email address"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-400/30 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating Merchant...' : 'Sign In to Shopkeeper Portal'}</span>
          </button>
        </form>

        {/* Registration CTA for new shopkeepers */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5">
          <p className="text-xs font-bold text-amber-950">New Shop Owner in Nepal?</p>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-2xs"
          >
            Register Your Store Now
          </button>
        </div>

        {/* Optional Testing Helper for Review */}
        <details className="group pt-1 border-t border-slate-100 text-slate-500">
          <summary className="cursor-pointer text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center py-1 hover:text-slate-600 list-none flex items-center justify-center space-x-1">
            <span>Demo Shopkeeper Credentials (For Review)</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Mobile:</span>
              <span className="font-mono font-bold">+9779811111111</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Password:</span>
              <span className="font-mono font-bold">Shopkeeper@123</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('+9779811111111', 'Shopkeeper@123')}
              className="w-full py-1.5 bg-blue-600 text-white font-bold rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              Fill Shopkeeper Credentials
            </button>
          </div>
        </details>

        {/* Other Portals Navigation - Admin hidden */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <button
            onClick={() => onNavigate('customer-dashboard')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Go to Customer Portal (/user)
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Public Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
