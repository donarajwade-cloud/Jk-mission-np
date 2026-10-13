import React, { useState, useEffect } from 'react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Award,
  ShoppingBag,
  Store,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onProceedToCheckout?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onProceedToCheckout
}) => {
  const { addToCart } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getProduct(productId);
        if (res.success) setProduct(res.product);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-semibold">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Product Not Available</h2>
        <p className="text-xs text-slate-500 mb-4">This product might be awaiting approval or has been retired.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span>Verified Merchant</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span>Nepal Shipping</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <span>Instant Cashback</span>
            </div>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-600 mt-2">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-slate-800">{product.shopName}</span>
              </div>
            </div>

            {/* Price & Cashback Highlight Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Selling Price</span>
                  <span className="text-3xl font-black text-slate-950">
                    {formatNPR(product.finalSellingPriceNpr)}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {product.commissionSettings && (
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Eligible Customer Cashback:</span>
                  </span>
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                    +{product.commissionSettings.customerCashbackType === 'percentage'
                      ? `${product.commissionSettings.customerCashbackValue}%`
                      : formatNPR(product.commissionSettings.customerCashbackValue)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">{key}</span>
                      <strong className="text-slate-800">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Cart Button */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center space-x-2 border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-slate-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-slate-700 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all disabled:opacity-40"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart ({formatNPR(product.finalSellingPriceNpr * quantity)})</span>
            </button>

            {addedNotice && (
              <p className="text-xs font-bold text-emerald-600 text-center animate-in fade-in">
                ✓ Added to cart successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
