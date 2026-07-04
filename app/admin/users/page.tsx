"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId: string, updates: { roleName?: string; status?: string }) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        // Update local state
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Cập nhật tài khoản thất bại.");
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
            <Users className="h-5 w-5 text-indigo-400" /> Quản lý Khách hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách thành viên đăng ký và phân quyền hệ thống</p>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-slate-900 border border-slate-800 text-slate-300 p-2 rounded-md hover:text-white transition"
          title="Làm mới"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Đang tải danh sách thành viên...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Chưa có thành viên nào đăng ký tài khoản.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold">
                  <th className="p-4">Ảnh đại diện</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4 text-center">Vai trò</th>
                  <th className="p-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-900/60 transition">
                    <td className="p-4">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover border border-slate-700 bg-slate-950" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-[10px]">
                          {u.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{u.name}</td>
                    <td className="p-4 font-mono text-slate-400">{u.email}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    
                    {/* Role Dropdown */}
                    <td className="p-4 text-center">
                      <select
                        disabled={updatingId === u.id}
                        value={u.role?.name || "user"}
                        onChange={(e) => handleUpdateUser(u.id, { roleName: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-semibold text-indigo-400 focus:outline-none cursor-pointer"
                      >
                        <option value="user">Khách hàng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4 text-center">
                      <select
                        disabled={updatingId === u.id}
                        value={u.status}
                        onChange={(e) => handleUpdateUser(u.id, { status: e.target.value })}
                        className={`bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-semibold focus:outline-none cursor-pointer ${
                          u.status === "active" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="suspended">Đã tạm khóa</option>
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
