import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserCheck, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterCustomerPageProps {
  initialSponsor?: string;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const RegisterCustomerPage: React.FC<RegisterCustomerPageProps> = ({
  initialSponsor,
  onSuccess,
  onNavigateLogin
}) => {
  const { registerCustomer } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorReferralMobile, setSponsorReferralMobile] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return initialSponsor || params.get('ref') || params.get('sponsor') || '';
    } catch {
      return initialSponsor || '';
    }
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('You must accept the terms and conditions to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        name: name.trim(),
        mobile: mobile.trim(),
        password,
        sponsorReferralMobile: sponsorReferralMobile.trim() || undefined,
        termsAccepted
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-amber-300/40">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 pt-2">Customer Registration</h1>
          <p className="text-xs text-slate-500">
            Create your account to earn guaranteed cashback and build your 3-level team
          </p>
        </div>

        {/* Highlight regarding Mobile as Referral ID */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-snug">
          <strong>Referral ID Notice: </strong>
          Your verified mobile number (<span className="font-mono font-bold">+97798XXXXXXXX</span>) will permanently act as your Referral ID to share with friends and earn commissions!
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Shrestha"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nepali Mobile Number (+977)
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
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                Referral Sponsor Mobile Number (Optional)
              </label>
              {sponsorReferralMobile && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span>✓ Sponsor Linked from Referral Link</span>
                </span>
              )}
            </div>
            <input
              type="text"
              value={sponsorReferralMobile}
              onChange={(e) => setSponsorReferralMobile(e.target.value)}
              placeholder="e.g. +9779822222222 (leave blank if no sponsor)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Enter the +977 mobile number of the person who referred you to link them as your Level 1 sponsor.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Secure Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs">
                I agree to the JK Mission Nepal Terms & Conditions, Cashback Policy, and Referral Guidelines.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Customer Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-amber-800 font-bold hover:underline"
          >
            Log In here
          </button>
        </div>
      </div>
    </div>
  );
};
