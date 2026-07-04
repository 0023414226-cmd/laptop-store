import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, User, ArrowRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await db.news.findMany({
    where: { status: "published" },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold tracking-wider text-indigo-400 bg-indigo-500/10 uppercase mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Tin tức công nghệ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 tracking-tight">
            Bản Tin Công Nghệ & Xu Hướng
          </h1>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            Cập nhật xu hướng công nghệ mới nhất, đánh giá laptop chuyên sâu và hướng dẫn công nghệ hữu ích cho bạn.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-slate-800 rounded-2xl max-w-xl mx-auto">
            <p className="text-slate-400 text-xs">Hiện tại chưa có tin tức nào được đăng tải.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline">
              Quay lại trang chủ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const formattedDate = new Date(article.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <article
                  key={article.id}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition duration-300 group flex flex-col shadow-lg backdrop-blur-sm"
                >
                  {/* Cover Image */}
                  <Link href={`/news/${article.slug}`} className="relative block h-52 overflow-hidden bg-slate-950">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xxs font-semibold text-slate-500 mb-3.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.viewCount} lượt xem
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {article.user.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition mb-3 line-clamp-2">
                      <Link href={`/news/${article.slug}`}>{article.title}</Link>
                    </h2>

                    {/* Summary */}
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                      {article.summary}
                    </p>

                    {/* Footer / Link */}
                    <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xxs font-bold tracking-wider text-indigo-400 hover:text-indigo-300 uppercase transition"
                      >
                        Đọc chi tiết <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
