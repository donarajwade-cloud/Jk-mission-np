import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { WalletCardUI } from '../../components/common/WalletCardUI.tsx';
import { TransactionHistoryCardView, TransactionCardItem } from '../../components/common/TransactionHistoryCardView.tsx';
import { 
  Award, 
  TrendingUp, 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  Filter, 
  Layers,
  Sparkles,
  ShoppingBag,
  Users
} from 'lucide-react';

export const CustomerWallets: React.FC<{ onNavigateWithdraw: () => void }> = ({ onNavigateWithdraw }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cashback' | 'income'>('cashback');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCustomerWallet();
        if (res.success) setData(res);
      } catch (err: any) {
        console.warn('Could not load wallet data:', err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-bold">Loading wallet card data...</p>
      </div>
    );
  }

  const wallet = data?.wallet;
  const cashbackHistory = data?.cashbackHistory || [];
  const referralIncomeHistory = data?.referralIncomeHistory || [];

  // Map ONLY real user records - ZERO demo data
  const cashbackItems: TransactionCardItem[] = cashbackHistory.map((item: any) => ({
    id: String(item.id),
    title: item.productName || 'Customer Cashback Award',
    category: 'cashback',
    date: item.createdAt,
    amountNpr: item.amountNpr,
    type: item.type === 'debit' ? 'debit' : 'credit',
    orderNumber: item.orderNumber,
    status: item.type === 'credit' ? 'Settled' : 'Reversed'
  }));

  const incomeItems: TransactionCardItem[] = referralIncomeHistory.map((item: any) => ({
    id: String(item.id),
    title: item.description || `Level ${item.referralLevel || 1} Referral Bonus`,
    category: 'salary',
    date: item.createdAt,
    amountNpr: item.amountNpr,
    type: 'credit',
    orderNumber: item.orderNumber,
    status: 'Withdrawable'
  }));

  const activeItems = activeTab === 'cashback' ? cashbackItems : incomeItems;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Digital Card Accounts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-0.5">
            Wallet Cards &amp; Ledgers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your real customer cashback rewards and verified 3-level team referral income.
          </p>
        </div>

        <button
          onClick={onNavigateWithdraw}
          className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center space-x-2 shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-95"
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Request Disbursement</span>
        </button>
      </div>

      {/* Wallet Cards Design matching Uploaded Screenshot */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Available Cashback Balance */}
          <WalletCardUI
            title="AVAILABLE CASHBACK BALANCE"
            balanceNpr={wallet?.cashbackAvailableNpr || 0}
            subtitle="Automatically credited upon order delivery!"
            watermark="shopping"
            isActive={activeTab === 'cashback'}
            onSelect={() => setActiveTab('cashback')}
            actionLabel="View Cashback Ledger"
            onAction={() => setActiveTab('cashback')}
          />

          {/* Card 2: Lifetime Total Earnings */}
          <WalletCardUI
            title="LIFETIME TOTAL EARNINGS"
            balanceNpr={wallet?.incomeAvailableNpr || 0}
            totalWithdrawnNpr={wallet?.incomeTotalWithdrawnNpr || 0}
            watermark="trending"
            isActive={activeTab === 'income'}
            onSelect={() => setActiveTab('income')}
            actionLabel="Request Payout"
            onAction={onNavigateWithdraw}
            secondaryAction={{
              label: 'View Statement',
              onClick: () => setActiveTab('income')
            }}
          />
        </div>

        {/* Two Mini Cards matching Screenshot Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <WalletCardUI
            title="3-LEVEL REFERRAL INCOME"
            balanceNpr={wallet?.incomeTotalEarnedNpr || 0}
            subtitle="Downline team sales commission"
            watermark="users"
          />

          <WalletCardUI
            title="PERSONAL SHOPPING CASHBACK"
            balanceNpr={wallet?.cashbackTotalEarnedNpr || 0}
            subtitle="Lifetime retail purchase rewards"
            watermark="award"
          />
        </div>
      </div>

      {/* Card Ledger Controls & Statement View */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('cashback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'cashback' 
                  ? 'bg-slate-950 text-emerald-300 shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Cashback Statement ({cashbackHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'income' 
                  ? 'bg-slate-950 text-amber-300 shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income Statement ({referralIncomeHistory.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Immutable Ledger Records</span>
          </div>
        </div>

        {/* Transaction History Card View matching Screenshot UI */}
        <div className="bg-slate-50/60 p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <TransactionHistoryCardView
            title={activeTab === 'cashback' ? 'Cashback Transaction History' : 'Referral Income Transaction History'}
            showCloseButton={false}
            transactions={activeItems}
          />
        </div>
      </div>
    </div>
  );
};
