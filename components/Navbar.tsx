"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Laptop,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { useCartStore, useWishlistStore, useFilterStore } from "@/lib/store";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const setSearch = useFilterStore((state) => state.setSearch);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchVal);
    router.push(`/products?search=${encodeURIComponent(searchVal)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-400">
              <Laptop className="h-6 w-6" />
              <span>LAPTOP<span className="text-white">STORE</span></span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Tìm kiếm laptop..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-400"
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Nav Links & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Sản phẩm
            </Link>
            <Link href="/news" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Tin tức
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Liên hệ
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-1.5 text-slate-300 hover:text-white transition">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xxs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-1.5 text-slate-300 hover:text-white transition">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xxs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse"></div>
            ) : session ? (
              <div className="relative group py-2">
                <button className="flex items-center gap-2 focus:outline-none">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white">
                      {session.user?.name?.slice(0, 1).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm text-slate-300 group-hover:text-white transition max-w-[120px] truncate">
                    {session.user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-xs text-slate-400">Đăng nhập với</p>
                    <p className="text-sm font-semibold truncate text-white">{session.user?.email}</p>
                  </div>
                  
                  {/* Admin dashboard link */}
                  {(session.user as any).role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>

                  <Link
                    href="/profile?tab=orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Đơn hàng của tôi
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-400 hover:bg-slate-700 hover:text-red-300 border-t border-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {/* Cart Icon in Mobile */}
            <Link href="/cart" className="relative p-1.5 text-slate-300 hover:text-white transition">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm laptop..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-3 pr-10 text-sm text-white"
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-slate-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white py-1"
          >
            Sản phẩm
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white py-1"
          >
            Tin tức
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white py-1"
          >
            Liên hệ
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white py-1"
          >
            Sản phẩm yêu thích ({wishlistItems.length})
          </Link>

          {session ? (
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center gap-3 mb-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                    {session.user?.name?.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                  <p className="text-xs text-slate-400">{session.user?.email}</p>
                </div>
              </div>

              {(session.user as any).role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-300 hover:text-white py-1.5"
                >
                  Admin Dashboard
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-white py-1.5"
              >
                Hồ sơ cá nhân
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left text-sm text-red-400 hover:text-red-300 py-1.5"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
