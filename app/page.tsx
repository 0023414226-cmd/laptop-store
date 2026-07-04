import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Star, Quote, Award, Truck, ShieldCheck, HeartHandshake } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import FlashSale from "@/components/FlashSale";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch DB data concurrently for better load times
  const [banners, categories, brands, featuredLaptops, newLaptops, bestSellers, newsList] = await Promise.all([
    db.banner.findMany({
      where: { position: "hero", isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.category.findMany({ take: 4 }),
    db.brand.findMany({ take: 6 }),
    db.product.findMany({
      where: { isFeatured: true, status: "active" },
      include: { images: true, brand: true, category: true, inventory: true },
      take: 4,
    }),
    db.product.findMany({
      where: { isNew: true, status: "active" },
      include: { images: true, brand: true, category: true, inventory: true },
      take: 4,
    }),
    db.product.findMany({
      where: { isBestSeller: true, status: "active" },
      include: { images: true, brand: true, category: true, inventory: true },
      take: 4,
    }),
    db.news.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  // Flash Sale products (discounted laptops)
  const flashSaleLaptops = [...featuredLaptops, ...bestSellers, ...newLaptops]
    .filter((prod, index, self) => 
      prod.discountPrice !== null && self.findIndex(p => p.id === prod.id) === index
    )
    .slice(0, 4);

  // Fallback banner if DB is empty
  const displayBanners = banners.length > 0 ? banners : [
    {
      id: "fallback-1",
      title: "Mùa Tựu Trường - Laptop Sập Giá 20%",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&fit=crop",
      linkUrl: "/products",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
      
      {/* 1. Hero Slider */}
      <HeroSlider banners={displayBanners} />

      {/* 2. Selling Badges (Highlights) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Truck className="h-8 w-8 text-indigo-400" />
          <h4 className="text-sm font-bold text-slate-200">Giao Hàng Toàn Quốc</h4>
          <p className="text-xxs text-slate-400">Giao hỏa tốc 2H tại nội thành Hà Nội</p>
        </div>
        <div className="flex flex-col items-center space-y-2 border-l border-slate-800 md:border-l-0 md:border-x">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          <h4 className="text-sm font-bold text-slate-200">Bảo Hành Chính Hãng</h4>
          <p className="text-xxs text-slate-400">Cam kết 100% sản phẩm uy tín</p>
        </div>
        <div className="flex flex-col items-center space-y-2 border-t border-slate-800 pt-4 md:border-t-0 md:pt-0">
          <Award className="h-8 w-8 text-indigo-400" />
          <h4 className="text-sm font-bold text-slate-200">Giá Tốt Hàng Đầu</h4>
          <p className="text-xxs text-slate-400">Hỗ trợ trả góp lãi suất 0%</p>
        </div>
        <div className="flex flex-col items-center space-y-2 border-t border-slate-800 pt-4 border-l border-slate-800 md:border-t-0 md:pt-0 md:border-l-0">
          <HeartHandshake className="h-8 w-8 text-indigo-400" />
          <h4 className="text-sm font-bold text-slate-200">Đổi Trả Dễ Dàng</h4>
          <p className="text-xxs text-slate-400">Đổi trả sản phẩm lỗi trong 7 ngày</p>
        </div>
      </div>

      {/* 3. Brands Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 tracking-tight">Thương Hiệu Laptop Nổi Tiếng</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brands=${brand.slug}`}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition duration-300 group"
            >
              <img
                src={brand.logo || "/placeholder-logo.png"}
                alt={brand.name}
                className="h-10 object-contain brightness-90 group-hover:brightness-100 transition duration-300"
              />
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Flash Sale (if any products discounted) */}
      {flashSaleLaptops.length > 0 && (
        <FlashSale products={flashSaleLaptops} />
      )}

      {/* 5. Categories Banner */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-200 tracking-tight">Danh Mục Laptop Cấu Hình</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categories=${cat.slug}`}
              className="group relative h-40 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition"
            >
              <img
                src={cat.image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/65 flex flex-col justify-end p-4">
                <h3 className="text-sm font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Featured Laptops */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-200 tracking-tight flex items-center gap-2">
            ⭐ Laptop Nổi Bật
          </h2>
          <Link href="/products" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredLaptops.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. New Arrivals & Best Sellers (split grid or tab simulation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Best sellers */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-200 tracking-tight">🏆 Bán Chạy Nhất</h2>
            <Link href="/products" className="text-xs text-slate-400 hover:text-white">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {bestSellers.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* New Laptops */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-200 tracking-tight">✨ Sản Phẩm Mới</h2>
            <Link href="/products" className="text-xs text-slate-400 hover:text-white">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {newLaptops.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

      </div>

      {/* 8. Tech News section */}
      {newsList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-200 tracking-tight">📰 Tin Tức & Đánh Giá Công Nghệ</h2>
            <Link href="/news" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Tất cả bài viết <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.map((news) => (
              <div key={news.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden group flex flex-col">
                <Link href={`/news/${news.slug}`} className="block relative aspect-video overflow-hidden">
                  <img
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                </Link>
                <div className="p-4 flex flex-col flex-1 space-y-2">
                  <Link href={`/news/${news.slug}`}>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition line-clamp-2">
                      {news.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-normal">{news.summary}</p>
                  <div className="text-[10px] text-slate-500 pt-2 mt-auto">
                    Đăng ngày {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Feedback Testimonials */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-200 text-center tracking-tight">Ý Kiến Khách Hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-500/10 shrink-0" />
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Mua Asus ROG ở đây rất ưng ý. Nhân viên hỗ trợ cài đặt Win và các phần mềm cần thiết nhiệt tình. Giá thành rẻ hơn thị trường từ 1 đến 2 triệu đồng."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">KH</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Anh Khánh</h5>
                <p className="text-[10px] text-slate-500">Khách mua ROG Strix</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-500/10 shrink-0" />
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Đã đặt hàng MacBook Pro giao nhanh 2h. Nhận máy nguyên seal chính hãng, viết hóa đơn đầy đủ. Shop làm ăn chuyên nghiệp, chắc chắn sẽ giới thiệu bạn bè."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">TM</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Chị Trà My</h5>
                <p className="text-[10px] text-slate-500">Khách mua Macbook Pro</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-500/10 shrink-0" />
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Máy trạm Dell Precision cấu hình cao chạy rất êm. Shop tặng balo chống sốc và chuột không dây xịn xò. Chế độ bảo hành 12 tháng rất yên tâm."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">QT</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Anh Quốc Toản</h5>
                <p className="text-[10px] text-slate-500">Kỹ sư lập trình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
