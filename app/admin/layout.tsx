import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Laptop,
  ShoppingCart,
  Users,
  Home,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Authorization Check: Must be logged in and must be admin
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if ((session.user as any).role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 px-4 text-center">
        <ShieldCheck className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-red-400">Truy Cập Bị Từ Chối</h1>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Bạn không có quyền quản trị viên để truy cập trang này. Vui lòng đăng nhập với tài khoản admin.
        </p>
        <Link href="/" className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-6 py-2 rounded-md transition">
          Về Trang Chủ Cửa Hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 text-base font-bold tracking-tight text-indigo-400">
            <Laptop className="h-5 w-5" />
            <span>ADMIN<span className="text-white">PANEL</span></span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <LayoutDashboard className="h-4.5 w-4.5 text-indigo-400" />
            Tổng quan báo cáo
          </Link>
          
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Laptop className="h-4.5 w-4.5 text-indigo-400" />
            Quản lý Laptop
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-indigo-400" />
            Quản lý Đơn hàng
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            Quản lý Khách hàng
          </Link>
        </nav>

        {/* Footer Nav */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <Home className="h-4.5 w-4.5" />
            Cửa hàng chính
          </Link>
        </div>
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400">Xin chào, {session.user?.name}</span>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt="Admin" className="h-8 w-8 rounded-full border border-slate-700 object-cover" />
            )}
          </div>
        </header>

        {/* Main Content scrollable panel */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
