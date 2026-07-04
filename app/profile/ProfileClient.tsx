"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, ClipboardList, MapPin, KeyRound, Check, AlertCircle, ShoppingBag } from "lucide-react";

interface ProfileClientProps {
  initialUser: any;
  initialOrders: any[];
}

export default function ProfileClient({ initialUser, initialOrders }: ProfileClientProps) {
  const { update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [orders, setOrders] = useState(initialOrders);

  // Profile Form State
  const [name, setName] = useState(initialUser.name || "");
  const [avatar, setAvatar] = useState(initialUser.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Order Details Expanded state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setUpdatingProfile(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar,
          ...(oldPassword && newPassword && { oldPassword, newPassword }),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfileSuccess(data.message);
        setOldPassword("");
        setNewPassword("");
        // Update local session
        await updateSession({
          name: data.user.name,
          picture: data.user.avatar,
        });
      } else {
        setProfileError(data.error || "Cập nhật thất bại.");
      }
    } catch (err) {
      setProfileError("Có lỗi xảy ra.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setCancellingOrder(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        // Update local status
        setOrders(
          orders.map((ord) => (ord.id === orderId ? { ...ord, status: "cancelled" } : ord))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Hủy đơn hàng thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối mạng.");
    } finally {
      setCancellingOrder(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side: Vertical Tabs */}
        <aside className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
          {/* User profile brief */}
          <div className="flex flex-col items-center py-4 border-b border-slate-800 mb-4 text-center">
            {avatar ? (
              <img src={avatar} alt={name} className="h-16 w-16 rounded-full object-cover border border-slate-700 mb-2" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg mb-2">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <h4 className="text-xs font-bold text-slate-200">{name}</h4>
            <p className="text-[10px] text-slate-500">{initialUser.email}</p>
          </div>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition ${
              activeTab === "profile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            Hồ sơ của tôi
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition ${
              activeTab === "orders" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Đơn mua của tôi
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition ${
              activeTab === "addresses" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Sổ địa chỉ
          </button>
        </aside>

        {/* Right Side: Tab panels */}
        <main className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[400px]">
          
          {/* ================= PROFILE PANEL ================= */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Hồ sơ cá nhân</h3>
                <p className="text-[10px] text-slate-500 mt-1">Cập nhật thông tin tài khoản và đổi mật khẩu bảo mật</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400">Email (Không thể thay đổi)</label>
                  <input
                    type="email"
                    disabled
                    value={initialUser.email}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-semibold">Họ tên của bạn</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-semibold">Đường dẫn ảnh đại diện (Avatar URL)</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Password Change Trigger */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" /> Đổi mật khẩu
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Mật khẩu cũ</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded flex items-center gap-2">
                    <Check className="h-4 w-4" /> {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {profileError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded text-xs transition"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {/* ================= ORDERS PANEL ================= */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Lịch sử đơn mua</h3>
                <p className="text-[10px] text-slate-500 mt-1">Quản lý và theo dõi quá trình giao nhận hàng</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-slate-700" />
                  <p>Bạn chưa đặt đơn hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-slate-950 border border-slate-850 rounded-lg p-5 space-y-4">
                      {/* Summary head */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-indigo-400">{order.orderNumber}</span>
                          <p className="text-[10px] text-slate-500">
                            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        
                        {/* Status label */}
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded text-[10px] ${
                            order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                            order.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                            order.status === "shipping" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {order.status === "pending" ? "Chờ xử lý" :
                           order.status === "processing" ? "Đang xử lý" :
                           order.status === "shipping" ? "Đang giao" :
                           order.status === "completed" ? "Thành công" : "Đã hủy"}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 border-y border-slate-900 py-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-semibold truncate max-w-xs">{item.product.name}</span>
                            <span className="text-slate-500 text-[10px]">x{item.quantity}</span>
                            <span className="text-slate-400">{item.price.toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary foot */}
                      <div className="flex justify-between items-center">
                        <span className="text-xxs text-slate-500 uppercase">
                          Thanh toán: <span className="text-slate-300 font-bold">{order.paymentStatus === "paid" ? "Đã trả" : "Chưa trả"}</span>
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">Tổng tiền:</span>
                          <span className="text-sm font-black text-indigo-400">{order.finalAmount.toLocaleString()}đ</span>
                        </div>
                      </div>

                      {/* Action cancel order if pending */}
                      {order.status === "pending" && (
                        <div className="flex justify-end pt-2 border-t border-slate-900">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrder === order.id}
                            className="bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white text-[10px] font-bold px-3 py-1 rounded transition disabled:opacity-40"
                          >
                            {cancellingOrder === order.id ? "Đang hủy..." : "Hủy đơn hàng"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= ADDRESSES PANEL ================= */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Sổ địa chỉ giao hàng</h3>
                <p className="text-[10px] text-slate-500 mt-1">Cấu hình các điểm nhận hàng của bạn</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialUser.addresses?.map((addr: any) => (
                  <div key={addr.id} className="border border-slate-800 bg-slate-950 p-4 rounded-lg space-y-2 relative text-xs">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 bg-indigo-600/20 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                        Mặc định
                      </span>
                    )}
                    <h5 className="font-bold text-slate-200">{addr.recipientName}</h5>
                    <p className="text-[11px] text-slate-400">SĐT: {addr.phone}</p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.city}
                    </p>
                  </div>
                ))}

                {initialUser.addresses?.length === 0 && (
                  <p className="text-xs text-slate-500">Chưa lưu địa chỉ nào. Địa chỉ mới sẽ tự động lưu khi đặt hàng.</p>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
