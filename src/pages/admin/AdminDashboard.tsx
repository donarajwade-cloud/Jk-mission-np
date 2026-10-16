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
  DollarSign,
  Ticket
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
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('admin-shopkeepers')}
            className="relative px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Shopkeeper Approvals</span>
            {stats?.pendingShopkeepers > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {stats.pendingShopkeepers}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('admin-products')}
            className="relative px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Product Approvals</span>
            {stats?.pendingProducts > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                {stats.pendingProducts}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('admin-withdrawals')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Process Withdrawals</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Action Banner if any are waiting */}
      {(stats?.pendingShopkeepers > 0 || stats?.pendingProducts > 0) && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 p-5 rounded-3xl text-slate-950 shadow-md border border-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Admin Action Required
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  New Merchant / Product Submissions
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 mt-0.5">
                {stats?.pendingShopkeepers > 0 && `${stats.pendingShopkeepers} Shopkeeper Application${stats.pendingShopkeepers > 1 ? 's' : ''} Pending`}
                {stats?.pendingShopkeepers > 0 && stats?.pendingProducts > 0 && ' & '}
                {stats?.pendingProducts > 0 && `${stats.pendingProducts} Product${stats.pendingProducts > 1 ? 's' : ''} Awaiting Approval`}
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                New shopkeeper stores and catalog items require administrator verification before going live.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {stats?.pendingShopkeepers > 0 && (
              <button
                onClick={() => onNavigate('admin-shopkeepers')}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs shadow-md flex items-center space-x-1.5 transition-all"
              >
                <span>Review Shopkeepers ({stats.pendingShopkeepers})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {stats?.pendingProducts > 0 && (
              <button
                onClick={() => onNavigate('admin-products')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md flex items-center space-x-1.5 transition-all border border-amber-300"
              >
                <span>Approve Products ({stats.pendingProducts})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

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
            Traditional Business Scale
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-bold text-slate-800">
        <button
          onClick={() => onNavigate('admin-products')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span>Product Approvals</span>
        </button>

        <button
          onClick={() => onNavigate('admin-coupons')}
          className="p-3.5 rounded-2xl bg-white border border-amber-300 hover:border-amber-400 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="block">Cashback Coupons</span>
            <span className="text-[10px] text-amber-800 font-bold">3-Level Engine</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('admin-customers')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <span>Traditional Business Trees</span>
        </button>

        <button
          onClick={() => onNavigate('admin-shopkeepers')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <span>Shopkeeper Reviews</span>
        </button>

        <button
          onClick={() => onNavigate('admin-ledgers')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>Ledgers & Tax</span>
        </button>
      </div>
    </div>
  );
};
