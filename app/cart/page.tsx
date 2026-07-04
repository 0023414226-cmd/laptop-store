"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, Ticket, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const {
    items,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const total = getCartTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError("");
    setValidatingCoupon(true);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderValue: subtotal,
        }),
      });

      if (res.ok) {
        const couponData = await res.json();
        applyCoupon(couponData);
        setCouponCode("");
      } else {
        const err = await res.json();
        setCouponError(err.error || "Mã giảm giá không hợp lệ.");
      }
    } catch (err) {
      setCouponError("Đã xảy ra lỗi kết nối.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 text-slate-100">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-400">Hãy lướt xem các mẫu laptop và tìm chiếc phù hợp nhất cho mình.</p>
        </div>
        <Link
          href="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-md transition"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      <h1 className="text-2xl font-extrabold tracking-tight">Giỏ Hàng Của Bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const hasDiscount = item.discountPrice !== null;
            const itemPrice = hasDiscount ? item.discountPrice : item.price;
            
            return (
              <div
                key={item.productId}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4 items-center justify-between"
              >
                {/* Image */}
                <div className="h-16 w-24 relative bg-slate-950 border border-slate-800 rounded overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="block">
                    <h3 className="text-xs font-bold text-slate-200 hover:text-indigo-400 transition truncate">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-slate-500 truncate">
                    {item.cpu} | {item.ram} | {item.ssd}
                  </p>
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-xs text-white px-2 select-none">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-400">
                      {(itemPrice * item.quantity).toLocaleString()}đ
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-[9px] text-slate-500">
                        {itemPrice.toLocaleString()}đ / chiếc
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-red-400 transition"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Pricing Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Module */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-indigo-400" /> Nhập mã giảm giá
            </h3>

            {coupon ? (
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-400">{coupon.code}</span>
                  <span className="text-slate-400 text-[10px] block">
                    Đã áp dụng giảm {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}đ`}
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-xxs text-red-400 hover:underline">
                  Gỡ bỏ
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: LAPTOPNEW10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 rounded transition"
                >
                  Áp dụng
                </button>
              </form>
            )}

            {couponError && <p className="text-xxs text-red-400">{couponError}</p>}
          </div>

          {/* Checkout Totals */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-2 text-xs border-b border-slate-800 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Tạm tính</span>
                <span className="font-semibold">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Giảm giá</span>
                  <span className="text-red-400 font-semibold">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Phí giao hàng</span>
                <span className="font-semibold text-slate-500">Tính khi thanh toán</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold">Tổng thanh toán</span>
              <span className="text-lg font-black text-indigo-400">
                {total.toLocaleString()}đ
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-md transition flex items-center justify-center gap-1.5 text-xs"
            >
              Tiến Hành Đặt Hàng <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
