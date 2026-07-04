import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await db.user.findMany({
      include: {
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Omit passwords
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, roleName, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;

    if (roleName) {
      const role = await db.role.findUnique({
        where: { name: roleName },
      });
      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }
      updateData.roleId = role.id;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    // Omit password
    const { password, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
