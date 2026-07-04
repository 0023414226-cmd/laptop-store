"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface FlashSaleProps {
  products: any[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target time to end of today
    const calculateTimeLeft = () => {
      const difference = +new Date().setHours(23, 59, 59, 999) - +new Date();
      let timeLeftObj = { hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftObj = {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeftObj;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-red-500 tracking-tight flex items-center gap-2">
            <span className="animate-pulse text-2xl">🔥</span> FLASH SALE
          </h2>
          <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-500/20">
            GIÁ SỐC MỖI NGÀY
          </span>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Kết thúc sau:</span>
          <div className="flex items-center gap-1 font-mono">
            <span className="bg-red-600 text-white rounded px-2 py-1 text-sm min-w-[28px] text-center">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-red-500 font-bold">:</span>
            <span className="bg-red-600 text-white rounded px-2 py-1 text-sm min-w-[28px] text-center">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-red-500 font-bold">:</span>
            <span className="bg-red-600 text-white rounded px-2 py-1 text-sm min-w-[28px] text-center">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

      </div>

      {/* Product List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            {/* Simple availability bar overlayed or placed under card */}
            <div className="mt-2 px-1">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Đã bán: 18</span>
                <span>Còn lại: {product.inventory?.quantity || 10}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
