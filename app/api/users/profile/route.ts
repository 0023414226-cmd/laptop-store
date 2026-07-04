import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        addresses: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    // Omit password
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, avatar, oldPassword, newPassword } = body;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    // Handle Password Change if requested
    if (oldPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Mật khẩu cũ không chính xác" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log action
    await db.auditLog.create({
      data: {
        userId,
        action: "update_profile",
        entityName: "users",
        entityId: userId,
        details: "User updated profile info",
      },
    });

    return NextResponse.json({
      message: "Cập nhật tài khoản thành công",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
