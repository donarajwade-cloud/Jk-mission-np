import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import { ShieldCheck, CheckCircle2, ShoppingBag, CreditCard, ArrowLeft } from 'lucide-react';

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

  if (cart.length === 0) {
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
          Please log in as a registered customer to track your order, receive cashback into your wallet, and credit referral points.
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
        onOrderSuccess(res.order.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
                  <p className="text-slate-600 mt-0.5">eSewa ID: <strong className="font-mono text-emerald-700">9800000000</strong> (JK Mission Nepal Official)</p>
                  <p className="text-[11px] text-slate-500">Please enter your transaction code / reference ID below after payment.</p>
                </div>
              )}
              {paymentMethod === 'khalti' && (
                <div>
                  <p className="font-bold text-slate-800">Transfer via Khalti:</p>
                  <p className="text-slate-600 mt-0.5">Khalti ID: <strong className="font-mono text-purple-700">9800000000</strong> (JK Mission Nepal Official)</p>
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

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Order Summary</h3>

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

            {/* Estimated Cashback Highlight */}
            {estimatedCashback > 0 && (
              <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Cashback You Will Earn:</span>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  +{formatNPR(estimatedCashback)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">{formatNPR(cartTotalNpr)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="text-amber-600">{formatNPR(cartTotalNpr)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : `Place Order (${formatNPR(cartTotalNpr)})`}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              By confirming, you agree to JK Mission Nepal&apos;s Terms and Cancellation Policies.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
