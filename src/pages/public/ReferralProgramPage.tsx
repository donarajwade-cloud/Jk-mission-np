import React from 'react';
import { Users, ShieldAlert, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const ReferralProgramPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { user, role } = useAuth();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="space-y-2 text-left">
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Affiliate &amp; Team Growth
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950">
          3-Level Referral Commission Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Share products you love. Earn sustainable commissions from verified sales in your traditional business under published product commission settings.
        </p>
      </div>

      {/* Referral Tier Cards - Full Page 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Direct Referrals
            </span>
            <span className="text-lg font-black text-slate-900">Level 1</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Default ~15% of Pool</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            People who sign up using your direct Referral ID (your +977 mobile number). When they purchase eligible products, you earn Level 1 commissions directly into your Income Wallet.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Second Level
            </span>
            <span className="text-lg font-black text-slate-900">Level 2</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Default ~10% of Pool</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Individuals invited by your Level 1 referrals. As your team introduces more buyers to the marketplace, you continue to earn from Level 2 sales volume.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Third Level
            </span>
            <span className="text-lg font-black text-slate-900">Level 3</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Default ~5% of Pool</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Individuals invited by your Level 2 members. Deepen your community reach with sustainable returns bounded strictly by product margin.
          </p>
        </div>
      </div>

      {/* Critical Calculation Rules - Full Page Container */}
      <div className="bg-slate-950 text-white p-6 sm:p-10 rounded-3xl space-y-6">
        <h3 className="text-xl sm:text-2xl font-black text-amber-400">
          Key Calculation Standards &amp; Margin Protection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Referral Pool Base:</strong> Referral percentages apply to the <em>configured referral commission pool</em>, not to the total selling price. This guarantees the company and merchant never operate at a loss.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Product-Specific Overrides:</strong> Admins can configure individual commission percentages or fixed amounts for each product.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">No Multi-Level Pyramid Schemes:</strong> Zero money is paid for signing up friends or growing team size alone. Commissions arise purely from retail product exchanges.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Permanent Sponsor Lock:</strong> A customer cannot alter their sponsor after registration to preserve structural integrity.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-left pt-2">
        {!user ? (
          <button
            onClick={() => onNavigate('register-customer')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm inline-flex items-center justify-center space-x-2 shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all"
          >
            <span>Join Free &amp; Get Your Referral ID</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (role === 'customer') onNavigate('customer-referrals');
              else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
              else onNavigate('admin-customers');
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm inline-flex items-center justify-center space-x-2 shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all"
          >
            <span>
              {role === 'customer'
                ? 'View Your 3-Level Referral Team & Traditional Business'
                : role === 'admin'
                ? 'Inspect Customer Referral Trees'
                : 'Go to Shopkeeper Dashboard'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
