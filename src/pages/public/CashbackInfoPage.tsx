import React from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Wallet, Sparkles } from 'lucide-react';

export const CashbackInfoPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Customer Savings Policy</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950">
          Customer Cashback Policy &amp; Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Understand how customer cashback is awarded, stored in your dedicated Cashback Wallet, and protected under Nepal e-commerce regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Details (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-slate-700">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-amber-500" />
              <span>1. Dedicated Cashback Wallet</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              At JK Mission Nepal, your <strong>Cashback Wallet</strong> is kept completely distinct from your <strong>Income Wallet</strong>. Cashback represents your personal purchase reward and is not counted as taxable referral commission income.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>2. How the Amount is Decided</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cashback is configured individually for every product by the Platform Administrator based on the product’s margin, either as a fixed रु amount (e.g. रु 35) or a percentage of the selling price. The exact reward is displayed transparently on the product card before you order.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>3. Crediting and Release Criteria</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cashback is credited to your wallet once the order payment is verified and fulfillment is completed. If an order is returned or refunded, corresponding cashback entries are reversed in compliance with the Refund Policy.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Anti-Fraud &amp; Idempotency Safeguards</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Every cashback transaction generates a permanent ledger record with unique sale IDs. Our server-side transactional engine prevents duplicate cashback credits, ensuring 100% financial accuracy.
            </p>
          </div>
        </div>

        {/* Right Column Highlights (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-6 rounded-3xl text-slate-950 space-y-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
              Ready to Shop
            </span>
            <h4 className="text-lg font-black leading-tight">Start Earning Cashback Today</h4>
            <p className="text-xs text-slate-900 font-medium leading-relaxed">
              Browse authentic local and organic goods and watch your cashback grow with every delivery.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs transition-colors"
            >
              Browse Catalog
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Have Questions?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need assistance with your wallet balance or recent order? Reach out directly to our support desk.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
