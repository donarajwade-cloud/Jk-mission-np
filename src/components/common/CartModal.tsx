import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatNPR } from '../../utils/format.ts';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, cartTotalNpr, updateCartQuantity, removeFromCart, clearCart } = useAuth();

  if (!isOpen) return null;

  // Estimated cashback calculation across items in cart
  const estimatedCashbackTotal = cart.reduce((sum, item) => {
    const settings = item.product.commissionSettings;
    if (!settings) return sum;
    let unitCb = 0;
    if (settings.customerCashbackType === 'percentage') {
      unitCb = (item.product.finalSellingPriceNpr * settings.customerCashbackValue) / 100;
    } else {
      unitCb = settings.customerCashbackValue;
    }
    return sum + unitCb * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Shopping Cart</h3>
              <p className="text-xs text-slate-500">{cart.length} unique items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-amber-100/60 flex items-center justify-center text-amber-500 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-700 text-base mb-1">Your cart is empty</p>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Explore authentic Nepali products and earn instant cashback on your orders!
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 transition-all shadow-xs"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-amber-700 font-semibold truncate">{product.shopName}</p>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      {formatNPR(product.finalSellingPriceNpr)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stockQuantity}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-700 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-right pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-600 font-semibold transition-colors"
                >
                  Clear all items
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            {estimatedCashbackTotal > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Estimated Customer Cashback:</span>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  +{formatNPR(estimatedCashbackTotal)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Order Subtotal:</span>
              <span className="font-black text-lg text-slate-900">
                {formatNPR(cartTotalNpr)}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-amber-300/40 hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
