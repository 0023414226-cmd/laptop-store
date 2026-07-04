"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useFilterStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

interface ProductsClientProps {
  initialCategories: any[];
  initialBrands: any[];
}

// Available options for specification filtering
const CPU_OPTIONS = ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 7", "Apple M3"];
const RAM_OPTIONS = ["8GB", "16GB", "32GB", "64GB"];
const SSD_OPTIONS = ["256GB", "512GB", "1TB", "2TB"];
const GPU_OPTIONS = ["RTX 4050", "RTX 4060", "RTX 4070", "Apple M3 Pro", "Intel Iris Xe"];
const OS_OPTIONS = ["Windows 11", "macOS", "Windows 11 Pro"];

export default function ProductsClient({ initialCategories, initialBrands }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync Zustand store with state
  const filters = useFilterStore();

  // Sync initial query params from URL on mount
  useEffect(() => {
    const searchUrl = searchParams.get("search");
    const brandUrl = searchParams.get("brands");
    const categoryUrl = searchParams.get("categories");

    if (searchUrl) filters.setSearch(searchUrl);
    if (brandUrl) {
      brandUrl.split(",").forEach((b) => {
        if (!filters.brands.includes(b)) filters.toggleBrand(b);
      });
    }
    if (categoryUrl) {
      categoryUrl.split(",").forEach((c) => {
        if (!filters.categories.includes(c)) filters.toggleCategory(c);
      });
    }
  }, [searchParams]);

  // Fetch products whenever filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.set("search", filters.search);
        if (filters.brands.length > 0) queryParams.set("brands", filters.brands.join(","));
        if (filters.categories.length > 0) queryParams.set("categories", filters.categories.join(","));
        if (filters.cpu.length > 0) queryParams.set("cpu", filters.cpu.join(","));
        if (filters.ram.length > 0) queryParams.set("ram", filters.ram.join(","));
        if (filters.ssd.length > 0) queryParams.set("ssd", filters.ssd.join(","));
        if (filters.gpu.length > 0) queryParams.set("gpu", filters.gpu.join(","));
        if (filters.os.length > 0) queryParams.set("os", filters.os.join(","));
        
        queryParams.set("minPrice", String(filters.minPrice));
        queryParams.set("maxPrice", String(filters.maxPrice));
        queryParams.set("sort", filters.sort);
        queryParams.set("page", String(filters.page));
        queryParams.set("limit", String(filters.limit));

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    filters.search,
    filters.brands,
    filters.categories,
    filters.cpu,
    filters.ram,
    filters.ssd,
    filters.gpu,
    filters.os,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.page,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Danh Sách Laptop</h1>
          <p className="text-xs text-slate-400 mt-1">Tìm thấy {pagination.total} sản phẩm phù hợp</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sorting */}
          <select
            value={filters.sort}
            onChange={(e) => filters.setSort(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-300"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá tốt nhất</option>
            <option value="popular">Bán chạy nhất</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden bg-slate-900 border border-slate-800 p-2 rounded-md hover:text-white text-slate-400"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* =================== DESKTOP SIDEBAR FILTERS =================== */}
        <aside className="hidden md:block w-64 bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 shrink-0 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Bộ lọc tìm kiếm
            </h3>
            <button
              onClick={filters.resetFilters}
              className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Thiết lập lại
            </button>
          </div>

          {/* Search Sub-input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Từ khóa</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên máy, SKU..."
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-3 pr-8 text-xs text-white"
              />
              <Search className="h-3.5 w-3.5 absolute right-2.5 top-2.5 text-slate-500" />
            </div>
          </div>

          {/* Price Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Khoảng giá (VND)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={filters.minPrice || ""}
                onChange={(e) => filters.setPriceRange(Number(e.target.value), filters.maxPrice)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-1 text-center text-xs text-white"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.maxPrice === 100000000 ? "" : filters.maxPrice}
                onChange={(e) => filters.setPriceRange(filters.minPrice, Number(e.target.value) || 100000000)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-1 text-center text-xs text-white"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Thương hiệu</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {initialBrands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(b.slug)}
                    onChange={() => filters.toggleBrand(b.slug)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Nhu cầu sử dụng</label>
            <div className="space-y-1.5">
              {initialCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(c.slug)}
                    onChange={() => filters.toggleCategory(c.slug)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specs Filter: CPU */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Bộ vi xử lý (CPU)</label>
            <div className="space-y-1.5">
              {CPU_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.cpu.includes(opt)}
                    onChange={() => filters.toggleCpu(opt)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specs Filter: RAM */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Dung lượng RAM</label>
            <div className="space-y-1.5">
              {RAM_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ram.includes(opt)}
                    onChange={() => filters.toggleRam(opt)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specs Filter: GPU */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Card đồ họa (GPU)</label>
            <div className="space-y-1.5">
              {GPU_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.gpu.includes(opt)}
                    onChange={() => filters.toggleGpu(opt)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* =================== PRODUCT GRID =================== */}
        <div className="flex-1 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg h-[280px] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
              <p className="text-slate-400 text-sm">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={filters.resetFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={filters.page === 1}
                onClick={() => filters.setPage(filters.page - 1)}
                className="bg-slate-900 border border-slate-800 text-slate-300 p-1.5 rounded-md disabled:opacity-40 hover:text-white transition"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => filters.setPage(pageNum)}
                    className={`h-8 w-8 text-xs font-semibold rounded-md border transition ${
                      filters.page === pageNum
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={filters.page === pagination.totalPages}
                onClick={() => filters.setPage(filters.page + 1)}
                className="bg-slate-900 border border-slate-800 text-slate-300 p-1.5 rounded-md disabled:opacity-40 hover:text-white transition"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* =================== MOBILE FILTER DRAWER =================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-black/60">
          <div className="w-80 bg-slate-900 h-full p-6 overflow-y-auto space-y-6 flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-sm text-slate-200">Bộ lọc tìm kiếm</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                Đóng
              </button>
            </div>

            {/* Mobile filters content */}
            <div className="space-y-6 flex-1">
              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Thương hiệu</label>
                <div className="space-y-1.5">
                  {initialBrands.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(b.slug)}
                        onChange={() => filters.toggleBrand(b.slug)}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specs Filter: CPU */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">CPU</label>
                <div className="space-y-1.5">
                  {CPU_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.cpu.includes(opt)}
                        onChange={() => filters.toggleCpu(opt)}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded text-xs"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
