import React from 'react';
import { Order } from '../../types/index.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { X, Printer, CheckCircle, Clock, AlertTriangle, ShieldCheck, Ticket, Sparkles } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  showAdminCommissionSnapshot?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  onClose,
  showAdminCommissionSnapshot = false
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <span>Official Invoice Preview</span>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
              NEPAL
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  JK
                </div>
                <h1 className="text-xl font-black text-slate-900">JK Mission</h1>
              </div>
              <p className="text-xs text-slate-500">Smart Retail & Cashback Platform</p>
              <p className="text-xs text-slate-500">Website: https://jkmission.np.com</p>
              <p className="text-xs text-slate-500">New Road, Kathmandu, Nepal</p>
              <p className="text-xs text-slate-500">jk5172794@gmail.com • +977 9766133831 / +977 9815837905</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs tracking-wider uppercase mb-2">
                Tax Invoice / Receipt
              </span>
              <p className="text-sm font-black text-slate-900">#{order.orderNumber}</p>
              <p className="text-xs text-slate-500">Date: {formatNepaliDate(order.createdAt)}</p>
              <div className="mt-2 inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full border">
                {order.paymentStatus === 'verified' && (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Paid & Verified
                  </span>
                )}
                {order.paymentStatus === 'pending' && (
                  <span className="text-amber-800 bg-amber-50 border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Payment Pending
                  </span>
                )}
                {order.paymentStatus === 'refunded' && (
                  <span className="text-red-700 bg-red-50 border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Refunded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                Billed To (Customer):
              </p>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="font-mono">{formatNepalMobile(order.customerMobile)}</p>
              <p>Payment: {order.paymentMethod.toUpperCase()}</p>
              {order.paymentReference && (
                <p className="font-mono text-[11px] text-slate-500">Ref: {order.paymentReference}</p>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                Shipping Destination:
              </p>
              <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
              <p className="font-mono">{formatNepalMobile(order.shippingAddress.mobile)}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item & Merchant</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total (रु)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">{item.shopName}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatNPR(item.unitPriceNpr)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatNPR(item.totalNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">
                  {formatNPR(order.totalAmountNpr + (order.couponDiscountNpr || 0))}
                </span>
              </div>

              {order.couponDiscountNpr && order.couponDiscountNpr > 0 ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center space-x-1">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Coupon Discount ({order.couponCode}):</span>
                  </span>
                  <span>-{formatNPR(order.couponDiscountNpr)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600">
                <span>Standard Delivery:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base border-t border-slate-200 pt-2">
                <span>Grand Total Paid:</span>
                <span className="text-amber-600">{formatNPR(order.totalAmountNpr)}</span>
              </div>
            </div>
          </div>

          {/* Next Purchase Cashback Coupon Award Voucher (if unlocked on this order) */}
          {order.awardedCoupon && (
            <div className="border border-amber-300 bg-amber-50/70 p-4 rounded-2xl mb-6 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Next-Purchase Cashback Voucher Awarded</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                  Buyer 20% Cashback Coupon
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-amber-200">
                  {order.awardedCoupon.code}
                </span>
                <span className="text-emerald-700 font-extrabold text-sm">
                  {order.awardedCoupon.discountPercentage}% OFF Next Order
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Automatic cashback coupon unlocked from this verified order. Redeemable on next purchase.
              </p>
            </div>
          )}

          {/* Admin Commission Snapshot Audit (Only shown when requested by Admin) */}
          {showAdminCommissionSnapshot && (
            <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-2xl mb-6 text-xs">
              <div className="flex items-center space-x-2 font-bold text-amber-900 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Commission Audit Snapshot (Order ID: {order.id})</span>
              </div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/60">
                    <p className="font-bold text-slate-800">{item.productName}</p>
                    {item.commissionSnapshot ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] text-slate-600">
                        <div>Cashback: <strong className="text-emerald-600">{formatNPR(item.commissionSnapshot.cashbackNpr)}</strong></div>
                        <div>Level 1: <strong className="text-amber-700">{formatNPR(item.commissionSnapshot.level1Npr)}</strong></div>
                        <div>Level 2: <strong className="text-amber-700">{formatNPR(item.commissionSnapshot.level2Npr)}</strong></div>
                        <div>Level 3: <strong className="text-amber-700">{formatNPR(item.commissionSnapshot.level3Npr)}</strong></div>
                        <div>Shopkeeper: <strong className="text-blue-700">{formatNPR(item.commissionSnapshot.shopkeeperCommissionNpr)}</strong></div>
                        <div>Company Share: <strong className="text-slate-900">{formatNPR(item.commissionSnapshot.companyShareNpr)}</strong></div>
                        <div>Expenses: <strong>{formatNPR(item.commissionSnapshot.expensesNpr)}</strong></div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Commission snapshot pending completion.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400">
            <p>Thank you for shopping through JK Mission (https://jkmission.np.com).</p>
            <p>All items are sold by independent registered participating shops in Nepal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
