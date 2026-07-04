import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import HeaderFooterWrapper from "@/components/HeaderFooterWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laptop Store - Hệ Thống Laptop Cao Cấp, Gaming Chính Hãng",
  description: "Mua laptop gaming, ultrabook, workstation cấu hình mạnh mẽ, uy tín chất lượng, hỗ trợ trả góp 0%, giao hàng nhanh toàn quốc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AuthProvider>
          <HeaderFooterWrapper>{children}</HeaderFooterWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
