import { db } from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Core KPIs
  const [totalOrders, totalCustomersCount, ordersSum] = await Promise.all([
    db.order.count(),
    db.user.count({
      where: {
        role: { name: "user" },
      },
    }),
    db.order.aggregate({
      where: {
        status: { not: "cancelled" },
      },
      _sum: {
        finalAmount: true,
      },
    }),
  ]);

  const totalRevenue = ordersSum._sum.finalAmount || 0;

  // 2. Best Selling Laptops
  const bestSellersRaw = await db.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: { status: { not: "cancelled" } },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  const bestSellers = await Promise.all(
    bestSellersRaw.map(async (item) => {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: { images: true },
      });
      return {
        productId: item.productId,
        name: product?.name || "Unknown Product",
        price: product?.price || 0,
        discountPrice: product?.discountPrice || null,
        image: product?.images?.[0]?.url || "",
        quantitySold: item._sum.quantity || 0,
      };
    })
  );

  // 3. Top Spending Customers
  const topCustomersRaw = await db.order.groupBy({
    by: ["userId"],
    where: {
      status: { not: "cancelled" },
    },
    _sum: {
      finalAmount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        finalAmount: "desc",
      },
    },
    take: 5,
  });

  const topCustomers = await Promise.all(
    topCustomersRaw.map(async (item) => {
      const user = await db.user.findUnique({
        where: { id: item.userId },
      });
      return {
        userId: item.userId,
        name: user?.name || "Khách Hàng Ẩn Danh",
        email: user?.email || "",
        avatar: user?.avatar || "",
        totalOrders: item._count.id || 0,
        totalSpent: item._sum.finalAmount || 0,
      };
    })
  );

  // 4. Daily Sales History (Last 7 Days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const dailyStats = await db.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "cancelled" },
      },
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    chartData.push({
      date: startOfDay.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
      revenue: dailyStats._sum.finalAmount || 0,
      orders: dailyStats._count.id || 0,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">Báo Cáo Tổng Quan</h1>
        <p className="text-xs text-slate-500 mt-1">Số liệu hiệu suất bán hàng của hệ thống cửa hàng Laptop</p>
      </div>

      <AdminDashboardClient
        stats={{
          totalRevenue,
          totalOrders,
          totalCustomers: totalCustomersCount,
        }}
        bestSellers={bestSellers}
        topCustomers={topCustomers}
        chartData={chartData}
      />
    </div>
  );
}
