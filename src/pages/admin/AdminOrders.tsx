import React, { useState, useEffect } from 'react';
import { Order, DeliveryStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  RotateCcw,
  FileText,
  AlertTriangle,
  Play,
  Truck,
  MapPin,
  X,
  Phone,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AdminOrdersProps {
  onViewInvoice: (orderId: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ onViewInvoice }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Refund state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delivery status & shipping update modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('order_placed');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [updatingDelivery, setUpdatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

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

  const handleOpenDeliveryModal = (order: Order) => {
    setDeliveryModalOrder(order);
    setDeliveryStatus(order.deliveryStatus || 'order_placed');
    setCourierName(order.courierName || '');
    setTrackingNumber(order.trackingNumber || '');
    setDeliveryNotes(order.deliveryNotes || '');
    setEstimatedDeliveryDate(
      order.estimatedDeliveryDate ||
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setDeliveryError(null);
    setDeliverySuccess(false);
  };

  const handleSaveDeliveryStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalOrder) return;

    setUpdatingDelivery(true);
    setDeliveryError(null);
    setDeliverySuccess(false);

    try {
      const res = await api.updateDeliveryStatus(deliveryModalOrder.id, {
        deliveryStatus,
        courierName: courierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined
      });

      if (res.success) {
        setDeliverySuccess(true);
        await load();
        setTimeout(() => {
          setDeliveryModalOrder(null);
          setDeliverySuccess(false);
        }, 900);
      } else {
        setDeliveryError(res.message || 'Failed to update delivery status');
      }
    } catch (err: any) {
      setDeliveryError(err?.message || 'Error occurred while saving status');
    } finally {
      setUpdatingDelivery(false);
    }
  };

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

  const getStatusBadge = (status?: DeliveryStatus, fallback?: string) => {
    const s = status || fallback;
    switch (s) {
      case 'delivered':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'confirmed':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const courierPresets = ['Nepal Can Move', 'Pathao Express', 'Sundar Logistics', 'Store Rider', 'Aramex Nepal', 'Self Pickup'];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Fulfillment & Commission Execution
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Admin Orders & Shipping Dispatch Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor customer shipping addresses, update delivery tracking milestones, verify payments, and execute commission distributions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-amber-300 font-black text-xs">
            {orders.length} Master Orders
          </span>
        </div>
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
                  <th className="py-3 px-4">Shipping Destination</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Total (NPR)</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Commissions</th>
                  <th className="py-3 px-4 text-center">Fulfillment & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order # */}
                    <td className="py-3 px-4 align-top">
                      <p className="font-bold text-slate-900 font-mono text-xs">#{o.orderNumber}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatNepaliDate(o.createdAt)}</span>
                      <span className="text-[10px] text-slate-500 block font-medium mt-1">
                        {o.items.length} item(s)
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 align-top">
                      <p className="font-bold text-slate-800">{o.customerName}</p>
                      <span className="font-mono text-[10px] text-slate-500 block">{formatNepalMobile(o.customerMobile)}</span>
                    </td>

                    {/* Full Customer Shipping Address */}
                    <td className="py-3 px-4 align-top max-w-[220px]">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 text-[11px]">
                        <p className="font-bold text-slate-900 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{o.shippingAddress.city}, {o.shippingAddress.district}</span>
                        </p>
                        <p className="text-slate-600 line-clamp-1">{o.shippingAddress.street}</p>
                        {o.shippingAddress.landmark && (
                          <p className="text-[10px] text-amber-700 italic">Near: {o.shippingAddress.landmark}</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Recv: {o.shippingAddress.fullName}
                        </p>
                      </div>
                    </td>

                    {/* Payment Info */}
                    <td className="py-3 px-4 align-top">
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

                    {/* Total */}
                    <td className="py-3 px-4 align-top text-right font-black text-slate-900 text-sm">
                      {formatNPR(o.totalAmountNpr)}
                    </td>

                    {/* Delivery Status & Tracking */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(o.deliveryStatus, o.orderStatus)}`}>
                          {(o.deliveryStatus || o.orderStatus).replace(/_/g, ' ')}
                        </span>

                        {o.courierName && (
                          <p className="text-[10px] text-slate-600 font-medium flex items-center space-x-1">
                            <Truck className="w-3 h-3 text-amber-500" />
                            <span>{o.courierName}</span>
                          </p>
                        )}

                        {o.trackingNumber && (
                          <p className="text-[10px] font-mono text-slate-500">
                            AWB: {o.trackingNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Commissions */}
                    <td className="py-3 px-4 align-top text-[11px]">
                      {o.commissionProcessed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Distributed</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">Pending</span>
                      )}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3 px-4 align-top text-center">
                      <div className="flex flex-col gap-1 min-w-[130px]">
                        
                        {/* Update Delivery Status Button */}
                        <button
                          onClick={() => handleOpenDeliveryModal(o)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1 shadow-xs transition-colors"
                          title="Update customer delivery status and courier tracking"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Update Delivery</span>
                        </button>

                        {/* Verify Payment */}
                        {o.paymentStatus !== 'verified' && o.paymentStatus !== 'refunded' && (
                          <button
                            onClick={() => handleVerifyPayment(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
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
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1"
                            title="Release Cashback & 3-Level Commissions"
                          >
                            <Play className="w-3 h-3" />
                            <span>Release Comm</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          {/* View Invoice */}
                          <button
                            onClick={() => onViewInvoice(o.id)}
                            className="flex-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
                              className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                              title="Refund Order"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Delivery Status & Tracking Update Modal */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base">
                    Admin Delivery & Shipping Control
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order #{deliveryModalOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeliveryModalOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliveryStatus} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Customer Shipping Address Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Customer Delivery Destination</span>
                  </span>
                  <span className="text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded">
                    Verified Customer
                  </span>
                </div>

                <div className="text-slate-700 space-y-0.5 pt-1">
                  <p className="font-bold text-slate-900">{deliveryModalOrder.shippingAddress.fullName}</p>
                  <p className="font-mono text-slate-600">{formatNepalMobile(deliveryModalOrder.shippingAddress.mobile)}</p>
                  <p>{deliveryModalOrder.shippingAddress.street}</p>
                  <p className="font-medium text-slate-800">
                    {deliveryModalOrder.shippingAddress.city}, {deliveryModalOrder.shippingAddress.district}
                  </p>
                  {deliveryModalOrder.shippingAddress.landmark && (
                    <p className="text-amber-700 italic text-[11px]">
                      Landmark: {deliveryModalOrder.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Status Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Choose Live Delivery Status *
                </label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-xs"
                >
                  <option value="order_placed">⏳ Order Placed (Received)</option>
                  <option value="confirmed">👍 Confirmed by Store</option>
                  <option value="processing">📦 Packing & Processing</option>
                  <option value="shipped">🚚 Shipped (Handed over to Courier)</option>
                  <option value="out_for_delivery">📍 Out for Delivery (Rider en route)</option>
                  <option value="delivered">✅ Delivered Successfully</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Status changes will immediately reflect on user tracking and push notifications.
                </p>
              </div>

              {/* Courier Partner Selection & Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Courier / Logistics Partner Name
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {courierPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setCourierName(preset)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        courierName === preset
                          ? 'bg-amber-400 border-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Nepal Can Move, Pathao Express, Sundar Logistics"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* Tracking / Consignment (AWB) Number */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tracking / Consignment / AWB Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. NCM-883921 / PAT-904221"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-amber-400 text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Allows the user to trace their parcel live on the tracking page.
                </p>
              </div>

              {/* Estimated Delivery Date */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Delivery Notes / Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Dispatched from central hub. Tracking number active on courier portal."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {deliveryError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deliveryError}</span>
                </div>
              )}

              {deliverySuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Delivery status updated successfully!</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingDelivery}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black flex items-center space-x-1.5 shadow-md shadow-amber-300/40 disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{updatingDelivery ? 'Saving...' : 'Save & Update Tracking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
