"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, ClipboardList, CheckCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, updates: { status?: string; paymentStatus?: string }) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        // Update local state
        setOrders(
          orders.map((ord) =>
            ord.id === orderId ? { ...ord, ...updates } : ord
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || "Cập nhật đơn hàng thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-400" /> Quản lý Đơn hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách và cập nhật trạng thái đơn đặt hàng</p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-slate-900 border border-slate-800 text-slate-300 p-2 rounded-md hover:text-white transition"
          title="Làm mới"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Cửa hàng chưa ghi nhận đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold">
                  <th className="p-4">Mã Đơn Hàng</th>
                  <th className="p-4">Ngày Đặt</th>
                  <th className="p-4">Khách Hàng / SĐT</th>
                  <th className="p-4">Địa Chỉ Nhận Hàng</th>
                  <th className="p-4 text-right">Tổng Tiền</th>
                  <th className="p-4">Trạng Thái Đơn</th>
                  <th className="p-4">Thanh Toán</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-850 hover:bg-slate-900/60 transition">
                    <td className="p-4 font-mono font-bold text-indigo-400">{o.orderNumber}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{o.address?.recipientName}</div>
                      <div className="text-[10px] text-slate-500">{o.address?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-400 truncate max-w-[200px]" title={`${o.address?.streetAddress}, ${o.address?.ward}, ${o.address?.district}, ${o.address?.city}`}>
                        {o.address?.streetAddress}, {o.address?.ward}, {o.address?.district}, {o.address?.city}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-200">
                      {o.finalAmount.toLocaleString()}đ
                    </td>
                    
                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        disabled={updatingId === o.id || o.status === "cancelled"}
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, { status: e.target.value })}
                        className={`bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                          o.status === "completed" ? "text-emerald-400" :
                          o.status === "cancelled" ? "text-red-400" :
                          o.status === "shipping" ? "text-blue-400" : "text-amber-400"
                        }`}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancelled" disabled>Đã hủy</option>
                      </select>
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="p-4">
                      <select
                        disabled={updatingId === o.id}
                        value={o.paymentStatus}
                        onChange={(e) => handleUpdateStatus(o.id, { paymentStatus: e.target.value })}
                        className={`bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                          o.paymentStatus === "paid" ? "text-emerald-400" :
                          o.paymentStatus === "refunded" ? "text-red-400" : "text-amber-400"
                        }`}
                      >
                        <option value="unpaid">Chưa thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
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
}
