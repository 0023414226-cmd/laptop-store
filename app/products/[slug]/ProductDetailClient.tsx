"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, ShoppingCart, Heart, Shield, Award, Sparkles, RefreshCw, Send } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(
    product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600"
  );
  
  const [zoomStyle, setZoomStyle] = useState({ display: "none", backgroundPosition: "0% 0%" });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs"); // specs, desc, reviews

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  const hasDiscount = product.discountPrice !== null;
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  // Zoom effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none", backgroundPosition: "0% 0%" });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment,
          title: "Đánh giá sản phẩm",
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        // Append current user metadata to display review immediately
        const userReview = {
          ...newReview,
          user: {
            name: session.user?.name || "Bạn",
            avatar: session.user?.image || "",
          },
        };
        setReviewsList([userReview, ...reviewsList]);
        setComment("");
        setRating(5);
      } else {
        const err = await res.json();
        setReviewError(err.error || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      setReviewError("Đã xảy ra lỗi kết nối.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. Product Brief (Image Gallery + Info Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Gallery & Zoom */}
        <div className="space-y-4">
          <div
            className="relative aspect-video bg-slate-900 border border-slate-800 rounded-lg overflow-hidden cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity"
            />
            {/* Zoomed lens panel */}
            <div
              className="absolute inset-0 bg-no-repeat pointer-events-none transition-transform"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${activeImage})`,
                backgroundSize: "200%",
              }}
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative h-16 w-24 bg-slate-900 border rounded overflow-hidden shrink-0 transition ${
                    activeImage === img.url ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{product.brand?.name}</span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">{product.name}</h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.averageRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-300">({product.averageRating.toFixed(1)} / 5)</span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400">{reviewsList.length} Đánh giá</span>
            </div>
          </div>

          {/* Specs Snippet */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 border border-slate-800/60 rounded-lg p-4 text-xs">
            <div><span className="text-slate-500">Vi xử lý:</span> <span className="font-semibold text-slate-200">{product.cpu}</span></div>
            <div><span className="text-slate-500">RAM:</span> <span className="font-semibold text-slate-200">{product.ram}</span></div>
            <div><span className="text-slate-500">Ổ cứng:</span> <span className="font-semibold text-slate-200">{product.ssd}</span></div>
            <div><span className="text-slate-500">Đồ họa:</span> <span className="font-semibold text-slate-200">{product.gpu}</span></div>
          </div>

          {/* Price block */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xxs text-slate-400">Giá bán chính thức</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-red-500">
                  {activePrice.toLocaleString()}đ
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-500 line-through">
                    {product.price.toLocaleString()}đ
                  </span>
                )}
              </div>
            </div>
            
            {hasDiscount && (
              <span className="bg-red-500 text-white font-bold text-xs px-3 py-1 rounded-full animate-bounce">
                Tiết kiệm {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </span>
            )}
          </div>

          {/* Availability & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Trạng thái:</span>
              <span className={`text-xs font-bold ${product.inventory?.quantity > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {product.inventory?.quantity > 0 ? `Còn hàng (Sẵn có ${product.inventory.quantity} chiếc)` : "Hết hàng"}
              </span>
            </div>

            {product.inventory?.quantity > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-700 bg-slate-900 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white transition focus:outline-none"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-mono text-sm text-white select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                    className="px-3 py-1.5 text-slate-400 hover:text-white transition focus:outline-none"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-md transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> Thêm Vào Giỏ Hàng
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-md border text-slate-400 hover:text-red-500 transition ${
                    isInWishlist ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-slate-700 bg-slate-900"
                  }`}
                  title="Yêu thích"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-6 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Bảo hành 12T</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Hàng chính hãng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Đổi trả 7 ngày</span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Tabs Section (Specifications, Reviews) */}
      <div className="space-y-6">
        
        {/* Tab Headers */}
        <div className="flex gap-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-xs font-bold relative transition ${
              activeTab === "specs" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab("desc")}
            className={`pb-3 text-xs font-bold relative transition ${
              activeTab === "desc" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Mô tả chi tiết
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-xs font-bold relative transition ${
              activeTab === "reviews" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Đánh giá ({reviewsList.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[200px]">
          {activeTab === "specs" && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-800 bg-slate-900/40">
                    <td className="p-3 w-40 font-semibold text-slate-400">Vi xử lý (CPU)</td>
                    <td className="p-3 text-slate-200">{product.cpu}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3 font-semibold text-slate-400">Bộ nhớ (RAM)</td>
                    <td className="p-3 text-slate-200">{product.ram}</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-400">Ổ cứng (SSD)</td>
                    <td className="p-3 text-slate-200">{product.ssd}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3 font-semibold text-slate-400">Card đồ họa (GPU)</td>
                    <td className="p-3 text-slate-200">{product.gpu}</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-400">Màn hình</td>
                    <td className="p-3 text-slate-200">{product.screen}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-3 font-semibold text-slate-400">Hệ điều hành</td>
                    <td className="p-3 text-slate-200">{product.os}</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-400">Mã SKU</td>
                    <td className="p-3 text-slate-200">{product.SKU}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "desc" && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 leading-relaxed text-xs text-slate-300 space-y-4">
              <p>{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
              <p>Mẫu laptop được thiết kế sang trọng, hiện đại với hiệu năng tột đỉnh. Sản phẩm hỗ trợ đầy đủ các cổng kết nối thế hệ mới, bàn phím gõ êm ái và hệ thống tản nhiệt tối ưu giúp vận hành mát mẻ trong thời gian dài làm việc cường độ cao.</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Write Review Form (Logged in only) */}
              {session ? (
                <form onSubmit={handleSubmitReview} className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Viết Đánh Giá Của Bạn</h4>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Đánh giá sao:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= rating ? "fill-amber-500 text-amber-500" : "text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder="Chia sẻ nhận xét của bạn về hiệu năng, thiết kế sản phẩm..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2 px-5 rounded-md flex items-center gap-1.5 transition"
                  >
                    <Send className="h-3.5 w-3.5" /> Gửi đánh giá
                  </button>
                </form>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-5 text-center text-xs text-slate-400">
                  Vui lòng <a href="/login" className="text-indigo-400 hover:underline">đăng nhập</a> để viết đánh giá cho laptop này.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  reviewsList.map((rev: any) => (
                    <div key={rev.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {rev.user?.avatar ? (
                            <img src={rev.user.avatar} alt="User" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                              {rev.user?.name?.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h5 className="text-xs font-bold text-slate-200">{rev.user?.name}</h5>
                            <span className="text-[10px] text-slate-500">
                              {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 pl-11 leading-normal">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 border-t border-slate-850 pt-10">
          <h2 className="text-lg font-bold text-slate-200 tracking-tight">Sản Phẩm Tương Tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
