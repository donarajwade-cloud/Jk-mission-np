import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { ShoppingBag, FileText, CheckCircle, Clock } from 'lucide-react';

interface ShopkeeperOrdersProps {
  onViewInvoice: (orderId: string) => void;
}

export const ShopkeeperOrders: React.FC<ShopkeeperOrdersProps> = ({ onViewInvoice }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Sales & Fulfillment
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Merchant Sales Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review orders containing products sold by your store and customer delivery destinations.
        </p>
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
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Items Sold</th>
                  <th className="py-3 px-4 text-right">Order Total</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-center">Invoice</th>
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
                      <p className="text-[10px] text-slate-400 font-mono">{formatNepalMobile(o.customerMobile)}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{o.shippingAddress.city}, {o.shippingAddress.district}</p>
                      <span className="text-[10px] text-slate-400">{o.shippingAddress.street}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="line-clamp-1">
                          {it.quantity}x {it.productName}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
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
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewInvoice(o.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
