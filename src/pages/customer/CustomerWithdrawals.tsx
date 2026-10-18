import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import { WalletCardUI } from '../../components/common/WalletCardUI.tsx';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  Building2, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  History
} from 'lucide-react';

export const CustomerWithdrawals: React.FC = () => {
  const { user } = useAuth();
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
  const [branchName, setBranchName] = useState('');

  const loadData = async () => {
    try {
      const res = await api.getCustomerWallet();
      if (res.success) setData(res);
    } catch (err: any) {
      console.warn('Could not load wallet data:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const amount = Number(amountNpr);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid NPR amount');
      return;
    }

    if (!accountNumberOrId.trim() || !accountHolderName.trim()) {
      setError('Account number / wallet ID and account holder name are required');
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
          bankName: paymentMethod === 'bank_transfer' ? bankName : undefined,
          branchName: paymentMethod === 'bank_transfer' ? branchName.trim() : undefined
        }
      });

      if (res.success) {
        setSuccessMsg(`Withdrawal request for ${formatNPR(amount)} submitted successfully. It will be reviewed and disbursed manually.`);
        setAmountNpr('');
        setAccountNumberOrId('');
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const wallet = data?.wallet;
  const withdrawals = data?.withdrawals || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Fund Disbursement</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Income Card Withdrawals
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Withdraw eligible referral team commissions to your verified eSewa, Khalti, or Commercial Bank account in Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Card & Request Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Income Digital Card */}
          <WalletCardUI
            type="income"
            title="Available Withdrawable Income"
            subtitle="3-Level Team Commissions"
            cardHolderName={user?.name || 'JK MISSION PROMOTER'}
            accountOrId={user?.referralId || user?.mobile || '98XXXXXXXX'}
            balanceNpr={wallet?.incomeAvailableNpr || 0}
            totalEarnedNpr={wallet?.incomeTotalEarnedNpr || 0}
            totalWithdrawnNpr={wallet?.incomeTotalWithdrawnNpr || 0}
            badge="Withdrawable"
            isActive={true}
          />

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Disbursement Details</h3>
              <span className="text-[10px] text-slate-400 font-bold">Min: NPR 100</span>
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
                <label className="block font-bold text-slate-700 mb-1">
                  Withdrawal Amount (NPR)
                </label>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  step="1"
                  required
                  value={amountNpr}
                  onChange={(e) => setAmountNpr(e.target.value)}
                  placeholder="Min 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Payment Channel Card Buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Payout Channel</label>
                <div className="grid grid-cols-3 gap-2">
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
                  {paymentMethod === 'bank_transfer' ? 'Bank Account Number' : `${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Mobile ID`}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumberOrId}
                  onChange={(e) => setAccountNumberOrId(e.target.value)}
                  placeholder={paymentMethod === 'bank_transfer' ? '0120101...' : '98XXXXXXXX'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Name as registered on account"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Nabil Bank, Global IME, NIC Asia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. New Road / Thamel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting || (wallet?.incomeAvailableNpr || 0) < 100}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 hover:shadow-lg transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Withdrawal Request History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Withdrawal Request History</h3>
                <p className="text-xs text-slate-400">Track real-time payout processing status</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {withdrawals.length} Requests
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p>No withdrawal requests made yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {withdrawals.map((w: any) => (
                  <div key={w.id} className="py-4 space-y-2 text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-slate-900 text-sm">{formatNPR(w.amountNpr)}</span>
                        <span className="text-[10px] text-slate-400 block">{formatNepaliDate(w.requestedAt)}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        w.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : w.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : w.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Method: <strong className="uppercase font-bold text-slate-800">{w.paymentMethod}</strong>
                        </span>
                        <span>
                          Account: <strong className="font-mono text-slate-900">{w.accountDetails?.accountNumberOrId}</strong> ({w.accountDetails?.accountHolderName})
                        </span>
                      </div>
                      {w.paymentReferenceNumber && (
                        <p className="text-emerald-700 font-bold pt-1 border-t border-slate-200/60">
                          Payment Reference: <span className="font-mono">{w.paymentReferenceNumber}</span>
                        </p>
                      )}
                      {w.adminNotes && (
                        <p className="text-slate-500 italic">Admin Note: {w.adminNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
