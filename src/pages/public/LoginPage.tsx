import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { LogIn, ShieldCheck, Store, UserCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: string) => void;
  onNavigateRegister: (role: 'customer' | 'shopkeeper') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister
}) => {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(mobile.trim(), password);
      if (res.success) {
        // Will be routed automatically based on role in App
        onLoginSuccess('logged-in');
      } else {
        setError(res.error || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (m: string, p: string) => {
    setMobile(m);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-amber-300/40">
            JK
          </div>
          <h1 className="text-2xl font-black text-slate-950 pt-2">Account Login</h1>
          <p className="text-xs text-slate-500">
            Sign in to access your Customer, Shopkeeper, or Admin Portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Registered Mobile Number (+977)
            </label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+97798XXXXXXXX or 98XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
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
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* 1-Click Demo Accounts for Easy Testing */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Fill Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('+9779800000000', 'Admin@123JK')}
              className="p-2 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 font-bold text-center transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-700" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('+9779811111111', 'Shopkeeper@123')}
              className="p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-slate-900 font-bold text-center transition-colors"
            >
              <Store className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-700" />
              <span>Shopkeeper</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('+9779822222222', 'Customer@123')}
              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-slate-900 font-bold text-center transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-700" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Links to Register */}
        <div className="pt-2 text-center text-xs space-y-1.5 border-t border-slate-100">
          <p className="text-slate-500">
            Don&apos;t have an account yet?
          </p>
          <div className="flex justify-center space-x-4 font-bold text-amber-700">
            <button
              onClick={() => onNavigateRegister('customer')}
              className="hover:underline"
            >
              Join as Customer
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateRegister('shopkeeper')}
              className="hover:underline"
            >
              Register Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
