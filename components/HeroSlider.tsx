"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return null;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden bg-slate-950 rounded-xl">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative shrink-0">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover brightness-[0.4]"
            />
            {/* Overlay content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl text-left">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow">
                {banner.title}
              </h2>
              <p className="mt-2 md:mt-4 text-xs md:text-sm text-slate-300">
                Sở hữu ngay những chiếc laptop hiệu năng khủng với ưu đãi cực hấp dẫn dành riêng cho học sinh, sinh viên và game thủ chuyên nghiệp.
              </p>
              {banner.linkUrl && (
                <div className="mt-6">
                  <Link
                    href={banner.linkUrl}
                    className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-md transition"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  current === idx ? "bg-indigo-500 w-4" : "bg-slate-500"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
