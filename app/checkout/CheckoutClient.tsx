"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, CreditCard, ChevronRight, CheckCircle2, ClipboardList } from "lucide-react";
import { useCartStore } from "@/lib/store";

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface CheckoutClientProps {
  shippingMethods: ShippingMethod[];
}

export default function CheckoutClient({ shippingMethods }: CheckoutClientProps) {
  const router = useRouter();
  const {
    items,
    coupon,
    shippingMethod,
    setShippingMethod,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
    clearCart,
  } = useCartStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment & Review, 3: Success

  // Shipping Form State
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bank_transfer, vnpay
  const [notes, setNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Set default shipping method if not set
  useEffect(() => {
    if (!shippingMethod && shippingMethods.length > 0) {
      setShippingMethod(shippingMethods[0]);
    }
  }, [shippingMethods, shippingMethod]);

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const shippingFee = shippingMethod?.price || 0;
  const total = getCartTotal();

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !phone || !streetAddress || !ward || !district || !city || !shippingMethod) {
      setCheckoutError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }
    setCheckoutError("");
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          phone,
          streetAddress,
          ward,
          district,
          city,
          shippingMethodId: shippingMethod?.id,
          paymentMethod,
          couponCode: coupon?.code || null,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          notes,
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        setCreatedOrder(orderData);
        clearCart(); // Clear cart in Zustand
        setStep(3);
      } else {
        const err = await res.json();
        setCheckoutError(err.error || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setCheckoutError("Có lỗi kết nối hệ thống.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (step === 3 && createdOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-8 w-8 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">Đặt hàng thành công!</h2>
          <p className="text-xs text-slate-400">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.
          </p>
        </div>

        {/* Receipt summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-2.5">
            <span className="text-slate-500">Mã đơn hàng</span>
            <span className="font-mono font-bold text-indigo-400">{createdOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Người nhận</span>
            <span className="font-semibold text-slate-300">{recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Số điện thoại</span>
            <span className="font-semibold text-slate-300">{phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hình thức thanh toán</span>
            <span className="font-semibold text-slate-300 uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between border-t border-slate-850 pt-2.5 font-bold text-sm">
            <span className="text-slate-200">Tổng tiền</span>
            <span className="text-indigo-400">{createdOrder.finalAmount?.toLocaleString()}đ</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/profile?tab=orders")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-md transition flex items-center gap-1.5"
          >
            <ClipboardList className="h-4 w-4" /> Theo dõi đơn hàng
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-6 py-2.5 rounded-md transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Giỏ hàng của bạn đang trống</h2>
        <button
          onClick={() => router.push("/products")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2 rounded-md"
        >
          Chọn laptop mua ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stepper Header */}
      <div className="flex justify-center items-center gap-4 text-xs font-semibold text-slate-500 mb-8 border-b border-slate-850 pb-6">
        <span className={`${step >= 1 ? "text-indigo-400" : ""}`}>1. Địa chỉ giao hàng</span>
        <ChevronRight className="h-4 w-4 text-slate-700" />
        <span className={`${step >= 2 ? "text-indigo-400" : ""}`}>2. Thanh toán & Xác nhận</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* =================== LEFT FORM PANELS =================== */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            <form onSubmit={handleShippingSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-200">Địa chỉ giao hàng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Tên người nhận *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="0987654321"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Hà Nội"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Quận/Huyện *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Đống Đa"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Phường/Xã *</label>
                  <input
                    type="text"
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Láng Hạ"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xxs text-slate-400">Địa chỉ cụ thể (Số nhà, Tên đường) *</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  placeholder="123 Đường Láng"
                />
              </div>

              {/* Shipping Speed options */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Truck className="h-4 w-4" /> Phương thức vận chuyển
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingMethods.map((sm) => (
                    <label
                      key={sm.id}
                      className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition ${
                        shippingMethod?.id === sm.id
                          ? "border-indigo-500 bg-indigo-950/20"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={shippingMethod?.id === sm.id}
                          onChange={() => setShippingMethod(sm)}
                          className="text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-200">{sm.name}</p>
                          <p className="text-[10px] text-slate-500">Dự kiến {sm.estimatedDays}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300">{sm.price.toLocaleString()}đ</span>
                    </label>
                  ))}
                </div>
              </div>

              {checkoutError && <p className="text-xs text-red-400">{checkoutError}</p>}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs transition"
              >
                Tiếp Tục Chọn Thanh Toán
              </button>
            </form>
          ) : (
            /* Step 2: Payment & Final Review */
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200">Thanh toán & Ghi chú</h3>
                <button onClick={() => setStep(1)} className="text-xxs text-indigo-400 hover:underline">
                  Quay lại sửa địa chỉ
                </button>
              </div>

              {/* Payment Selectors */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" /> Phương thức thanh toán
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    className={`border rounded-lg p-4 flex flex-col gap-1.5 cursor-pointer transition ${
                      paymentMethod === "cod" ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="text-indigo-600 bg-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-200">COD</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </label>

                  <label
                    className={`border rounded-lg p-4 flex flex-col gap-1.5 cursor-pointer transition ${
                      paymentMethod === "bank_transfer" ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={() => setPaymentMethod("bank_transfer")}
                        className="text-indigo-600 bg-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-200">Chuyển Khoản</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Quét mã QR thanh toán nhanh qua ngân hàng</p>
                  </label>

                  <label
                    className={`border rounded-lg p-4 flex flex-col gap-1.5 cursor-pointer transition ${
                      paymentMethod === "vnpay" ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "vnpay"}
                        onChange={() => setPaymentMethod("vnpay")}
                        className="text-indigo-600 bg-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-200">Thẻ Quốc Tế / ATM</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Thanh toán online qua cổng VNPay</p>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="space-y-1">
                <label className="text-xxs text-slate-400">Ghi chú đơn hàng (Không bắt buộc)</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về thời gian giao hàng, yêu cầu cấu hình..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              {checkoutError && <p className="text-xs text-red-400">{checkoutError}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded text-xs transition"
              >
                {isPlacingOrder ? "Đang xử lý đặt hàng..." : "Xác Nhận Đặt Hàng"}
              </button>
            </div>
          )}
        </div>

        {/* =================== RIGHT ORDER SUMMARY =================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-200">Đơn hàng của bạn</h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 justify-between items-center">
                <img src={item.image} alt={item.name} className="h-10 w-14 object-cover rounded bg-slate-950" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-300 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500">Số lượng: {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-300">
                  {((item.discountPrice !== null ? item.discountPrice : item.price) * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-850 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Tạm tính</span>
              <span className="font-semibold text-slate-300">{subtotal.toLocaleString()}đ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Khuyến mãi</span>
                <span className="text-red-400 font-semibold">-{discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Phí giao hàng</span>
              <span className="font-semibold text-slate-300">{shippingFee.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 flex justify-between items-baseline font-bold">
            <span className="text-slate-200 text-sm">Tổng thanh toán</span>
            <span className="text-indigo-400 text-base">
              {total.toLocaleString()}đ
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
