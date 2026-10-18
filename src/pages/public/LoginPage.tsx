import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { LogIn, Store, UserCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  initialRole?: 'customer' | 'shopkeeper' | 'admin';
  onLoginSuccess: (role: string) => void;
  onNavigateRegister: (role: 'customer' | 'shopkeeper') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'customer',
  onLoginSuccess,
  onNavigateRegister
}) => {
  const { login } = useAuth();
  // Keep active tab as customer or shopkeeper (admin is hidden from public view)
  const [activeTab, setActiveTab] = useState<'customer' | 'shopkeeper'>(
    initialRole === 'shopkeeper' ? 'shopkeeper' : 'customer'
  );
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole === 'shopkeeper') {
      setActiveTab('shopkeeper');
    } else if (initialRole === 'customer') {
      setActiveTab('customer');
    }
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        // Automatic Admin Detection:
        // If master admin enters their email/phone & password, automatically route to admin-dashboard!
        const resolvedRole = res.user?.role || activeTab;
        onLoginSuccess(resolvedRole);
      } else {
        setError(res.error || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (m: string, p: string) => {
    setIdentifier(m);
    setPassword(p);
  };

  const handleTabChange = (tab: 'customer' | 'shopkeeper') => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-amber-300/40">
            JK
          </div>
          <h1 className="text-2xl font-black text-slate-950 pt-2">
            {activeTab === 'shopkeeper' ? 'Shopkeeper Login' : 'User / Customer Login'}
          </h1>
          <p className="text-xs text-slate-500">
            {activeTab === 'shopkeeper'
              ? 'Sign in to manage your inventory, orders & sales commission'
              : 'Sign in to shop, track orders, and view your cashback balance'}
          </p>
        </div>

        {/* Public Role Selection Tabs (Only Customer and Shopkeeper shown) */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'customer'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Customer Account</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('shopkeeper')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'shopkeeper'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Store className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Shopkeeper Hub</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form - Supports both mobile and email automatically */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Registered Mobile Number or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. +97798XXXXXXXX or email address"
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
            <span>{loading ? 'Authenticating...' : `Sign In`}</span>
          </button>
        </form>

        {/* Public Demo Testing Credentials Helper (Collapsed by default - Admin hidden) */}
        <details className="group pt-2 border-t border-slate-100 text-slate-500">
          <summary className="cursor-pointer text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center py-1 hover:text-slate-600 list-none flex items-center justify-center space-x-1">
            <span>Demo Test Credentials (For Review)</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-2 grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('+9779822222222', 'Customer@123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold text-center transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('+9779811111111', 'Shopkeeper@123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-bold text-center transition-colors"
            >
              <Store className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
              <span>Shopkeeper</span>
            </button>
          </div>
        </details>

        {/* Links to Register */}
        <div className="pt-2 text-center text-xs space-y-2 border-t border-slate-100">
          <p className="text-slate-500">Need a new account?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateRegister('customer')}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-bold text-xs transition-colors"
            >
              Join as Customer
            </button>
            <button
              onClick={() => onNavigateRegister('shopkeeper')}
              className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <Store className="w-3 h-3 text-amber-700" />
              <span>Become a Shopkeeper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
