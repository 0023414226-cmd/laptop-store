"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Laptop, RefreshCw, AlertCircle, Check } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(25000000);
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cpu, setCpu] = useState("Intel Core i7");
  const [ram, setRam] = useState("16GB DDR5");
  const [ssd, setSsd] = useState("512GB NVMe");
  const [gpu, setGpu] = useState("NVIDIA RTX 4060");
  const [screen, setScreen] = useState("16 inch QHD 165Hz");
  const [os, setOs] = useState("Windows 11");
  const [quantity, setQuantity] = useState(15);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMetadata = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);
      if (catsRes.ok) setCategories(await catsRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, []);

  // Set default dropdown selections once metadata is loaded
  useEffect(() => {
    if (brands.length > 0 && !brandId) setBrandId(brands[0].id);
    if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [brands, categories]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa laptop này?")) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.slug !== slug));
      } else {
        alert("Xóa sản phẩm thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    if (!name || !sku || !brandId || !categoryId) {
      setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          SKU: sku,
          price: Number(price),
          discountPrice: discountPrice === "" ? null : Number(discountPrice),
          brandId,
          categoryId,
          cpu,
          ram,
          ssd,
          gpu,
          screen,
          os,
          quantity: Number(quantity),
          description,
          images: [imageUrl],
          isNew: true,
          isFeatured: false,
          isBestSeller: false,
        }),
      });

      if (res.ok) {
        setFormSuccess("Thêm sản phẩm laptop mới thành công!");
        setName("");
        setSku("");
        setPrice(25000000);
        setDiscountPrice("");
        setDescription("");
        fetchProducts(); // Refresh list
        setTimeout(() => {
          setShowAddForm(false);
          setFormSuccess("");
        }, 1500);
      } else {
        const err = await res.json();
        setFormError(JSON.stringify(err.error) || "Lỗi lưu sản phẩm.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối mạng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Laptop className="h-5 w-5 text-indigo-400" /> Quản lý sản phẩm Laptop
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách chi tiết kho hàng laptop</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="bg-slate-900 border border-slate-800 text-slate-300 p-2 rounded-md hover:text-white transition"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-md flex items-center gap-1.5 transition"
          >
            <Plus className="h-4 w-4" /> Thêm Laptop Mới
          </button>
        </div>
      </div>

      {/* ================= ADD PRODUCT INLINE FORM ================= */}
      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Thông tin laptop mới</h3>
          
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-2 rounded-md flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Tên laptop *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                placeholder="Ví dụ: Dell XPS 15 9530"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Mã SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                placeholder="DELL-XPS-9530"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Ảnh đại diện URL *</label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Giá bán (VND) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Giá khuyến mãi (Không bắt buộc)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                placeholder="Không giảm giá"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Thương hiệu *</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Danh mục nhu cầu *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Thông số CPU *</label>
              <input
                type="text"
                required
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Thông số RAM *</label>
              <input
                type="text"
                required
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Ổ cứng SSD *</label>
              <input
                type="text"
                required
                value={ssd}
                onChange={(e) => setSsd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Đồ họa GPU *</label>
              <input
                type="text"
                required
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-xxs text-slate-400">Màn hình *</label>
              <input
                type="text"
                required
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Hệ điều hành *</label>
              <input
                type="text"
                required
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400">Số lượng nhập kho *</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 font-semibold">Ghi chú / Mô tả ngắn</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                placeholder="Laptop văn phòng mỏng nhẹ cao cấp..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2 rounded text-xs transition"
            >
              Hủy bỏ
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded text-xs transition"
            >
              {submitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      )}

      {/* ================= PRODUCTS DATA TABLE ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Đang tải danh sách laptop...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Kho hàng trống. Vui lòng thêm sản phẩm mới.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold">
                  <th className="p-4 w-12">Ảnh</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Tên Laptop</th>
                  <th className="p-4">CPU / RAM / SSD</th>
                  <th className="p-4 text-right">Giá bán</th>
                  <th className="p-4 text-right">Số lượng</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const hasDiscount = p.discountPrice !== null;
                  const primaryImage = p.images?.find((img: any) => img.isPrimary)?.url 
                    || p.images?.[0]?.url 
                    || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400";
                  
                  return (
                    <tr key={p.id} className="border-b border-slate-850 hover:bg-slate-900/60 transition">
                      <td className="p-4">
                        <img src={primaryImage} alt="" className="h-8 w-12 object-cover rounded bg-slate-950 border border-slate-800" />
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-400">{p.SKU}</td>
                      <td className="p-4 font-semibold text-slate-200">{p.name}</td>
                      <td className="p-4 text-slate-400">
                        <div className="truncate max-w-[180px]" title={`${p.cpu} | ${p.ram} | ${p.ssd}`}>
                          {p.cpu.split(" ")[0]} | {p.ram.split(" ")[0]} | {p.ssd.split(" ")[0]}
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-indigo-400">
                        {hasDiscount ? (
                          <div className="flex flex-col items-end">
                            <span>{p.discountPrice.toLocaleString()}đ</span>
                            <span className="text-[10px] text-slate-500 line-through font-normal">
                              {p.price.toLocaleString()}đ
                            </span>
                          </div>
                        ) : (
                          <span>{p.price.toLocaleString()}đ</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-300">
                        {p.inventory?.quantity || 0} chiếc
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(p.slug)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
