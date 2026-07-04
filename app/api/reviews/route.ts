import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đánh giá sản phẩm" }, { status: 401 });
    }

    const { productId, rating, comment, title } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Thiếu thông tin đánh giá" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Điểm đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
    }

    // Save review
    const review = await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
        title,
      },
    });

    // Update product average rating
    const aggregate = await db.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
    });

    await db.product.update({
      where: { id: productId },
      data: {
        averageRating: aggregate._avg.rating || rating,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
