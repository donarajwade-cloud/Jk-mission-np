import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  Award,
  Users,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  Ticket,
  Sparkles
} from 'lucide-react';
import { WalletCardUI } from '../../components/common/WalletCardUI.tsx';

interface CustomerDashboardProps {
  onNavigate: (view: string, param?: string) => void;
  onViewInvoice: (orderId: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onViewInvoice
}) => {
  const { user, customerWallet } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [availableCouponsCount, setAvailableCouponsCount] = useState<number>(0);
  const [couponRule, setCouponRule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [ordRes, walRes, cpnRes] = await Promise.all([
        api.getMyOrders(),
        api.getCustomerWallet(),
        api.getMyCoupons().catch(() => ({ success: false, coupons: [], rule: null }))
      ]);
      if (ordRes.success) setRecentOrders(ordRes.orders.slice(0, 3));
      if (walRes.success) setWalletData(walRes);
      if (cpnRes && cpnRes.success) {
        const available = (cpnRes.coupons || []).filter((c: any) => c.status === 'available');
        setAvailableCouponsCount(available.length);
        if (cpnRes.rule) setCouponRule(cpnRes.rule);
      }
    } catch (err: any) {
      console.warn('Notice: Could not load customer dashboard data:', err?.message || err);
      setLoadError(err?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const handleCopyReferral = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wallet = walletData?.wallet || customerWallet;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {loadError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <span>{loadError}</span>
          <button
            onClick={loadDashboard}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-slate-900 font-bold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-300 text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
            <span>Customer Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Namaste, {user?.name}!
          </h1>
          <p className="text-xs text-slate-800 font-medium max-w-xl">
            Welcome to your personal shopping and referral portal on JK Mission Nepal.
          </p>
        </div>

        {/* Permanent Referral ID Box */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-amber-400/50 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Your Permanent Referral ID
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
              +977 Verified
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-base font-black text-slate-950">
              {user ? formatNepalMobile(user.referralId) : ''}
            </span>
            <button
              onClick={handleCopyReferral}
              className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors shadow-xs"
              title="Copy Referral ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Share this mobile number with friends to link them as your Level 1 referrals.
          </p>
        </div>
      </div>

      {/* Two Strictly Separated Digital Wallet Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span className="flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Digital Cards & Accounts</span>
          </span>
          <button
            onClick={() => onNavigate('customer-wallets')}
            className="text-[11px] text-amber-800 hover:underline flex items-center space-x-1"
          >
            <span>Open Wallet Hub</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet 1: Customer Cashback Wallet Card */}
          <WalletCardUI
            type="cashback"
            title="Available Cashback Balance"
            subtitle="Personal Purchase Savings"
            cardHolderName={user?.name || 'JK MISSION CUSTOMER'}
            accountOrId={user?.mobile || user?.referralId || '98XXXXXXXX'}
            balanceNpr={wallet?.cashbackAvailableNpr || 0}
            totalEarnedNpr={wallet?.cashbackTotalEarnedNpr || 0}
            badge="Purchases Only"
            actionLabel="View Cashback Ledger"
            actionIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
            onAction={() => onNavigate('customer-wallets')}
          />

          {/* Wallet 2: Income Wallet Card */}
          <WalletCardUI
            type="income"
            title="Available Income Balance"
            subtitle="3-Level Team Commissions"
            cardHolderName={user?.name || 'JK MISSION PROMOTER'}
            accountOrId={user?.referralId || user?.mobile || '98XXXXXXXX'}
            balanceNpr={wallet?.incomeAvailableNpr || 0}
            totalEarnedNpr={wallet?.incomeTotalEarnedNpr || 0}
            totalWithdrawnNpr={wallet?.incomeTotalWithdrawnNpr || 0}
            badge="Withdrawable"
            actionLabel="Request Withdrawal"
            actionIcon={<CreditCard className="w-3.5 h-3.5 text-amber-600" />}
            onAction={() => onNavigate('customer-withdrawals')}
            secondaryAction={{
              label: '3-Level Team',
              onClick: () => onNavigate('customer-referrals')
            }}
          />
        </div>
      </div>

      {/* 3-Level Cashback Coupons Showcase Card */}
      <div className="bg-linear-to-r from-amber-500 via-amber-400 to-amber-300 rounded-3xl p-6 sm:p-7 text-slate-950 shadow-md border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 font-black text-[10px] uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Automated 3-Level Rewards</span>
            </span>
            <span className="text-xs font-black text-amber-950">
              {availableCouponsCount > 0
                ? `${availableCouponsCount} Active Coupon(s) Available`
                : 'Earn On Every Order'}
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-950">
            Next-Purchase Cashback Coupons
          </h3>
          <p className="text-xs font-medium text-slate-900/90 leading-relaxed">
            Every product purchase automatically generates a 3-Level Cashback Coupon ({couponRule?.level1Percentage || 10}% - {couponRule?.level3Percentage || 20}% OFF) for your next order, configured directly by administration.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('customer-coupons')}
            className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs flex items-center space-x-2 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>My Coupons ({availableCouponsCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Nav Shortcut Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-bold text-slate-800">
        <button
          onClick={() => onNavigate('products')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span>Shop Products</span>
        </button>

        <button
          onClick={() => onNavigate('customer-coupons')}
          className="p-3.5 rounded-2xl bg-white border border-amber-300 hover:border-amber-400 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="block">My Coupons</span>
            <span className="text-[10px] text-amber-800 font-black">{availableCouponsCount} available</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('customer-orders')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <span>My Orders ({recentOrders.length})</span>
        </button>

        <button
          onClick={() => onNavigate('customer-referrals')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <span>Traditional Team</span>
        </button>

        <button
          onClick={() => onNavigate('customer-wallets')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-center space-x-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <span>Ledgers</span>
        </button>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Recent Orders</h3>
          <button
            onClick={() => onNavigate('customer-orders')}
            className="text-xs font-bold text-amber-800 hover:underline"
          >
            View All Orders
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No orders placed yet. Browse participating products to earn instant cashback!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">#{o.orderNumber}</p>
                  <p className="text-slate-400 text-[10px]">{formatNepaliDate(o.createdAt)} • {o.items.length} items</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-black text-slate-900">{formatNPR(o.totalAmountNpr)}</p>
                    <span className="text-[10px] font-bold capitalize text-amber-700">{o.orderStatus}</span>
                  </div>
                  <button
                    onClick={() => onViewInvoice(o.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
