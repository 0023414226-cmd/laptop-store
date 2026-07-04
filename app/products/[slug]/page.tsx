import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: RouteParams) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: "Sản phẩm không tìm thấy",
    };
  }

  return {
    title: `${product.name} - Laptop Store`,
    description: product.description || `Chi tiết sản phẩm ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: RouteParams) {
  const { slug } = await params;

  // Query product details
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: true,
      brand: true,
      category: true,
      inventory: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Query related products (same category, excluding current product)
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "active",
    },
    include: {
      images: true,
    },
    take: 4,
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8">
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
