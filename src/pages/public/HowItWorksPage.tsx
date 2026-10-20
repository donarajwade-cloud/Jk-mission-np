import React from 'react';
import { ShoppingBag, Users, Store, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="space-y-2 text-left">
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Architecture &amp; Process
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950">
          How JK Mission Nepal Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          A compliant, production-grade retail ecosystem designed for transparent savings, authorized merchant partner sales, and real customer cashback.
        </p>
      </div>

      {/* 3 Pillars - Full Page Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">For Customers</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Register with verified +977 mobile number (permanent Referral ID).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Shop real items in NPR and receive guaranteed eligible cashback.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Earn 3-level referral commissions from team purchases.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-black">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">For Shopkeepers</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Apply with business credentials, district, and PAN/VAT number.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Submit retail products with cost and proposed selling price.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Track inventory, orders, and receive verified sales commissions.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Admin Governance</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Audit and verify shopkeeper registrations before activation.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Approve products and set custom product-wise commission budgets.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Enforce margin safeguards and disburse manual payments on 15-day cycles.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance Box - Full Page Width */}
      <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 sm:p-8 text-left space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          Strict Compliance Standards for Nepal
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
          Commissions are generated solely from genuine retail product sales. The system enforces strict margin rules so that promised cashbacks and referral allocations never exceed the product&apos;s available profit margin. No commissions are generated from registration, joins, or recruiting.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors text-center"
          >
            Explore Marketplace
          </button>
          <button
            onClick={() => onNavigate('policy')}
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
          >
            Read Governance Policies
          </button>
        </div>
      </div>
    </div>
  );
};
