"use client";

import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url 
    || product.images?.[0]?.url 
    || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400";

  const originalPrice = product.price;
  const discountPrice = product.discountPrice;
  const hasDiscount = discountPrice !== null;
  const activePrice = hasDiscount ? discountPrice : originalPrice;
  
  // Calculate discount percentage
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full hover:border-slate-700 transition duration-300 relative shadow-md">
      
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xxs font-bold px-2 py-0.5 rounded-full z-10">
          -{discountPercent}%
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/60 text-slate-300 hover:text-red-500 hover:bg-slate-950 transition z-10"
      >
        <Heart className={`h-4.5 w-4.5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-video overflow-hidden bg-slate-950">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* Specifications snippet */}
        <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-400">
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">{product.cpu.split(" ")[0]}</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">{product.ram.split(" ")[0]} RAM</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">{product.ssd.split(" ")[0]} SSD</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">{product.gpu.split(" ")[0]}</span>
        </div>

        {/* Price & Cart button */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-red-500">
                  {discountPrice.toLocaleString()}đ
                </span>
                <span className="text-xxs text-slate-500 line-through">
                  {originalPrice.toLocaleString()}đ
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-200">
                {originalPrice.toLocaleString()}đ
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md transition flex items-center justify-center shrink-0"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
