import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import { Package, AlertTriangle, Save, Check, RefreshCw } from 'lucide-react';

export const ShopkeeperInventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getMySubmissions();
      if (res.success && res.products) {
        setProducts(res.products);
        const map: Record<string, number> = {};
        res.products.forEach(p => { map[p.id] = p.stockQuantity; });
        setStockInputs(map);
      }
    } catch (err: any) {
      console.warn('Failed to load inventory:', err?.message || err);
      setLoadError(err?.message || 'Could not load inventory items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleStockUpdate = async (productId: string) => {
    const qty = stockInputs[productId];
    if (qty === undefined || qty < 0) return;

    setSavingId(productId);
    try {
      const res = await api.updateStock(productId, qty);
      if (res.success) {
        setSavedNotice(productId);
        setTimeout(() => setSavedNotice(null), 2000);
        await load();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Stock & Supply Control
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Inventory Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust stock quantities and maintain buffer thresholds to prevent out-of-stock cancellations.
        </p>
      </div>

      {loadError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline ml-4"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading inventory...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No items in your inventory yet</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Update Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatNPR(p.finalSellingPriceNpr)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-base text-slate-900">
                        {p.stockQuantity}
                      </td>
                      <td className="py-3 px-4">
                        {p.stockQuantity === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>Low Stock (&le;{p.lowStockThreshold})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                            Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={stockInputs[p.id] ?? p.stockQuantity}
                            onChange={(e) =>
                              setStockInputs({ ...stockInputs, [p.id]: parseInt(e.target.value, 10) || 0 })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center focus:outline-none focus:border-amber-400"
                          />
                          <button
                            onClick={() => handleStockUpdate(p.id)}
                            disabled={savingId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center space-x-1 transition-colors"
                          >
                            {savedNotice === p.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>{savingId === p.id ? 'Saving...' : 'Update'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
