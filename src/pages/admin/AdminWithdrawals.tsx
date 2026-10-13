import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [settlementReport, setSettlementReport] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Pay modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        api.getAdminWithdrawals(filterStatus === 'all' ? undefined : filterStatus),
        api.getSettlementReport()
      ]);
      if (wRes.success) setWithdrawals(wRes.withdrawals);
      if (sRes.success) setSettlementReport(sRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  const handleApprove = async (id: string) => {
    try {
      const res = await api.approveWithdrawal(id, 'Approved for 15-day manual disbursement');
      if (res.success) await load();
    } catch (err: any) {
      alert(err.message || 'Approve failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter reason for rejection (funds will be restored to user):');
    if (!reason) return;
    try {
      const res = await api.rejectWithdrawal(id, reason);
      if (res.success) await load();
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !paymentReferenceNumber.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.recordWithdrawalPayment(selectedWithdrawal.id, {
        paymentReferenceNumber: paymentReferenceNumber.trim(),
        adminNotes: adminNotes.trim() || undefined
      });
      if (res.success) {
        setPayModalOpen(false);
        setPaymentReferenceNumber('');
        setAdminNotes('');
        await load();
      }
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Treasury & Settlements
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Manual Withdrawals & 15-Day Settlements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review withdrawal requests, verify account details, and disburse manual payments with immutable transaction IDs.
        </p>
      </div>

      {/* 15-Day Settlement Cycle Summary Box */}
      {settlementReport && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">
                15-Day Settlement Reporting Cycle
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Audit Standard: Manual Verification before Marking as Paid
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Requested:</span>
              <strong className="text-base text-white">{formatNPR(settlementReport.summary?.totalRequested)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-amber-400 block text-[10px]">Pending Approval:</span>
              <strong className="text-base text-amber-400">{formatNPR(settlementReport.summary?.totalPendingAmount)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-blue-400 block text-[10px]">Approved in Queue:</span>
              <strong className="text-base text-blue-400">{formatNPR(settlementReport.summary?.totalApprovedAmount)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 block text-[10px]">Disbursed & Paid:</span>
              <strong className="text-base text-emerald-400">{formatNPR(settlementReport.summary?.totalPaidAmount)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['all', 'pending', 'approved', 'paid', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterStatus === st
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No withdrawal requests in this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Method & Account Info</th>
                  <th className="py-3 px-4 text-right">Amount (NPR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Ref / Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatNepaliDate(w.requestedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{w.userName}</p>
                      <span className="font-mono text-slate-400 text-[10px]">{formatNepalMobile(w.userMobile)}</span>
                      <span className="ml-1 text-[10px] uppercase font-bold text-slate-500">({w.userRole})</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 uppercase">{w.paymentMethod}</p>
                      <p className="font-mono text-slate-700 text-[11px]">{w.accountDetails?.accountNumberOrId}</p>
                      <p className="text-[10px] text-slate-500">{w.accountDetails?.accountHolderName}</p>
                      {w.accountDetails?.bankName && (
                        <p className="text-[10px] text-slate-400">{w.accountDetails.bankName} {w.accountDetails.branchName ? `(${w.accountDetails.branchName})` : ''}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatNPR(w.amountNpr)}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {w.paymentReferenceNumber ? (
                        <p className="font-mono font-bold text-emerald-700">Ref: {w.paymentReferenceNumber}</p>
                      ) : null}
                      {w.adminNotes && <p className="italic text-slate-500">{w.adminNotes}</p>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {w.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(w.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                        )}

                        {w.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
                          >
                            Mark Paid
                          </button>
                        )}

                        {(w.status === 'pending' || w.status === 'approved') && (
                          <button
                            onClick={() => handleReject(w.id)}
                            className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark As Paid Modal */}
      {payModalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-base">Record Manual Payment Proof</h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p>Beneficiary: <strong>{selectedWithdrawal.userName}</strong> ({formatNepalMobile(selectedWithdrawal.userMobile)})</p>
              <p>Amount: <strong className="text-amber-600 font-black">{formatNPR(selectedWithdrawal.amountNpr)}</strong></p>
              <p>Channel: <strong className="uppercase">{selectedWithdrawal.paymentMethod}</strong> ({selectedWithdrawal.accountDetails?.accountNumberOrId})</p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Reference Number / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={paymentReferenceNumber}
                  onChange={(e) => setPaymentReferenceNumber(e.target.value)}
                  placeholder="e.g. TXN-98217398 / eSewa Statement Ref"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Remarks (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified and transferred via mobile banking"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black"
                >
                  {submitting ? 'Recording...' : 'Confirm & Mark Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
