import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Calculate General KPI Statistics
    const [totalOrders, totalUsersCount, ordersSum] = await Promise.all([
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

    // 2. Query Best Selling Products (grouped by product quantity sold)
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

    // 3. Generate Chart Data (daily revenue & orders for the last 7 days)
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

    // 4. Query Top Customers based on total spend
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

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers: totalUsersCount,
      },
      bestSellers,
      chartData,
      topCustomers,
    });
  } catch (error: any) {
    console.error("API GET /admin/stats error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
