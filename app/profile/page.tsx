import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const userId = session.user.id;

  // Query user info and orders concurrently
  const [user, orders] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        role: true,
      },
    }),
    db.order.findMany({
      where: { userId },
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
        shippingMethod: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Omit password
  const { password, ...safeUser } = user;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
          Đang tải thông tin hồ sơ...
        </div>
      }>
        <ProfileClient initialUser={safeUser} initialOrders={orders} />
      </Suspense>
    </div>
  );
}
