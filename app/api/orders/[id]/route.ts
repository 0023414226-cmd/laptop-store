import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
        shippingMethod: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    // Authorize: Admin or the owner
    if ((session.user as any).role !== "admin" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    const order = await db.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "admin";
    const isOwner = order.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Business Logic: Owner can only CANCEL order, and only if status is "pending"
    if (!isAdmin && isOwner) {
      if (status !== "cancelled") {
        return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 });
      }

      if (order.status !== "pending") {
        return NextResponse.json({ error: "Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý." }, { status: 400 });
      }
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    // If cancelled, return inventory stock
    if (status === "cancelled" && order.status !== "cancelled") {
      const orderItems = await db.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of orderItems) {
        await db.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Send notifications
    await db.notification.create({
      data: {
        userId: order.userId,
        title: "Cập nhật trạng thái đơn hàng",
        message: `Đơn hàng ${order.orderNumber} đã chuyển sang trạng thái: ${
          status === "processing" ? "Đang xử lý" :
          status === "shipping" ? "Đang giao hàng" :
          status === "completed" ? "Đã giao thành công" :
          status === "cancelled" ? "Đã bị hủy" : status
        }`,
        type: "order",
      },
    });

    // Log action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "update_order_status",
        entityName: "orders",
        entityId: id,
        details: `Order status updated to ${status}. Payment status: ${paymentStatus}`,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
