import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để sử dụng mã giảm giá" }, { status: 401 });
    }

    const { code, orderValue } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Mã giảm giá không được để trống" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.startsAt || now > coupon.expiresAt) {
      return NextResponse.json({ error: "Mã giảm giá đã hết hạn sử dụng" }, { status: 400 });
    }

    if (coupon.usageCount >= coupon.limitCount) {
      return NextResponse.json({ error: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
    }

    if (orderValue !== undefined && orderValue < coupon.minOrderValue) {
      return NextResponse.json({
        error: `Mã giảm giá này chỉ áp dụng cho đơn hàng từ ${coupon.minOrderValue.toLocaleString()}đ trở lên`,
      }, { status: 400 });
    }

    // Verify if user already used this coupon (optional constraint, let's allow single use per user)
    const usage = await db.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: session.user.id,
      },
    });

    if (usage) {
      return NextResponse.json({ error: "Bạn đã sử dụng mã giảm giá này cho đơn hàng khác" }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
