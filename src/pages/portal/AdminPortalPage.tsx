import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldCheck, LogIn, AlertCircle, ArrowLeft, Lock, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { AdminDashboard } from '../admin/AdminDashboard.tsx';
import { AdminProducts } from '../admin/AdminProducts.tsx';
import { AdminCustomers } from '../admin/AdminCustomers.tsx';
import { AdminShopkeepers } from '../admin/AdminShopkeepers.tsx';
import { AdminOrders } from '../admin/AdminOrders.tsx';
import { AdminWithdrawals } from '../admin/AdminWithdrawals.tsx';
import { AdminLedgers } from '../admin/AdminLedgers.tsx';
import { AdminSettings } from '../admin/AdminSettings.tsx';
import { AdminAuditLogs } from '../admin/AdminAuditLogs.tsx';
import { AdminCoupons } from '../admin/AdminCoupons.tsx';

interface AdminPortalPageProps {
  subView?: string;
  onNavigate: (view: string, param?: string) => void;
  onViewInvoice?: (id: string) => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  subView = 'dashboard',
  onNavigate,
  onViewInvoice
}) => {
  const { user, role, login, logout } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as Admin, render requested subView directly at /admin
  if (role === 'admin' && user) {
    switch (subView) {
      case 'products':
        return <AdminProducts />;
      case 'customers':
        return <AdminCustomers />;
      case 'shopkeepers':
        return <AdminShopkeepers />;
      case 'orders':
        return <AdminOrders onViewInvoice={onViewInvoice || (() => {})} />;
      case 'coupons':
        return <AdminCoupons />;
      case 'withdrawals':
        return <AdminWithdrawals />;
      case 'ledgers':
        return <AdminLedgers />;
      case 'settings':
        return <AdminSettings />;
      case 'audit-logs':
      case 'auditlogs':
        return <AdminAuditLogs />;
      default:
        return <AdminDashboard onNavigate={onNavigate} />;
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success && res.user?.role === 'admin') {
        // Will re-render automatically into AdminDashboard at /admin
      } else if (res.success && res.user?.role !== 'admin') {
        setError(`This account is registered as ${res.user?.role}. Master Admin access is required for /admin.`);
      } else {
        setError(res.error || 'Invalid administrator credentials. Access denied.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  // If logged in as another role (customer or shopkeeper), display clean role switcher
  if (user && role !== 'admin') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Route: https://jkmissionnp.com/admin
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Administrator Portal Locked
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are currently signed in as a <span className="font-bold capitalize text-slate-900">{role}</span> ({user.name}).
              This area is strictly restricted to JK Mission Master Administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => logout()}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign Out & Enter Admin Credentials</span>
            </button>
            <button
              onClick={() => onNavigate(role === 'shopkeeper' ? 'shopkeeper-dashboard' : 'customer-dashboard')}
              className="py-3 px-6 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all"
            >
              Return to {role === 'shopkeeper' ? 'Shopkeeper Panel' : 'Customer Panel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: Dedicated Admin Sign-In Screen at /admin
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6">
        {/* Brand & Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-400/40">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>https://jkmissionnp.com/admin</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight pt-1">
            Administrator Portal
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct access to platform governance, store approvals, 3-level referral rules & financial settlements in Nepal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Admin Email or Mobile
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="jk5172794@gmail.com or +9779766133831"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Master Password</label>
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
            <span>{loading ? 'Verifying Admin Key...' : 'Unlock Admin Portal'}</span>
          </button>
        </form>

        {/* Optional Testing Helper for Review */}
        <details className="group pt-2 border-t border-slate-100 text-slate-500">
          <summary className="cursor-pointer text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center py-1 hover:text-slate-600 list-none flex items-center justify-center space-x-1">
            <span>Official Admin Credentials (For Review)</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Email:</span>
              <span className="font-mono font-bold">jk5172794@gmail.com</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Password:</span>
              <span className="font-mono font-bold">Admin123@</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('jk5172794@gmail.com', 'Admin123@')}
              className="w-full py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-center hover:bg-amber-500 transition-colors"
            >
              Fill Admin Credentials
            </button>
          </div>
        </details>

        {/* Other Portals Navigation */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <button
            onClick={() => onNavigate('shopkeeper-dashboard')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Go to /shopkeeper
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => onNavigate('customer-dashboard')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Go to /user
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-slate-950 font-bold transition-colors"
          >
            Public Store
          </button>
        </div>
      </div>
    </div>
  );
};
