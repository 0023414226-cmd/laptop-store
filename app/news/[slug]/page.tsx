import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, User, ArrowLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export default async function NewsDetailPage({ params }: RouteParams) {
  const { slug } = await params;

  const article = await db.news.findUnique({
    where: { slug },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!article || article.status !== "published") {
    notFound();
  }

  // Increment view count inside the server component
  try {
    await db.news.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to increment article views:", error);
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Back Link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xxs font-bold tracking-wider text-slate-400 hover:text-white uppercase mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-xxs font-semibold text-slate-400 border-y border-slate-900 py-4 mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-indigo-400" />
            {article.viewCount + 1} lượt xem
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-indigo-400" />
            Đăng bởi: <span className="text-indigo-300">{article.user.name}</span>
          </span>
          <span className="flex items-center gap-1.5 ml-auto text-slate-500">
            <Clock className="h-4 w-4" /> 5 phút đọc
          </span>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 bg-slate-950 border border-slate-900">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="bg-slate-900/20 border border-slate-900/60 p-6 sm:p-10 rounded-2xl backdrop-blur-sm">
          <div
            className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 font-normal"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Share Section (Simulated) */}
        <div className="border-t border-slate-900 pt-8 mt-10 flex items-center justify-between text-xxs font-bold text-slate-400">
          <span>Hỗ trợ chia sẻ bài viết này:</span>
          <div className="flex gap-4">
            <button className="text-indigo-400 hover:text-indigo-300 transition">Facebook</button>
            <button className="text-indigo-400 hover:text-indigo-300 transition">Twitter/X</button>
            <button className="text-indigo-400 hover:text-indigo-300 transition">Copy Link</button>
          </div>
        </div>

      </div>
    </div>
  );
}
