"use client";

import { useCart } from "@/lib/CartContext";
import { trackBeginCheckout } from "@/lib/tracking";

import { X, Minus, Plus, ShoppingBag, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const {
    cart,
    totalPrice,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    decreaseQuantity,
    addToCart,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <CartDrawerInner />
  );
}

function CartDrawerInner() {
  const {
    cart,
    totalPrice,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    decreaseQuantity,
    addToCart,
  } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.classList.add("drawer-open");
    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-700"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-background shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col h-full border-l border-white/5 animate-in slide-in-from-right duration-700 light:bg-white light:border-black/5">
        <div className="p-8 flex items-center justify-between border-b border-white/5 light:border-black/10">
          <div className="flex items-center gap-4">
            <ShoppingBag size={18} className="text-white light:text-black" />
            <h2 className="text-xl font-black uppercase tracking-luxury text-white light:text-black">
              Your Selection
            </h2>
            <span className="text-[10px] font-bold text-white/100 bg-white/10 px-2 py-1 rounded-full light:text-black light:bg-black/10">
              {cart.length}
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-3 text-white/100 hover:text-white transition-colors group min-h-[44px] min-w-[44px] flex items-center justify-center light:text-black"
            aria-label="Close basket"
          >
            <X
              size={24}
              className="group-hover:rotate-90 transition-transform duration-500"
            />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-card/50 light:border-black/10 light:bg-black/[0.03]">
                <ShoppingBag size={40} className="text-white/10 light:text-black/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-luxury text-white light:text-black">
                  Catalogue Empty
                </h3>
                <p className="text-white/30 text-[11px] font-medium tracking-wide uppercase light:text-black/30">
                  Discover our heritage collection
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors light:hover:text-black"
              >
                Start Shopping →
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex gap-6 group"
                >
                  <div className="relative h-28 w-24 flex-shrink-0 bg-white/90 premium-border overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-grow flex flex-col pt-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-premium text-white group-hover:text-accent transition-colors light:text-black">
                        {item.title}
                      </h4>
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.selectedSize)
                        }
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[9px] text-white/80 uppercase font-black tracking-luxury mb-auto light:text-black/70">
                      Size: {item.selectedSize}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-white/5 bg-black/40 light:border-black/10 light:bg-black/5">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.id, item.selectedSize)
                          }
                          className="p-3 text-white/20 hover:text-white active:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center light:text-black/30 light:hover:text-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-[10px] font-black text-white light:text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item, item.selectedSize)}
                          className="p-3 text-white/20 hover:text-white active:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center light:text-black/30 light:hover:text-black"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-white light:text-black">
                        £{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-white/5 bg-card/30 space-y-3 light:border-black/10 light:bg-black/[0.03]">
            <div className="flex justify-between items-center">
              <span className=" text-3xl font-bold  text-white light:text-black">Subtotal:</span>
              <span className="text-2xl font-black text-white light:text-black">
                £{totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="w-full text-center">
              <Link
                href="/checkout"
                onClick={() => {
                  trackBeginCheckout(cart, totalPrice);
                  setIsDrawerOpen(false);
                }}
                className="btn-premium text-base flex items-center justify-center gap-3 w-full text-center"
              >
                <Lock size={18} />
                Secure Checkout
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2  grayscale">
              <CheckCircle size={14} className="text-white light:text-black" />
              <span className="text-sm font-light text-white tracking-widest uppercase light:text-black">
                30-DAY SATISFACTION GUARANTEE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
