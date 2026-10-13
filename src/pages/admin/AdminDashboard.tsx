import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import {
  Users,
  Store,
  ShoppingBag,
  Award,
  Layers,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getAdminOverview();
        if (res.success) setStats(res.stats);
      } catch (err: any) {
        console.warn('Could not load admin stats:', err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-bold">Computing real database financials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Governance & Financial Intelligence
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Admin Overview & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            All metrics reflect actual database ledger entries for JK Mission Nepal (NPR).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('admin-products')}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs transition-colors"
          >
            Product Approvals
          </button>
          <button
            onClick={() => onNavigate('admin-withdrawals')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shadow-xs transition-colors"
          >
            Process Withdrawals
          </button>
        </div>
      </div>

      {/* Primary Financial Statistics (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Value</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-950">{formatNPR(stats?.totalSalesValue)}</p>
          <p className="text-[11px] text-slate-500">
            {stats?.totalSalesCount || 0} completed orders
          </p>
        </div>

        {/* Total Customer Cashback */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cashback Awarded</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{formatNPR(stats?.totalCashbackAwarded)}</p>
          <p className="text-[11px] text-slate-500">Credited to customer cashback wallets</p>
        </div>

        {/* 3-Level Referral Commission */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Referral Commissions</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-purple-700">{formatNPR(stats?.totalReferralCommissionAwarded)}</p>
          <p className="text-[11px] text-slate-500">Distributed across Level 1, 2, and 3</p>
        </div>

        {/* Shopkeeper Commission */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shopkeeper Commissions</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-blue-700">{formatNPR(stats?.totalShopkeeperCommissionAwarded)}</p>
          <p className="text-[11px] text-slate-500">Merchant sales commission ledger</p>
        </div>
      </div>

      {/* Secondary Financial & Entity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Profit Breakdown */}
        <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Profitability Summary (NPR)
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Gross Sales:</span>
              <strong className="text-white">{formatNPR(stats?.totalSalesValue)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Merchant Product Costs:</span>
              <strong className="text-white">{formatNPR(stats?.totalProductCostNpr)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Customer Cashback Outflow:</span>
              <strong className="text-amber-400">-{formatNPR(stats?.totalCashbackAwarded)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>3-Level Commission Outflow:</span>
              <strong className="text-amber-400">-{formatNPR(stats?.totalReferralCommissionAwarded)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shopkeeper Commission Outflow:</span>
              <strong className="text-blue-400">-{formatNPR(stats?.totalShopkeeperCommissionAwarded)}</strong>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-black text-amber-300">
              <span>Net Platform Margin:</span>
              <span>{formatNPR(stats?.netProfitEstimatedNpr)}</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Liabilities */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Withdrawal Settlements
          </span>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500">Pending Requests</span>
              <p className="text-2xl font-black text-slate-900">{formatNPR(stats?.pendingWithdrawalAmount)}</p>
              <p className="text-[11px] text-slate-400">{stats?.pendingWithdrawalCount || 0} user request(s) awaiting approval</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Total Paid Out</span>
              <p className="text-xl font-black text-emerald-600">{formatNPR(stats?.paidWithdrawalAmount)}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-withdrawals')}
            className="w-full py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Manage Payouts & 15-Day Cycle
          </button>
        </div>

        {/* Platform Directory Counts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Network Scale
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Registered Customers</span>
              <strong className="text-lg font-black text-slate-900">{stats?.totalCustomers}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Approved Merchants</span>
              <strong className="text-lg font-black text-slate-900">{stats?.approvedShopkeepers}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Approved Products</span>
              <strong className="text-lg font-black text-slate-900">{stats?.approvedProducts}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Active Shops</span>
              <strong className="text-lg font-black text-slate-900">{stats?.totalShops}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcut Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-800">
        <button
          onClick={() => onNavigate('admin-products')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-3 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span>Product Approvals & Commissions</span>
        </button>

        <button
          onClick={() => onNavigate('admin-customers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-3 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span>Customer & Referral Trees</span>
        </button>

        <button
          onClick={() => onNavigate('admin-shopkeepers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-3 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <span>Shopkeeper Reviews</span>
        </button>

        <button
          onClick={() => onNavigate('admin-ledgers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-3 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>Financial Ledgers & Reports</span>
        </button>
      </div>
    </div>
  );
};
