import React, { useState, useEffect } from 'react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  FileText,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronRight,
  ShieldCheck,
  Store,
  ExternalLink,
  Phone
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId?: string;
  initialOrder?: Order | null;
  onNavigate: (view: string, param?: string) => void;
  onViewInvoice: (orderId: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  initialOrder,
  onNavigate,
  onViewInvoice
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState<boolean>(!initialOrder && Boolean(orderId));
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOrderNum, setCopiedOrderNum] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    api.getOrder(orderId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError('Order details could not be found.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load order details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, initialOrder]);

  const handleCopy = (text: string, type: 'coupon' | 'order' | 'tracking') => {
    navigator.clipboard.writeText(text);
    if (type === 'coupon') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'order') {
      setCopiedOrderNum(true);
      setTimeout(() => setCopiedOrderNum(false), 2000);
    } else {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 space-y-6">
        <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          {error || 'We could not find the specified order or you might need to log in to view it.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Browse Products
          </button>
          <button
            onClick={() => onNavigate('customer-orders')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            My Orders
          </button>
        </div>
      </div>
    );
  }

  // Delivery Tracking Steps definition
  const steps: { key: string; label: string; description: string }[] = [
    { key: 'order_placed', label: 'Order Placed', description: 'Order created & verified by system' },
    { key: 'confirmed', label: 'Confirmed', description: 'Store accepted the purchase' },
    { key: 'processing', label: 'Packing', description: 'Item inspected & prepared for dispatch' },
    { key: 'shipped', label: 'Shipped', description: 'Handed over to courier partner' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Rider on route to your location' },
    { key: 'delivered', label: 'Delivered', description: 'Parcel received successfully' }
  ];

  const currentStatus = order.deliveryStatus || 'order_placed';
  const statusOrderIndex = ['order_placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStepIdx = statusOrderIndex.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled' || order.orderStatus === 'cancelled';

  return (
    <div className="w-full bg-slate-50/70 min-h-screen py-8 sm:py-12">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Full-Page Success Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide text-emerald-100 border border-white/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>ORDER CONFIRMED & REGISTERED</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Thank You for Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
                Your order has been officially received and is currently being processed. You can monitor the real-time shipping progress and courier updates below.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-xs space-y-2 shrink-0 md:min-w-[260px]">
              <div className="flex items-center justify-between">
                <span className="text-emerald-200">Order Number:</span>
                <div className="flex items-center space-x-1 font-mono font-black text-amber-300">
                  <span>#{order.orderNumber}</span>
                  <button
                    onClick={() => handleCopy(order.orderNumber, 'order')}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy Order Number"
                  >
                    {copiedOrderNum ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Placed Date:</span>
                <span className="font-semibold text-white">{formatNepaliDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Payment:</span>
                <span className="font-bold uppercase text-amber-300">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Payment Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  order.paymentStatus === 'verified' ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Delivery Tracking Timeline (Visual Stepper) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black text-slate-950">Real-Time Delivery Tracking</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live delivery status managed directly by merchant & master fulfillment center.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isCancelled
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : currentStatus === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Current Status: {isCancelled ? 'CANCELLED' : currentStatus.replace(/_/g, ' ')}
              </span>

              {order.estimatedDeliveryDate && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Est. Delivery: {order.estimatedDeliveryDate}</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {!isCancelled ? (
            <div className="py-4">
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-slate-100 -z-0 rounded-full" />
                <div
                  className="hidden md:block absolute top-1/2 left-6 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-400 -z-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (currentStepIdx / (steps.length - 1)) * 95))}%`
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                  {steps.map((st, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={st.key} className="flex flex-col items-center text-center p-3 rounded-2xl transition-all">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 shadow-xs transition-all ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-200 scale-110 font-black'
                              : isPassed
                              ? 'bg-emerald-500 text-white font-bold'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isPassed ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                        </div>
                        <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-amber-700 font-black' : isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {st.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {st.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <span className="font-bold">Notice:</span>
              <span>This order has been cancelled. If payment was made, your refund is being processed.</span>
            </div>
          )}

          {/* Courier & Tracking Partner Info Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Courier Logistics</span>
              <p className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>{order.courierName || 'Assigned Store Delivery Network'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tracking / AWB Number</span>
              {order.trackingNumber ? (
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-slate-900 text-sm tracking-wider">
                    {order.trackingNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(order.trackingNumber!, 'tracking')}
                    className="p-1 hover:text-amber-600 transition-colors"
                    title="Copy tracking code"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">Tracking number will be assigned upon dispatch</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Merchant Delivery Notes</span>
              <p className="text-slate-700 italic">
                {order.deliveryNotes || 'Standard door-to-door delivery within Nepal. Our rider will contact you prior to arrival.'}
              </p>
            </div>
          </div>
        </div>

        {/* Next-Purchase Cashback Coupon Showcase */}
        {order.awardedCoupon && (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Next-Purchase Cashback Coupon Unlocked!</h3>
                  <p className="text-xs text-amber-200">Exclusive reward credited to your customer account for placing this order.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400 text-slate-950 self-start sm:self-auto">
                Buyer 20% Cashback Coupon
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
              <div>
                <p className="text-3xl font-black text-amber-300">
                  {order.awardedCoupon.discountPercentage}% DISCOUNT
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Valid on your next store order across all authentic Nepali merchants.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 bg-slate-900/90 border border-slate-700 p-3 rounded-2xl flex items-center justify-between font-mono text-sm">
                  <span className="text-amber-400 font-black tracking-wider text-base">
                    {order.awardedCoupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.awardedCoupon!.code, 'coupon')}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-sans font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => onNavigate('customer-coupons')}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-white/20 transition-colors"
                >
                  <span>My Coupon Wallet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Grid: Shipping Destination & Items Ordered */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ordered Items List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-950 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)} Units)</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">{order.items.length} distinct products</span>
              </div>

              <div className="divide-y divide-slate-100 space-y-4 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      <ShoppingBag className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 text-xs text-amber-700 font-semibold mb-0.5">
                        <Store className="w-3 h-3" />
                        <span>{item.shopName}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.productName}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Quantity: <strong className="text-slate-800">{item.quantity}</strong> × {formatNPR(item.unitPriceNpr)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-950 block">{formatNPR(item.totalNpr)}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Delivery Included</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Timeline History */}
            {order.deliveryTimeline && order.deliveryTimeline.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-950 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Delivery Activity Log</span>
                </h3>
                <div className="space-y-3">
                  {order.deliveryTimeline.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start space-x-3 text-xs p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{step.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatNepaliDate(step.updatedAt)}</span>
                        </div>
                        {step.note && <p className="text-slate-600 mt-0.5">{step.note}</p>}
                        {step.courierName && (
                          <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Courier: {step.courierName} {step.trackingNumber ? `(${step.trackingNumber})` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Customer Shipping Details & Financial Breakdown */}
          <div className="space-y-6">
            
            {/* Customer Shipping Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-950 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Shipping & Delivery Destination</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Recipient Full Name</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{order.shippingAddress.fullName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Contact Phone Number</span>
                  <p className="font-mono font-bold text-slate-900 text-xs flex items-center space-x-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatNepalMobile(order.shippingAddress.mobile)}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Delivery Street / Landmark</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {order.shippingAddress.street}
                    {order.shippingAddress.landmark ? ` (Near ${order.shippingAddress.landmark})` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">City</span>
                    <span className="font-bold text-slate-900">{order.shippingAddress.city}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">District</span>
                    <span className="font-bold text-slate-900">{order.shippingAddress.district}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-950 pb-2 border-b border-slate-100">
                Payment & Price Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-900">
                    {formatNPR(
                      order.totalAmountNpr + (order.couponDiscountNpr || 0)
                    )}
                  </span>
                </div>

                {order.couponDiscountNpr ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({order.couponCode}):</span>
                    <span>-{formatNPR(order.couponDiscountNpr)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Delivery:</span>
                  <span className="font-bold text-emerald-600 uppercase">FREE DELIVERY</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-black text-slate-950">
                  <span>Total Amount Paid:</span>
                  <span className="text-amber-600 text-lg">{formatNPR(order.totalAmountNpr)}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="font-bold uppercase text-slate-800">{order.paymentMethod}</span>
                  </div>
                  {order.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction Ref:</span>
                      <span className="font-mono text-slate-700">{order.paymentReference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => onViewInvoice(order.id)}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Download / View Official Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('customer-orders')}
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View All My Orders</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('products')}
                    className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>Shop More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Satisfaction & Support Guarantee */}
            <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>JK Mission Nepal Guarantee</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Need support or want to reschedule delivery? Contact our 24/7 Kathmandu helpdesk at +977 1-4567890 or your assigned merchant directly.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
