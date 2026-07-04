import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 400 });
    }

    // Get default 'user' role
    let userRole = await db.role.findUnique({
      where: { name: "user" },
    });

    // Fallback in case seed wasn't run
    if (!userRole) {
      userRole = await db.role.create({
        data: {
          name: "user",
          description: "Standard registered customer",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id,
        status: "active",
      },
    });

    // Create default cart and wishlist for new user
    await db.cart.create({
      data: { userId: newUser.id },
    });

    await db.wishlist.create({
      data: { userId: newUser.id },
    });

    // Create log
    await db.auditLog.create({
      data: {
        userId: newUser.id,
        action: "register_user",
        entityName: "users",
        entityId: newUser.id,
        details: "User registered account",
      },
    });

    return NextResponse.json({
      message: "Đăng ký tài khoản thành công",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
