import React, { useState, useEffect } from 'react';
import { Order, DeliveryStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  ShoppingBag,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Ticket,
  Sparkles,
  Truck,
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface CustomerOrdersProps {
  onViewInvoice: (orderId: string) => void;
  onNavigateShop: () => void;
  onNavigateTracking?: (orderId: string) => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  onViewInvoice,
  onNavigateShop,
  onNavigateTracking
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await api.getMyOrders();
      if (res.success) setOrders(res.orders);
    } catch (err: any) {
      console.warn('Could not load customer orders:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrackingId(id);
    setTimeout(() => setCopiedTrackingId(null), 2000);
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

  const getStatusStepNumber = (status?: DeliveryStatus) => {
    switch (status) {
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'out_for_delivery': return 5;
      case 'delivered': return 6;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Order Fulfillment & Live Tracking
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            My Orders & Package Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your delivery status in real-time, inspect courier consignment numbers, and download official tax invoices.
          </p>
        </div>

        <button
          onClick={onNavigateShop}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop More Items</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Discover authentic items from our participating stores in Nepal and earn cashback!
          </p>
          <button
            onClick={onNavigateShop}
            className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const stepNum = getStatusStepNumber(o.deliveryStatus);
            const isCancelled = o.deliveryStatus === 'cancelled' || o.orderStatus === 'cancelled';

            return (
              <div
                key={o.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-amber-300 transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-black text-slate-900 text-base">#{o.orderNumber}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        {formatNepaliDate(o.createdAt)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(o.deliveryStatus, o.orderStatus)}`}>
                        {(o.deliveryStatus || o.orderStatus).replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Payment: <span className="font-bold text-slate-700 uppercase">{o.paymentMethod}</span>
                      {o.paymentReference && ` • Ref: ${o.paymentReference}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onNavigateTracking && (
                      <button
                        onClick={() => onNavigateTracking(o.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Live Tracking & Details</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewInvoice(o.id)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Tax Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Tracking Bar */}
                {!isCancelled ? (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <Truck className="w-4 h-4 text-amber-500" />
                        <span>Package Status: <span className="text-amber-700 uppercase">{(o.deliveryStatus || 'order_placed').replace(/_/g, ' ')}</span></span>
                      </div>
                      {o.estimatedDeliveryDate && (
                        <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Est. Delivery: <strong>{o.estimatedDeliveryDate}</strong></span>
                        </span>
                      )}
                    </div>

                    {/* Progress Dots */}
                    <div className="grid grid-cols-6 gap-1 pt-1">
                      {['Placed', 'Confirmed', 'Packing', 'Shipped', 'Out', 'Delivered'].map((label, idx) => {
                        const active = stepNum >= idx + 1;
                        const isCurrent = stepNum === idx + 1;

                        return (
                          <div key={label} className="text-center space-y-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-amber-400 ring-2 ring-amber-200'
                                  : active
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span className={`text-[10px] block font-bold truncate ${
                              isCurrent ? 'text-amber-700' : active ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Courier & Shipping notes if available */}
                    {(o.courierName || o.trackingNumber || o.deliveryNotes) && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3">
                          {o.courierName && (
                            <span className="text-slate-700 font-medium">
                              Courier: <strong className="text-slate-900">{o.courierName}</strong>
                            </span>
                          )}
                          {o.trackingNumber && (
                            <div className="flex items-center space-x-1 font-mono text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                              <span>AWB: {o.trackingNumber}</span>
                              <button
                                onClick={() => handleCopy(o.trackingNumber!, o.id)}
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                                title="Copy AWB Tracking Number"
                              >
                                {copiedTrackingId === o.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {o.deliveryNotes && (
                          <p className="text-[11px] text-slate-500 italic">
                            &quot;{o.deliveryNotes}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>This order has been cancelled.</span>
                  </div>
                )}

                {/* Shipping Destination & Ordered Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  
                  {/* Shipping Address */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>Delivery Address</span>
                    </span>
                    <p className="font-bold text-slate-900">{o.shippingAddress.fullName}</p>
                    <p className="text-slate-600">{o.shippingAddress.street}</p>
                    <p className="font-medium text-slate-800">{o.shippingAddress.city}, {o.shippingAddress.district}</p>
                    {o.shippingAddress.landmark && (
                      <p className="text-[10px] text-amber-700 italic">Near: {o.shippingAddress.landmark}</p>
                    )}
                  </div>

                  {/* Items Summary (2 cols) */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Ordered Products ({o.items.length})
                    </span>
                    <div className="space-y-1.5">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900">{item.productName}</span>
                            <span className="text-slate-400 text-[10px] block">{item.shopName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{item.quantity} × {formatNPR(item.unitPriceNpr)}</span>
                            <span className="font-black text-slate-900 block">{formatNPR(item.totalNpr)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coupon & Rewards Section */}
                {(o.couponCode || o.awardedCoupon) && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {o.couponCode && (
                      <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Coupon Applied: <strong className="font-mono">{o.couponCode}</strong> (-{formatNPR(o.couponDiscountNpr)})</span>
                      </div>
                    )}

                    {o.awardedCoupon && (
                      <div className="flex items-center space-x-1.5 text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Next Purchase Coupon: <strong className="font-mono text-slate-900">{o.awardedCoupon.code}</strong> ({o.awardedCoupon.discountPercentage}% OFF)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Total */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {o.commissionProcessed && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cashback & Referral Points Credited</span>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Total Paid (NPR)</span>
                    <span className="text-lg font-black text-slate-950">{formatNPR(o.totalAmountNpr)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
