import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserCheck, LogIn, AlertCircle, Sparkles, Gift, Users, Award, RefreshCw, ShoppingBag } from 'lucide-react';
import { CustomerDashboard } from '../customer/CustomerDashboard.tsx';
import { CustomerWallets } from '../customer/CustomerWallets.tsx';
import { CustomerCoupons } from '../customer/CustomerCoupons.tsx';
import { CustomerReferrals } from '../customer/CustomerReferrals.tsx';
import { CustomerOrders } from '../customer/CustomerOrders.tsx';
import { CustomerWithdrawals } from '../customer/CustomerWithdrawals.tsx';
import { RegisterCustomerPage } from '../public/RegisterCustomerPage.tsx';

interface UserPortalPageProps {
  subView?: string;
  onNavigate: (view: string, param?: string) => void;
  onViewInvoice?: (id: string) => void;
}

export const UserPortalPage: React.FC<UserPortalPageProps> = ({
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

  // If already logged in as Customer, render requested subView directly at /user
  if (role === 'customer' && user) {
    switch (subView) {
      case 'wallets':
      case 'wallet':
        return <CustomerWallets onNavigateWithdraw={() => onNavigate('customer-withdrawals')} />;
      case 'coupons':
        return <CustomerCoupons onNavigateShop={() => onNavigate('products')} />;
      case 'referrals':
      case 'team':
        return <CustomerReferrals />;
      case 'orders':
        return (
          <CustomerOrders
            onViewInvoice={onViewInvoice || (() => {})}
            onNavigateShop={() => onNavigate('products')}
            onNavigateTracking={(orderId) => onNavigate('order-confirmation', orderId)}
          />
        );
      case 'withdrawals':
        return <CustomerWithdrawals />;
      default:
        return <CustomerDashboard onNavigate={onNavigate} onViewInvoice={onViewInvoice || (() => {})} />;
    }
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success && res.user?.role === 'customer') {
        // Automatically re-renders into CustomerDashboard at /user
      } else if (res.success && res.user?.role !== 'customer') {
        // If an admin or shopkeeper signs in through /user, still allow them to proceed to their appropriate view
        if (res.user?.role === 'admin') onNavigate('admin-dashboard');
        else if (res.user?.role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
      } else {
        setError(res.error || 'Invalid credentials. Please verify your mobile number or password.');
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

  // If logged in as another role (shopkeeper/admin), show friendly portal switcher
  if (user && role !== 'customer') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Route: https://jkmissionnp.com/user
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Customer Portal
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are currently signed in as a <span className="font-bold capitalize text-slate-900">{role}</span> ({user.name}).
              You can shop as a customer or return to your management dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate(role === 'admin' ? 'admin-dashboard' : 'shopkeeper-dashboard')}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 transition-all"
            >
              <span>Go to {role === 'admin' ? 'Admin Portal (/admin)' : 'Shopkeeper Portal (/shopkeeper)'}</span>
            </button>
            <button
              onClick={() => logout()}
              className="py-3 px-6 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign Out to Use Customer Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: If user clicked Register tab, display the customer registration form directly
  if (activeTab === 'register') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              https://jkmissionnp.com/user
            </span>
            <h1 className="text-2xl font-black text-slate-950 mt-1">Customer Registration</h1>
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            ← Back to User Login
          </button>
        </div>

        <RegisterCustomerPage
          onSuccess={() => setActiveTab('login')}
          onNavigateLogin={() => setActiveTab('login')}
        />
      </div>
    );
  }

  // Not logged in: Dedicated Customer & Member Portal Login Screen at /user
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6">
        {/* Brand & Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-300/40">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>https://jkmissionnp.com/user</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight pt-1">
            Customer / User Portal
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Access your verified purchases, earn real cashback in NPR, and track your 3-level referral commissions.
          </p>
        </div>

        {/* Feature Badges for Customers */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700">
          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Up to 10% Cashback</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>3-Level Referral Rewards</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Login Form */}
        <form onSubmit={handleUserLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Registered Mobile Number or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+97798XXXXXXXX or user@example.com"
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
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Customer Portal'}</span>
          </button>
        </form>

        {/* Registration CTA for new customers */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
          <p className="text-xs font-bold text-emerald-950">New to JK Mission?</p>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors shadow-2xs"
          >
            Create Free Account with Referral Code
          </button>
        </div>

        {/* Optional Testing Helper for Review */}
        <details className="group pt-1 border-t border-slate-100 text-slate-500">
          <summary className="cursor-pointer text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center py-1 hover:text-slate-600 list-none flex items-center justify-center space-x-1">
            <span>Demo Customer Credentials (For Review)</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Mobile:</span>
              <span className="font-mono font-bold">+9779822222222</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Password:</span>
              <span className="font-mono font-bold">Customer@123</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('+9779822222222', 'Customer@123')}
              className="w-full py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-center hover:bg-emerald-700 transition-colors"
            >
              Fill Customer Credentials
            </button>
          </div>
        </details>

        {/* Other Portals Navigation - Admin hidden */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <button
            onClick={() => onNavigate('shopkeeper-dashboard')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Go to Shopkeeper Hub (/shopkeeper)
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
