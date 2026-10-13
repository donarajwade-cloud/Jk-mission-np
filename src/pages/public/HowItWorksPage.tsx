import React from 'react';
import { ShoppingBag, Award, Users, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Architecture & Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
          How JK Mission Nepal Works
        </h1>
        <p className="text-sm text-slate-600">
          A compliant, production-grade retail ecosystem designed for transparent savings, verified merchant sales, and real customer cashback.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">For Customers</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Register with verified +977 mobile number (permanent Referral ID).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Shop real items in NPR and receive guaranteed eligible cashback.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Earn 3-level referral commissions from team purchases.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center font-black">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">For Shopkeepers</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Apply with business credentials, district, and PAN/VAT number.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Submit retail products with cost and proposed selling price.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Track inventory, orders, and receive verified sales commissions.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Admin Governance</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Audit and verify shopkeeper registrations before activation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Approve products and set custom product-wise commission budgets.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Enforce margin safeguards and disburse manual payments on 15-day cycles.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance Box */}
      <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 text-center max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          Strict Compliance Standards for Nepal
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Commissions are generated solely from genuine retail product sales. The system enforces strict margin rules so that promised cashbacks and referral allocations never exceed the product&apos;s available profit margin. No commissions are generated from registration, joins, or recruiting.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
          >
            Explore Marketplace
          </button>
          <button
            onClick={() => onNavigate('policy')}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-xl"
          >
            Read Policies
          </button>
        </div>
      </div>
    </div>
  );
};
