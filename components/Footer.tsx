import Link from "next/link";
import { Laptop, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-400">
              <Laptop className="h-6 w-6" />
              <span>LAPTOP<span className="text-white">STORE</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              Chuyên cung cấp các dòng laptop gaming, ultrabook, workstation cao cấp chính hãng. Cam kết chất lượng, bảo hành uy tín, hỗ trợ trả góp 0%.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#" className="hover:text-indigo-400 transition">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition">Chính sách bảo hành</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition">Phương thức thanh toán</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition">Chính sách vận chuyển</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Danh Mục Sản Phẩm</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?categories=gaming-laptops" className="hover:text-indigo-400 transition">Laptop Gaming</Link>
              </li>
              <li>
                <Link href="/products?categories=ultrabooks" className="hover:text-indigo-400 transition">Ultrabook Cao Cấp</Link>
              </li>
              <li>
                <Link href="/products?categories=workstations" className="hover:text-indigo-400 transition">Máy Trạm Chuyên Nghiệp</Link>
              </li>
              <li>
                <Link href="/products?categories=office-laptops" className="hover:text-indigo-400 transition">Laptop Văn Phòng</Link>
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-semibold mb-4 text-base">Liên Hệ</h4>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>123 Đường Láng, phường Láng Hạ, quận Đống Đa, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>0987.654.321 (8:00 - 21:00)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>support@laptopstore.vn</span>
            </div>
          </div>

        </div>

        {/* Bottom footer */}
        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Laptop Store. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400 transition">Điều khoản bảo mật</Link>
            <Link href="#" className="hover:text-slate-400 transition">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
