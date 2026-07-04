import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const orderCreateSchema = z.object({
  recipientName: z.string().min(1, "Họ tên người nhận không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  streetAddress: z.string().min(1, "Địa chỉ giao hàng không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  district: z.string().min(1, "Quận/Huyện không được để trống"),
  city: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  shippingMethodId: z.string().uuid("Shipping Method ID không hợp lệ"),
  paymentMethod: z.string().min(1, "Phương thức thanh toán không hợp lệ"), // cod, bank_transfer, momo, vnpay
  couponCode: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "Đơn hàng phải chứa ít nhất một sản phẩm"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    const url = new URL(req.url);
    const orderNumber = url.searchParams.get("orderNumber");

    let where: any = {};
    
    // Normal user can only see their own orders
    if ((user as any).role !== "admin") {
      where.userId = user.id;
    }

    if (orderNumber) {
      where.orderNumber = orderNumber;
    }

    const orders = await db.order.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đặt hàng." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validation = orderCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Fetch shipping method
    const shippingMethod = await db.shippingMethod.findUnique({
      where: { id: data.shippingMethodId },
    });
    if (!shippingMethod) {
      return NextResponse.json({ error: "Phương thức vận chuyển không hợp lệ." }, { status: 400 });
    }

    // Execute order creation in a Prisma Transaction to ensure data consistency
    const order = await db.$transaction(async (tx) => {
      // 1. Validate and lock product stock
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true },
        });

        if (!product) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
        }

        if (!product.inventory || product.inventory.quantity < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng.`);
        }

        // Deduct inventory stock
        await tx.inventory.update({
          where: { productId: product.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        const activePrice = product.discountPrice !== null ? product.discountPrice : product.price;
        subtotal += activePrice * item.quantity;

        verifiedItems.push({
          productId: product.id,
          price: activePrice,
          quantity: item.quantity,
        });
      }

      // 2. Validate Coupon if provided
      let discountAmount = 0;
      let couponId: string | null = null;

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode },
        });

        if (!coupon || !coupon.isActive) {
          throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }

        if (new Date() < coupon.startsAt || new Date() > coupon.expiresAt) {
          throw new Error("Mã giảm giá đã hết hạn sử dụng.");
        }

        if (subtotal < coupon.minOrderValue) {
          throw new Error(`Mã giảm giá chỉ áp dụng cho đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ.`);
        }

        if (coupon.usageCount >= coupon.limitCount) {
          throw new Error("Mã giảm giá đã đạt giới hạn lượt sử dụng.");
        }

        if (coupon.discountType === "percentage") {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        couponId = coupon.id;

        // Increment coupon usage count
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      // 3. Create Address record
      const address = await tx.address.create({
        data: {
          userId,
          recipientName: data.recipientName,
          phone: data.phone,
          streetAddress: data.streetAddress,
          ward: data.ward,
          district: data.district,
          city: data.city,
          isDefault: false,
        },
      });

      const shippingFee = shippingMethod.price;
      const finalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          shippingMethodId: shippingMethod.id,
          totalAmount: subtotal,
          discountAmount,
          shippingFee,
          finalAmount,
          status: "pending",
          paymentStatus: data.paymentMethod === "cod" ? "unpaid" : "paid", // simulate instant success for non-COD payment methods
          notes: data.notes,
          couponId,
          items: {
            create: verifiedItems,
          },
        },
      });

      // 5. Create Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: data.paymentMethod,
          amount: finalAmount,
          status: data.paymentMethod === "cod" ? "pending" : "success",
          transactionId: data.paymentMethod === "cod" ? null : `TRANS-${Date.now()}`,
          rawResponse: JSON.stringify({ simulated: true, method: data.paymentMethod }),
        },
      });

      // 6. Record Coupon Usage if coupon was applied
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: newOrder.id,
          },
        });
      }

      // 7. Send notification to user
      await tx.notification.create({
        data: {
          userId,
          title: "Đặt hàng thành công",
          message: `Đơn hàng ${orderNumber} của bạn đã được đặt thành công với tổng tiền ${finalAmount.toLocaleString()}đ.`,
          type: "order",
        },
      });

      // 8. Create Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "create_order",
          entityName: "orders",
          entityId: newOrder.id,
          details: `User created order ${orderNumber}`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("API POST /orders error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
