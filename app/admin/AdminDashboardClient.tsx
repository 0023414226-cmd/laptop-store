"use client";

import { DollarSign, ShoppingBag, Users, ChevronUp, Star } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
}

interface BestSeller {
  productId: string;
  name: string;
  price: number;
  discountPrice: number | null;
  image: string;
  quantitySold: number;
}

interface TopCustomer {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
}

interface ChartItem {
  date: string;
  revenue: number;
  orders: number;
}

interface AdminDashboardClientProps {
  stats: Stats;
  bestSellers: BestSeller[];
  topCustomers: TopCustomer[];
  chartData: ChartItem[];
}

export default function AdminDashboardClient({
  stats,
  bestSellers,
  topCustomers,
  chartData,
}: AdminDashboardClientProps) {
  
  // Find max values for SVG charting heights
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 10000000);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);

  return (
    <div className="space-y-8">
      
      {/* 1. Core KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-md">
          <div className="space-y-2">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tổng doanh thu</span>
            <h3 className="text-xl font-black text-indigo-400">
              {stats.totalRevenue.toLocaleString()}đ
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ChevronUp className="h-3.5 w-3.5" /> +14.2% so với tháng trước
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-md">
          <div className="space-y-2">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</span>
            <h3 className="text-xl font-black text-slate-200">
              {stats.totalOrders.toLocaleString()} đơn
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ChevronUp className="h-3.5 w-3.5" /> +8.7% so với tuần trước
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-md">
          <div className="space-y-2">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tổng khách hàng</span>
            <h3 className="text-xl font-black text-slate-200">
              {stats.totalCustomers.toLocaleString()} người
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ChevronUp className="h-3.5 w-3.5" /> +5.3% thành viên mới
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 2. Charts Row (Sales & Orders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Lịch sử doanh thu</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Biểu đồ doanh thu 7 ngày qua</p>
          </div>
          
          {/* Custom SVG Line/Area Chart */}
          <div className="h-56 relative w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="500" y2="0" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="66" x2="500" y2="66" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="133" x2="500" y2="133" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#334155" strokeWidth="1" />

              {/* Area path */}
              <path
                d={`M 0 200 
                  ${chartData.map((d, idx) => {
                    const x = (idx / 6) * 500;
                    const y = 200 - (d.revenue / maxRevenue) * 160;
                    return `L ${x} ${y}`;
                  }).join(" ")} 
                  L 500 200 Z`}
                fill="url(#revGrad)"
                opacity="0.15"
              />

              {/* Line path */}
              <path
                d={chartData.map((d, idx) => {
                  const x = (idx / 6) * 500;
                  const y = 200 - (d.revenue / maxRevenue) * 160;
                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Dots */}
              {chartData.map((d, idx) => {
                const x = (idx / 6) * 500;
                const y = 200 - (d.revenue / maxRevenue) * 160;
                return <circle key={idx} cx={x} cy={y} r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="1.5" />;
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X Axis labels */}
            <div className="flex justify-between text-[10px] text-slate-500 pt-3">
              {chartData.map((d, idx) => (
                <span key={idx}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sản lượng đơn hàng</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Biểu đồ khối lượng đơn đặt 7 ngày qua</p>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-56 relative w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="500" y2="0" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="66" x2="500" y2="66" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="133" x2="500" y2="133" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#334155" strokeWidth="1" />

              {/* Bars */}
              {chartData.map((d, idx) => {
                const width = 28;
                const x = (idx / 6) * 440 + 30 - width / 2;
                const barHeight = (d.orders / maxOrders) * 160;
                const y = 200 - barHeight;

                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={width}
                    height={Math.max(barHeight, 2)}
                    rx="3"
                    fill="#10b981"
                    opacity="0.85"
                    className="hover:opacity-100 transition duration-200"
                  />
                );
              })}
            </svg>

            {/* X Axis labels */}
            <div className="flex justify-between text-[10px] text-slate-500 pt-3 px-2">
              {chartData.map((d, idx) => (
                <span key={idx}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed stats (Best sellers & Top customers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best sellers Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" /> Laptop Bán Chạy Nhất
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold">
                  <th className="pb-3 w-12">Ảnh</th>
                  <th className="pb-3">Tên Laptop</th>
                  <th className="pb-3 text-right">Giá bán</th>
                  <th className="pb-3 text-right">Đã bán</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item) => (
                  <tr key={item.productId} className="border-b border-slate-850 hover:bg-slate-900/60">
                    <td className="py-3">
                      <img src={item.image} alt={item.name} className="h-8 w-12 object-cover rounded bg-slate-950" />
                    </td>
                    <td className="py-3 font-semibold text-slate-200 truncate max-w-[180px]">{item.name}</td>
                    <td className="py-3 text-right font-semibold text-slate-400">
                      {(item.discountPrice !== null ? item.discountPrice : item.price).toLocaleString()}đ
                    </td>
                    <td className="py-3 text-right font-bold text-indigo-400">{item.quantitySold} chiếc</td>
                  </tr>
                ))}

                {bestSellers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">Chưa ghi nhận số liệu bán hàng.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spending Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-indigo-400" /> Khách Hàng VIP
          </h4>
          <div className="space-y-4">
            {topCustomers.map((cust) => (
              <div key={cust.userId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {cust.avatar ? (
                    <img src={cust.avatar} alt={cust.name} className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-850 flex items-center justify-center font-bold text-white">
                      {cust.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-slate-200">{cust.name}</h5>
                    <p className="text-[10px] text-slate-500">{cust.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-400">{cust.totalSpent.toLocaleString()}đ</span>
                  <p className="text-[9px] text-slate-500">{cust.totalOrders} đơn hàng</p>
                </div>
              </div>
            ))}

            {topCustomers.length === 0 && (
              <p className="text-center py-6 text-slate-500">Chưa ghi nhận giao dịch khách hàng.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
