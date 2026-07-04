"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function HeaderFooterWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide header and footer for admin routes and auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-950">{children}</main>
      <Footer />
    </>
  );
}
