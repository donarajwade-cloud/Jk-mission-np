import React, { useState, useEffect } from 'react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import { ShoppingBag, FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, Ticket, Sparkles } from 'lucide-react';

interface CustomerOrdersProps {
  onViewInvoice: (orderId: string) => void;
  onNavigateShop: () => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  onViewInvoice,
  onNavigateShop
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getMyOrders();
        if (res.success) setOrders(res.orders);
      } catch (err: any) {
        console.warn('Could not load customer orders:', err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Order History
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            My Orders & Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View order fulfillment, delivery statuses, and official tax invoices.
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
            <div key={n} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Discover authentic items from our participating stores in Nepal.
          </p>
          <button
            onClick={onNavigateShop}
            className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-slate-900 text-sm">#{o.orderNumber}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                      {formatNepaliDate(o.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Payment Method: <span className="font-bold text-slate-700 uppercase">{o.paymentMethod}</span>
                    {o.paymentReference && ` • Ref: ${o.paymentReference}`}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    o.orderStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : o.orderStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {o.orderStatus}
                  </span>

                  <button
                    onClick={() => onViewInvoice(o.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 text-xs">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      <span className="text-slate-400 text-[11px] block">{item.shopName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{item.quantity} × {formatNPR(item.unitPriceNpr)}</span>
                      <span className="font-black text-slate-900 block">{formatNPR(item.totalNpr)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon details */}
              {(o.couponCode || o.awardedCoupon) && (
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {o.couponCode && (
                    <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Coupon Applied: <strong className="font-mono">{o.couponCode}</strong> (-{formatNPR(o.couponDiscountNpr)})</span>
                    </div>
                  )}

                  {o.awardedCoupon && (
                    <div className="flex items-center space-x-1.5 text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Next Order Coupon: <strong className="font-mono text-slate-900">{o.awardedCoupon.code}</strong> ({o.awardedCoupon.discountPercentage}% OFF)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  {o.commissionProcessed && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cashback & Referral Points Distributed</span>
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Total Paid (NPR)</span>
                  <span className="text-base font-black text-slate-950">{formatNPR(o.totalAmountNpr)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
