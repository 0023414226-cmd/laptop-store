import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  price: z.number().min(0, "Giá sản phẩm không hợp lệ"),
  discountPrice: z.number().min(0).nullable().optional(),
  brandId: z.string().uuid("Brand ID không hợp lệ"),
  categoryId: z.string().uuid("Category ID không hợp lệ"),
  SKU: z.string().min(1, "SKU không được để trống"),
  description: z.string().optional(),
  cpu: z.string().min(1, "Thông tin CPU không được để trống"),
  ram: z.string().min(1, "Thông tin RAM không được để trống"),
  ssd: z.string().min(1, "Thông tin SSD không được để trống"),
  gpu: z.string().min(1, "Thông tin GPU không được để trống"),
  screen: z.string().min(1, "Thông tin màn hình không được để trống"),
  os: z.string().min(1, "Hệ điều hành không được để trống"),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  images: z.array(z.string().url()).min(1, "Cần ít nhất một ảnh sản phẩm"),
  quantity: z.number().int().min(0).default(10),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "newest";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    
    const brands = url.searchParams.get("brands")?.split(",").filter(Boolean) || [];
    const categories = url.searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const cpu = url.searchParams.get("cpu")?.split(",").filter(Boolean) || [];
    const ram = url.searchParams.get("ram")?.split(",").filter(Boolean) || [];
    const ssd = url.searchParams.get("ssd")?.split(",").filter(Boolean) || [];
    const gpu = url.searchParams.get("gpu")?.split(",").filter(Boolean) || [];
    const os = url.searchParams.get("os")?.split(",").filter(Boolean) || [];
    
    const minPrice = parseFloat(url.searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "999999999");

    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {
      status: "active",
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { SKU: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brands.length > 0) {
      where.brand = {
        slug: { in: brands },
      };
    }

    if (categories.length > 0) {
      where.category = {
        slug: { in: categories },
      };
    }

    // Spec filters (fuzzy matches or array in)
    if (cpu.length > 0) {
      where.OR = cpu.map(c => ({
        cpu: { contains: c, mode: "insensitive" }
      }));
    }

    if (ram.length > 0) {
      const ramConditions = ram.map(r => ({
        ram: { contains: r, mode: "insensitive" }
      }));
      where.AND = where.AND || [];
      where.AND.push({ OR: ramConditions });
    }

    if (ssd.length > 0) {
      const ssdConditions = ssd.map(s => ({
        ssd: { contains: s, mode: "insensitive" }
      }));
      where.AND = where.AND || [];
      where.AND.push({ OR: ssdConditions });
    }

    if (gpu.length > 0) {
      const gpuConditions = gpu.map(g => ({
        gpu: { contains: g, mode: "insensitive" }
      }));
      where.AND = where.AND || [];
      where.AND.push({ OR: gpuConditions });
    }

    if (os.length > 0) {
      const osConditions = os.map(o => ({
        os: { contains: o, mode: "insensitive" }
      }));
      where.AND = where.AND || [];
      where.AND.push({ OR: osConditions });
    }

    // Build sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "rating") {
      orderBy = { averageRating: "desc" };
    } else if (sort === "popular") {
      orderBy = { isBestSeller: "desc" };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: true,
          brand: true,
          category: true,
          inventory: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("API GET /products error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // Create unique slug from name
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check slug collision
    const existing = await db.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const newProduct = await db.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        SKU: data.SKU,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        brandId: data.brandId,
        categoryId: data.categoryId,
        cpu: data.cpu,
        ram: data.ram,
        ssd: data.ssd,
        gpu: data.gpu,
        screen: data.screen,
        os: data.os,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        inventory: {
          create: {
            quantity: data.quantity,
            lowStockThreshold: 5,
          },
        },
        images: {
          create: data.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
          })),
        },
      },
      include: {
        images: true,
        inventory: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("API POST /products error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
