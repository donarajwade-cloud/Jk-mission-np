import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { CashbackCoupon, CashbackCouponRule } from '../../types/index.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import {
  Ticket,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Gift
} from 'lucide-react';

interface CustomerCouponsProps {
  onNavigateShop?: () => void;
}

export const CustomerCoupons: React.FC<CustomerCouponsProps> = ({ onNavigateShop }) => {
  const [coupons, setCoupons] = useState<CashbackCoupon[]>([]);
  const [rule, setRule] = useState<CashbackCouponRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<'available' | 'used' | 'all'>('available');

  const loadCoupons = async () => {
    try {
      const res = await api.getMyCoupons();
      if (res.success) {
        setCoupons(res.coupons || []);
        if (res.rule) setRule(res.rule);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredCoupons = coupons.filter(c => {
    if (filter === 'available') return c.status === 'available';
    if (filter === 'used') return c.status === 'used';
    return true;
  });

  const availableCount = coupons.filter(c => c.status === 'available').length;
  const usedCount = coupons.filter(c => c.status === 'used').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Rewarding Every Purchase
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            My Cashback Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Every time you purchase a product, you unlock an exclusive 20% Cashback Coupon to save on your next purchase! Sirf product khareedne wale customer ko 20% cashback coupon milta hai.
          </p>
        </div>

        {onNavigateShop && (
          <button
            onClick={onNavigateShop}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop & Redeem Coupons</span>
          </button>
        )}
      </div>

      {/* Exclusive 20% Buyer Cashback Coupon Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Exclusive 20% Customer Cashback Coupon
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                  Every Purchase
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Buy any product on JK Mission and automatically receive a guaranteed 20% OFF coupon for your next order!
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center space-x-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flat 20% Buyer Discount</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Step 1. Purchase</span>
            <p className="text-sm font-bold text-white">Buy Any Store Product</p>
            <p className="text-[11px] text-slate-400">Place an order for genuine groceries, teas, or essentials</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300">Step 2. Instant Reward</span>
            <p className="text-sm font-bold text-amber-300">Get 20% OFF Coupon</p>
            <p className="text-[11px] text-slate-400">Automatic 20% coupon code generated in your wallet</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Step 3. Save</span>
            <p className="text-sm font-bold text-amber-400">Redeem on Next Order</p>
            <p className="text-[11px] text-slate-400">Apply coupon at checkout for direct 20% savings</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('available')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'available'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Available Coupons ({availableCount})
        </button>
        <button
          onClick={() => setFilter('used')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'used'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Redeemed / Used ({usedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({coupons.length})
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading your cashback coupons...</div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-sm">
            {filter === 'available' ? 'No Available Coupons Yet' : 'No Coupons Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'available'
              ? 'Buy any product from our store to automatically receive your next-purchase Cashback Coupon!'
              : 'Coupons will appear here as you buy products and redeem your discounts.'}
          </p>
          {onNavigateShop && (
            <button
              onClick={onNavigateShop}
              className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl mt-2 inline-flex items-center space-x-1.5"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.map((coupon) => {
            const isAvailable = coupon.status === 'available';
            const isUsed = coupon.status === 'used';
            const isExpired = coupon.status === 'expired';

            return (
              <div
                key={coupon.id}
                className={`relative rounded-3xl p-6 border shadow-xs transition-all overflow-hidden ${
                  isAvailable
                    ? 'bg-white border-amber-300 hover:border-amber-400 hover:shadow-md'
                    : 'bg-slate-50/80 border-slate-200 opacity-80'
                }`}
              >
                {/* Buyer 20% Cashback Coupon Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                    Buyer 20% Cashback Coupon
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : isUsed
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isAvailable ? 'Active' : isUsed ? 'Redeemed' : 'Expired'}
                  </span>
                </div>

                {/* Percentage & Title */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-950 tracking-tight">
                      {coupon.discountPercentage}%
                    </span>
                    <span className="text-xs font-black uppercase text-amber-700">Cashback OFF</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Min order: रु {coupon.minOrderAmountNpr}
                    {coupon.maxDiscountNpr ? ` • Max discount: रु ${coupon.maxDiscountNpr}` : ''}
                  </p>
                </div>

                {/* Coupon Code Block */}
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between font-mono text-xs font-bold mb-3 border border-slate-800">
                  <span className="text-amber-400 tracking-wider font-extrabold">{coupon.code}</span>
                  {isAvailable && (
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center space-x-1"
                      title="Copy coupon code"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] text-slate-300">Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expiry & Source */}
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {isUsed
                        ? `Used on ${formatNepaliDate(coupon.usedAt || coupon.createdAt)}`
                        : `Valid until ${formatNepaliDate(coupon.expiresAt)}`}
                    </span>
                  </div>
                  {coupon.sourceOrderNumber && (
                    <p className="text-slate-400 text-[10px]">
                      Earned on order: <strong className="font-mono text-slate-600">#{coupon.sourceOrderNumber}</strong>
                    </p>
                  )}
                  {coupon.discountAppliedNpr && coupon.discountAppliedNpr > 0 && (
                    <p className="text-emerald-700 font-bold text-[11px]">
                      Saved: रु {coupon.discountAppliedNpr}
                    </p>
                  )}
                </div>

                {/* Direct Action */}
                {isAvailable && onNavigateShop && (
                  <button
                    onClick={() => {
                      handleCopy(coupon.code);
                      onNavigateShop();
                    }}
                    className="w-full mt-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-amber-200"
                  >
                    <span>Copy & Use on Purchase</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
