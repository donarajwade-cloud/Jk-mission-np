import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Order, DeliveryStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  ShoppingBag,
  FileText,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  X,
  Phone,
  Package,
  Calendar,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ShopkeeperOrdersProps {
  onViewInvoice: (orderId: string) => void;
}

export const ShopkeeperOrders: React.FC<ShopkeeperOrdersProps> = ({ onViewInvoice }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Delivery status update modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('order_placed');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getShopOrders();
      if (res.success && res.orders) setOrders(res.orders);
    } catch (err: any) {
      console.warn('Could not load merchant orders:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleOpenDeliveryModal = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryStatus(order.deliveryStatus || 'order_placed');
    setCourierName(order.courierName || '');
    setTrackingNumber(order.trackingNumber || '');
    setDeliveryNotes(order.deliveryNotes || '');
    setEstimatedDeliveryDate(
      order.estimatedDeliveryDate ||
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleSaveDeliveryStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const res = await api.updateDeliveryStatus(selectedOrder.id, {
        deliveryStatus,
        courierName: courierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined
      });

      if (res.success) {
        setUpdateSuccess(true);
        await loadOrders();
        setTimeout(() => {
          setSelectedOrder(null);
          setUpdateSuccess(false);
        }, 900);
      } else {
        setUpdateError(res.message || 'Failed to update delivery status');
      }
    } catch (err: any) {
      setUpdateError(err?.message || 'Error occurred while updating delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status?: DeliveryStatus, fallbackStatus?: string) => {
    const s = status || fallbackStatus;
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
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Sales & Order Fulfillment
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Merchant Sales & Delivery Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store orders, view full customer shipping addresses, and update real-time delivery status for live customer tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
            {orders.length} Total Sales Orders
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading merchant orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No sales orders received yet</h3>
            <p className="text-xs text-slate-500 mt-1">Orders from customers will appear here as soon as they are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order # & Date</th>
                  <th className="py-3.5 px-4">Customer Info</th>
                  <th className="py-3.5 px-4">Full Shipping Details</th>
                  <th className="py-3.5 px-4">Items Sold</th>
                  <th className="py-3.5 px-4 text-right">Order Total</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Number & Placed Date */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-mono font-bold text-slate-900 text-sm">#{o.orderNumber}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatNepaliDate(o.createdAt)}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">
                        Pay: {o.paymentMethod}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-bold text-slate-900 text-sm">{o.customerName}</p>
                      <p className="text-xs text-slate-600 font-mono flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{formatNepalMobile(o.customerMobile)}</span>
                      </p>
                    </td>

                    {/* Full Customer Shipping Address */}
                    <td className="py-3.5 px-4 align-top text-slate-700 max-w-[240px]">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center space-x-1 text-slate-900 font-bold text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{o.shippingAddress.city}, {o.shippingAddress.district}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {o.shippingAddress.street}
                        </p>
                        {o.shippingAddress.landmark && (
                          <p className="text-[10px] text-amber-700 italic">
                            Near: {o.shippingAddress.landmark}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          Recipient: <strong className="text-slate-700">{o.shippingAddress.fullName}</strong>
                        </p>
                      </div>
                    </td>

                    {/* Items Sold */}
                    <td className="py-3.5 px-4 align-top text-slate-700">
                      <div className="space-y-1">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="line-clamp-1 text-xs">
                            <span className="font-bold text-amber-950">{it.quantity}x</span> {it.productName}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Order Total */}
                    <td className="py-3.5 px-4 align-top text-right font-black text-slate-900 text-sm">
                      {formatNPR(o.totalAmountNpr)}
                    </td>

                    {/* Delivery Status & Courier Info */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(o.deliveryStatus, o.orderStatus)}`}>
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

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <button
                          onClick={() => handleOpenDeliveryModal(o)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1 shadow-xs transition-colors"
                          title="Update delivery status and logistics details"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Update Delivery</span>
                        </button>

                        <button
                          onClick={() => onViewInvoice(o.id)}
                          className="w-full px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Status & Shipping Details Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base">
                    Update Delivery Status & Tracking
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order #{selectedOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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
                    <span>Customer Shipping Destination</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                    Nepal Delivery
                  </span>
                </div>

                <div className="text-slate-700 space-y-0.5 pt-1">
                  <p className="font-bold text-slate-900">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="font-mono text-slate-600">{formatNepalMobile(selectedOrder.shippingAddress.mobile)}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p className="font-medium text-slate-800">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}
                  </p>
                  {selectedOrder.shippingAddress.landmark && (
                    <p className="text-amber-700 italic text-[11px]">
                      Landmark: {selectedOrder.shippingAddress.landmark}
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
                  Updating this status will immediately reflect on the customer&apos;s live tracking screen and send an automated notification.
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
                  placeholder="e.g. Nepal Can Move, Pathao, Sundar Logistics"
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
                  Customer will use this tracking number to trace parcel progress.
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

              {/* Delivery Notes for Customer */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Delivery Notes / Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Dispatched from Kathmandu store. Rider will contact you on delivery."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {updateError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Delivery status updated successfully!</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black flex items-center space-x-1.5 shadow-md shadow-amber-300/40 disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{updating ? 'Saving Status...' : 'Save & Update Tracking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
