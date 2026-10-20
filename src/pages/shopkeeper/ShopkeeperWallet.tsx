import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import { WalletCardUI } from '../../components/common/WalletCardUI.tsx';
import { TransactionHistoryCardView, TransactionCardItem } from '../../components/common/TransactionHistoryCardView.tsx';
import { 
  TrendingUp, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  History, 
  Store, 
  Building2, 
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export const ShopkeeperWallet: React.FC = () => {
  const { user, shop } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [amountNpr, setAmountNpr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank_transfer'>('esewa');
  const [accountNumberOrId, setAccountNumberOrId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('Nabil Bank Limited');

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getShopkeeperWallet();
      if (res.success) setData(res);
    } catch (err: any) {
      console.warn('Could not load shopkeeper wallet data:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const amount = Number(amountNpr);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid NPR amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.requestWithdrawal({
        amountNpr: amount,
        paymentMethod,
        accountDetails: {
          accountNumberOrId: accountNumberOrId.trim(),
          accountHolderName: accountHolderName.trim(),
          bankName: paymentMethod === 'bank_transfer' ? bankName : undefined
        }
      });

      if (res.success) {
        setSuccessMsg(`Withdrawal request for ${formatNPR(amount)} submitted successfully.`);
        setAmountNpr('');
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const wallet = data?.wallet;
  const commissions = data?.commissions || [];
  const withdrawals = data?.withdrawals || [];

  // Map into standalone floating card items matching screenshot UI (Zero demo data)
  const commissionCardItems: TransactionCardItem[] = commissions.map((c: any) => ({
    id: String(c.id),
    title: c.productName || 'Merchant Sales Commission',
    category: 'grocery' as const,
    date: c.createdAt,
    amountNpr: c.amountNpr,
    type: 'credit' as const,
    orderNumber: c.orderNumber,
    status: 'Credited'
  }));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-black uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Merchant Treasury</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Shopkeeper Merchant Card & Wallet
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized sales commissions earned from customer orders and verified payouts across Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Merchant Card & Disbursement Request */}
        <div className="lg:col-span-5 space-y-6">
          {/* Authentic Merchant Card UI */}
          <WalletCardUI
            type="shopkeeper"
            title="Available Sales Commission"
            subtitle="Commercial Merchant Account"
            cardHolderName={user?.name || shop?.name || 'STORE PARTNER'}
            accountOrId={user?.mobile || '98XXXXXXXX'}
            balanceNpr={wallet?.availableCommissionNpr || 0}
            totalEarnedNpr={wallet?.totalEarnedNpr || 0}
            totalWithdrawnNpr={wallet?.totalWithdrawnNpr || 0}
            badge="Authorized Store"
            isActive={true}
          />

          {/* Disbursement Request Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-700" />
                <h3 className="font-extrabold text-slate-900 text-sm">Request Merchant Disbursement</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Min: रु 100</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Disbursement Amount (रु)</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={amountNpr}
                  onChange={(e) => setAmountNpr(e.target.value)}
                  placeholder="e.g. रु 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Payment Channel Selection Cards */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Disbursement Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* eSewa Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('esewa')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'esewa'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-400/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                      e
                    </div>
                    <span className="font-bold text-[11px]">eSewa</span>
                  </button>

                  {/* Khalti Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('khalti')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'khalti'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-950 ring-2 ring-purple-400/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-[10px]">
                      K
                    </div>
                    <span className="font-bold text-[11px]">Khalti</span>
                  </button>

                  {/* Bank Transfer Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-400/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-[11px]">Bank A/C</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {paymentMethod === 'bank_transfer' ? 'Bank Account Number' : `${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} ID (Mobile Number)`}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumberOrId}
                  onChange={(e) => setAccountNumberOrId(e.target.value)}
                  placeholder={paymentMethod === 'bank_transfer' ? '01XXXXXXXXXXXXXX' : '98XXXXXXXX'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Full name as on bank / digital wallet"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commercial Bank Name</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="Nabil Bank Limited">Nabil Bank Limited</option>
                    <option value="Global IME Bank">Global IME Bank</option>
                    <option value="NIC Asia Bank">NIC Asia Bank</option>
                    <option value="Rastriya Banijya Bank">Rastriya Banijya Bank</option>
                    <option value="Nepal Investment Mega Bank">Nepal Investment Mega Bank</option>
                    <option value="Standard Chartered Bank Nepal">Standard Chartered Bank Nepal</option>
                    <option value="Sanima Bank">Sanima Bank</option>
                    <option value="Prabhu Bank">Prabhu Bank</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || (wallet?.availableCommissionNpr || 0) < 100}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Disbursement Request'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction History Card View matching Screenshot UI */}
        <div className="lg:col-span-7 bg-slate-50/60 p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <TransactionHistoryCardView
            title="Merchant Sales Commission History"
            showCloseButton={false}
            transactions={commissionCardItems}
          />
        </div>
      </div>
    </div>
  );
};
