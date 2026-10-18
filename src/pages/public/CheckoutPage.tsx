import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import { CashbackCoupon, Order } from '../../types/index.ts';
import {
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  ArrowLeft,
  Ticket,
  Copy,
  Check,
  Sparkles,
  X,
  Gift,
  AlertCircle,
  FileText
} from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string) => void;
  onNavigateLogin: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onOrderSuccess,
  onNavigateLogin
}) => {
  const { user, role, cart, cartTotalNpr, clearCart } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [district, setDistrict] = useState('Kathmandu');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank_transfer' | 'cash_on_delivery'>('esewa');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cashback Coupon States
  const [availableCoupons, setAvailableCoupons] = useState<CashbackCoupon[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    level: 1 | 2 | 3;
    discountNpr: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Post-Order Celebration Modal with Awarded Next-Purchase Coupon
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [copiedAwardCode, setCopiedAwardCode] = useState(false);

  // Load user's available coupons
  useEffect(() => {
    if (user && role === 'customer') {
      api.getMyCoupons()
        .then(res => {
          if (res.success && res.coupons) {
            const usable = res.coupons.filter(c => c.status === 'available');
            setAvailableCoupons(usable);
          }
        })
        .catch(err => {
          console.warn('Could not load user coupons:', err);
        });
    }
  }, [user, role]);

  if (cart.length === 0 && !successOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Please add products before proceeding to checkout.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (!user || role !== 'customer') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-900">Customer Account Required</h2>
        <p className="text-xs text-slate-600 mt-2 mb-6">
          Please log in as a registered customer to track your order, receive cashback coupons into your account, and earn referral commissions.
        </p>
        <div className="space-y-2">
          <button
            onClick={onNavigateLogin}
            className="w-full py-3 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
          >
            Log In to Continue
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 text-slate-600 font-bold text-xs hover:text-slate-900"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // Estimated Cashback
  const estimatedCashback = cart.reduce((sum, item) => {
    const s = item.product.commissionSettings;
    if (!s) return sum;
    const unitCb = s.customerCashbackType === 'percentage'
      ? (item.product.finalSellingPriceNpr * s.customerCashbackValue) / 100
      : s.customerCashbackValue;
    return sum + unitCb * item.quantity;
  }, 0);

  // Validate and apply coupon
  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = (codeToApply || couponInput).trim();
    if (!targetCode) {
      setCouponError('Please enter or select a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await api.validateCoupon(targetCode, cartTotalNpr);
      if (res.success && res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountPercentage: res.coupon.discountPercentage,
          level: res.coupon.level,
          discountNpr: res.discountNpr
        });
        setCouponInput(res.coupon.code);
      } else {
        setCouponError(res.error || 'Coupon code is invalid or does not meet minimum order requirement');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const couponDiscountNpr = appliedCoupon?.discountNpr || 0;
  const finalPayableNpr = Math.max(0, cartTotalNpr - couponDiscountNpr);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !mobile.trim() || !street.trim() || !city.trim() || !district.trim()) {
      setError('Please provide a complete shipping address and recipient mobile number');
      return;
    }

    if (paymentMethod !== 'cash_on_delivery' && !paymentReference.trim()) {
      setError('Please provide your payment reference number / transaction ID (or enter "PENDING" if transferring now)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createOrder({
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        couponCode: appliedCoupon?.code || undefined,
        shippingAddress: {
          fullName,
          mobile,
          street,
          city,
          district
        }
      });

      if (res.success && res.order) {
        clearCart();
        setSuccessOrder(res.order);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAwardedCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedAwardCode(true);
    setTimeout(() => setCopiedAwardCode(false), 3000);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping</span>
      </button>

      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Secure Checkout (Nepal)
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Order Confirmation & Payment
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">1. Shipping Address in Nepal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Mobile (+977)</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                  placeholder="+97798XXXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Ward No. 4, New Road near Pipalbot"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Municipality</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Kathmandu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Kathmandu"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">2. Payment Method (NPR)</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { id: 'esewa', label: 'eSewa Wallet', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { id: 'khalti', label: 'Khalti Wallet', color: 'text-purple-700', bg: 'bg-purple-50' },
                { id: 'bank_transfer', label: 'Bank Transfer', color: 'text-blue-700', bg: 'bg-blue-50' },
                { id: 'cash_on_delivery', label: 'Cash on Delivery', color: 'text-slate-800', bg: 'bg-slate-50' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-2 transition-all ${
                    paymentMethod === m.id
                      ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as any)}
                    className="text-amber-500"
                  />
                  <span className={`font-bold ${m.color}`}>{m.label}</span>
                </label>
              ))}
            </div>

            {/* Payment Details info box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              {paymentMethod === 'esewa' && (
                <div>
                  <p className="font-bold text-slate-800">Transfer via eSewa:</p>
                  <p className="text-slate-600 mt-0.5">eSewa ID: <strong className="font-mono text-emerald-700">9766133831 / 9815837905</strong> (JK Mission Official)</p>
                  <p className="text-[11px] text-slate-500">Please enter your transaction code / reference ID below after payment.</p>
                </div>
              )}
              {paymentMethod === 'khalti' && (
                <div>
                  <p className="font-bold text-slate-800">Transfer via Khalti:</p>
                  <p className="text-slate-600 mt-0.5">Khalti ID: <strong className="font-mono text-purple-700">9766133831 / 9815837905</strong> (JK Mission Official)</p>
                  <p className="text-[11px] text-slate-500">Please enter your transaction reference ID below after completing transfer.</p>
                </div>
              )}
              {paymentMethod === 'bank_transfer' && (
                <div>
                  <p className="font-bold text-slate-800">Commercial Bank Transfer:</p>
                  <p className="text-slate-600 mt-0.5">Bank: <strong>Nabil Bank Limited</strong> • A/C Name: <strong>JK Mission Nepal Pvt. Ltd.</strong></p>
                  <p className="text-slate-600">A/C Number: <strong className="font-mono text-slate-800">01201017500123</strong> (Branch: New Road)</p>
                  <p className="text-[11px] text-slate-500">Enter deposit voucher number or mobile banking transfer reference.</p>
                </div>
              )}
              {paymentMethod === 'cash_on_delivery' && (
                <div>
                  <p className="font-bold text-slate-800">Cash on Delivery (COD):</p>
                  <p className="text-slate-600">Pay cash in NPR upon delivery to your doorstep.</p>
                </div>
              )}

              {paymentMethod !== 'cash_on_delivery' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Transaction Reference / ID / Remarks
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. TXN98721345 or eSewa Ref ID"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Cashback Coupons */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Order Summary</h3>

            {/* Cart Items */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-slate-500 text-[10px]">
                      {item.quantity} × {formatNPR(item.product.finalSellingPriceNpr)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatNPR(item.product.finalSellingPriceNpr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Section: Cashback Coupon Redemption */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-950">
                <Ticket className="w-4 h-4 text-amber-700" />
                <span>Apply Cashback Coupon</span>
              </div>

              {/* If already applied */}
              {appliedCoupon ? (
                <div className="bg-white p-3 rounded-xl border border-emerald-300 flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        Level {appliedCoupon.level} Coupon Applied
                      </span>
                      <span className="font-mono text-xs font-black text-slate-900">
                        {appliedCoupon.code}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-700">
                      -{formatNPR(appliedCoupon.discountNpr)} ({appliedCoupon.discountPercentage}% Discount)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                    title="Remove Coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Coupon Input Box */
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError(null);
                      }}
                      placeholder="Enter Coupon Code (e.g. JKMCB-L1-...)"
                      className="grow px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono uppercase font-bold text-slate-900 placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-xs"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] font-bold text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}

                  {/* Quick Select from Available Coupons */}
                  {availableCoupons.length > 0 && (
                    <div className="pt-2 border-t border-amber-200/50">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1.5">
                        Your Available Cashback Coupons (Click to Apply):
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCouponInput(c.code);
                              handleApplyCoupon(c.code);
                            }}
                            className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200 transition-all flex items-center justify-between text-xs group"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-900">
                                L{c.level}
                              </span>
                              <span className="font-mono font-bold text-slate-900 text-[11px]">
                                {c.code}
                              </span>
                              <span className="text-emerald-700 font-extrabold text-[11px]">
                                {c.discountPercentage}% OFF
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 group-hover:underline">
                              Apply
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estimated Cashback Highlight */}
            {estimatedCashback > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Direct Purchase Cashback Earned:</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-black">
                  +{formatNPR(estimatedCashback)}
                </span>
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">{formatNPR(cartTotalNpr)}</span>
              </div>

              {couponDiscountNpr > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Cashback Coupon Discount:</span>
                  <span>-{formatNPR(couponDiscountNpr)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-950 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="text-amber-600">{formatNPR(finalPayableNpr)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Processing Order...' : `Place Order (${formatNPR(finalPayableNpr)})`}</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              By confirming, you agree to JK Mission Nepal&apos;s Terms and Cancellation Policies.
            </p>
          </div>
        </div>
      </form>

      {/* Post-Order Celebration Modal with Awarded Next-Purchase Coupon */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-7 sm:p-8">
            {/* Header Success Icon */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">
                Order #{successOrder.orderNumber} Confirmed!
              </h2>
              <p className="text-xs text-slate-500">
                Thank you for your purchase. Your payment reference and invoice have been registered.
              </p>
            </div>

            {/* Awarded Next-Purchase Cashback Coupon Showcase */}
            {successOrder.awardedCoupon && (
              <div className="bg-linear-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-5 rounded-2xl border border-amber-500/40 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-300">
                      Next-Purchase Cashback Coupon Unlocked!
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                    Level {successOrder.awardedCoupon.level} Tier
                  </span>
                </div>

                <div>
                  <p className="text-2xl font-black text-white">
                    {successOrder.awardedCoupon.discountPercentage}% DISCOUNT
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Admin automatic reward for completing an order at this level. Valid on your next purchase!
                  </p>
                </div>

                {/* Coupon Code Pill with Copy */}
                <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span className="text-amber-400 font-extrabold text-sm tracking-wider">
                    {successOrder.awardedCoupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAwardedCoupon(successOrder.awardedCoupon!.code)}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-sans font-bold text-xs flex items-center space-x-1 transition-all"
                  >
                    {copiedAwardCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400">
                  This coupon has also been saved to your account in &quot;My Coupons&quot; for 30 days.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onOrderSuccess(successOrder.id)}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>View Official Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
