import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  // Require login to checkout
  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch active shipping methods
  const shippingMethods = await db.shippingMethod.findMany({
    where: { isActive: true },
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8">
      <CheckoutClient shippingMethods={shippingMethods} />
    </div>
  );
}
