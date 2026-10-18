import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { WalletCardUI } from '../../components/common/WalletCardUI.tsx';
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

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Digital Card Accounts</span>
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            Financial Wallet Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your separate personal cashback card and 3-level referral commission card accounts.
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

      {/* Two Premium Card UI Designs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>Active Digital Cards (Tap card to toggle statement)</span>
          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {activeTab === 'cashback' ? 'Viewing Cashback Card Ledger' : 'Viewing Referral Income Card Ledger'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Cashback Wallet (Emerald Finish) */}
          <WalletCardUI
            type="cashback"
            title="Available Cashback Balance"
            subtitle="Personal Retail Savings"
            cardHolderName={user?.name || 'JK MISSION CUSTOMER'}
            accountOrId={user?.mobile || user?.referralId || '98XXXXXXXX'}
            balanceNpr={wallet?.cashbackAvailableNpr || 0}
            totalEarnedNpr={wallet?.cashbackTotalEarnedNpr || 0}
            badge="Purchase Reward"
            isActive={activeTab === 'cashback'}
            onSelect={() => setActiveTab('cashback')}
            actionLabel="View Cashback Ledger"
            actionIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
            onAction={() => setActiveTab('cashback')}
            className={activeTab === 'cashback' ? 'ring-2 ring-emerald-500' : 'opacity-90 hover:opacity-100'}
          />

          {/* Card 2: Referral Income Wallet (Obsidian & Gold Finish) */}
          <WalletCardUI
            type="income"
            title="Available Income Balance"
            subtitle="3-Level Traditional Business"
            cardHolderName={user?.name || 'JK MISSION PROMOTER'}
            accountOrId={user?.referralId || user?.mobile || '98XXXXXXXX'}
            balanceNpr={wallet?.incomeAvailableNpr || 0}
            totalEarnedNpr={wallet?.incomeTotalEarnedNpr || 0}
            totalWithdrawnNpr={wallet?.incomeTotalWithdrawnNpr || 0}
            badge="Withdrawable"
            isActive={activeTab === 'income'}
            onSelect={() => setActiveTab('income')}
            actionLabel="Request Payout"
            actionIcon={<CreditCard className="w-3.5 h-3.5 text-amber-600" />}
            onAction={onNavigateWithdraw}
            secondaryAction={{
              label: 'View Statement',
              onClick: () => setActiveTab('income')
            }}
            className={activeTab === 'income' ? 'ring-2 ring-amber-500' : 'opacity-90 hover:opacity-100'}
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

        {/* Ledger Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {activeTab === 'cashback' ? (
            cashbackHistory.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Cashback Transactions Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Buy qualified products across Nepal. Once your delivery is completed, retail cashback credits instantly to your card!
                </p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Cashback Card History</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Total Credits: {cashbackHistory.filter((c: any) => c.type === 'credit').length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {cashbackHistory.map((item: any) => (
                    <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-black shrink-0">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{item.productName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type === 'credit' ? 'Cashback Credited' : 'Reversed'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Order #{item.orderNumber} • {formatNepaliDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-emerald-600 block">
                          +{formatNPR(item.amountNpr)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Settled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            referralIncomeHistory.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Referral Commissions Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your referral ID with friends and family across Nepal. As they make purchases up to 3 levels, automatic commissions will credit to this card!
                </p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Referral Commission Card History</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Total Records: {referralIncomeHistory.length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {referralIncomeHistory.map((item: any) => (
                    <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                              Level {item.referralLevel}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              Order #{item.orderNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.description || 'Downline team purchase commission'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatNepaliDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-amber-600 block">
                          +{formatNPR(item.amountNpr)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Withdrawable
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
