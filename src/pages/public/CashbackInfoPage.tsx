import React from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const CashbackInfoPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Customer Savings Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
          Everything You Need to Know About Cashback
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Understand how customer cashback is awarded, stored in your dedicated Cashback Wallet, and protected under Nepal e-commerce norms.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base mb-2">1. Dedicated Cashback Wallet</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            At JK Mission Nepal, your <strong>Cashback Wallet</strong> is kept completely distinct from your <strong>Income Wallet</strong>. Cashback represents your personal purchase reward and is not counted as taxable referral commission income.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="font-extrabold text-slate-900 text-base mb-2">2. How the Amount is Decided</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cashback is configured individually for every product by the Platform Administrator based on the product’s margin, either as a fixed NPR amount (e.g. NPR 35) or a percentage of the selling price. The exact reward is displayed transparently on the product card before you order.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="font-extrabold text-slate-900 text-base mb-2">3. Crediting and Release Criteria</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cashback is credited to your wallet once the order payment is verified and fulfillment is completed. If an order is returned or refunded, corresponding cashback entries are reversed in compliance with the Refund Policy.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Anti-Fraud & Idempotency Safeguards</span>
          </div>
          <p className="text-slate-700">
            Every cashback transaction generates a permanent ledger record with unique sale IDs. Our server-side transactional engine prevents duplicate cashback credits, ensuring 100% financial accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};
