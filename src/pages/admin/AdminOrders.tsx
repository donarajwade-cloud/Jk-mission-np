import React, { useState, useEffect } from 'react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  RotateCcw,
  FileText,
  AlertTriangle,
  Play
} from 'lucide-react';

interface AdminOrdersProps {
  onViewInvoice: (orderId: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ onViewInvoice }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.getAdminOrders();
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerifyPayment = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await api.verifyOrderPayment(orderId);
      if (res.success) await load();
    } catch (err: any) {
      alert(err.message || 'Payment verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteAndReleaseCommissions = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await api.completeOrderAndReleaseCommissions(orderId);
      if (res.success) {
        alert(res.message);
        await load();
      }
    } catch (err: any) {
      alert(err.message || 'Commission release failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async () => {
    if (!targetOrderId || !refundReason.trim()) return;
    try {
      const res = await api.refundOrder(targetOrderId, refundReason.trim());
      if (res.success) {
        setRefundModalOpen(false);
        setRefundReason('');
        await load();
      }
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Fulfillment & Commission Execution
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Orders & Commission Release Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify payments, execute idempotent cashback and 3-level commission distribution, or process audited refunds.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No orders recorded in database yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Total (NPR)</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Commissions State</th>
                  <th className="py-3 px-4 text-center">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 font-mono">#{o.orderNumber}</p>
                      <span className="text-[10px] text-slate-400">{formatNepaliDate(o.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{o.customerName}</p>
                      <span className="font-mono text-[10px] text-slate-500">{formatNepalMobile(o.customerMobile)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold uppercase text-slate-700">{o.paymentMethod}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {o.paymentStatus}
                      </span>
                      {o.paymentReference && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: {o.paymentReference}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatNPR(o.totalAmountNpr)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        o.orderStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {o.commissionProcessed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Distributed</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">Pending Release</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Verify Payment */}
                        {o.paymentStatus !== 'verified' && o.paymentStatus !== 'refunded' && (
                          <button
                            onClick={() => handleVerifyPayment(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            title="Verify Customer Payment"
                          >
                            Verify Pay
                          </button>
                        )}

                        {/* Complete & Release Commissions */}
                        {!o.commissionProcessed && o.orderStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleCompleteAndReleaseCommissions(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-xs"
                            title="Release Cashback & 3-Level Commissions"
                          >
                            <Play className="w-3 h-3" />
                            <span>Release Comm</span>
                          </button>
                        )}

                        {/* View Invoice */}
                        <button
                          onClick={() => onViewInvoice(o.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          title="View Invoice"
                        >
                          Invoice
                        </button>

                        {/* Refund */}
                        {o.paymentStatus !== 'refunded' && (
                          <button
                            onClick={() => {
                              setTargetOrderId(o.id);
                              setRefundModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                            title="Refund Order"
                          >
                            Refund
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

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-base">Refund & Reverse Commissions</h3>
            <p className="text-slate-600">
              Refunding this order will reverse credited cashback, 3-level commissions, and restore merchant inventory.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Audit Refund Reason</label>
              <textarea
                rows={3}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer cancelled order / defective product return..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRefundModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
