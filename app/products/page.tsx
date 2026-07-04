import { db } from "@/lib/db";
import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // Fetch filter metadata (categories, brands) on server
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
    db.brand.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
          Đang tải danh sách laptop...
        </div>
      }>
        <ProductsClient initialCategories={categories} initialBrands={brands} />
      </Suspense>
    </div>
  );
}
