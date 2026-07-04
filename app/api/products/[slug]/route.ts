import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  SKU: z.string().min(1).optional(),
  description: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  ssd: z.string().optional(),
  gpu: z.string().optional(),
  screen: z.string().optional(),
  os: z.string().optional(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
});

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
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
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("API GET /products/[slug] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Check product existence
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { ...data };
    delete updateData.quantity; // managed separately in Inventory

    // Update product
    const updatedProduct = await db.product.update({
      where: { slug },
      data: {
        ...updateData,
        ...(data.quantity !== undefined && {
          inventory: {
            update: {
              quantity: data.quantity,
            },
          },
        }),
      },
      include: {
        images: true,
        inventory: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("API PUT /products/[slug] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { slug } = await params;
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    await db.product.delete({ where: { slug } });

    return NextResponse.json({ message: "Xóa sản phẩm thành công" });
  } catch (error: any) {
    console.error("API DELETE /products/[slug] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
