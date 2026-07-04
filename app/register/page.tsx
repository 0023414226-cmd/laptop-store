"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Laptop, Mail, Lock, User, AlertCircle, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu nhập lại không trùng khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng...");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 1500);
      } else {
        setErrorMsg(data.error || "Đăng ký thất bại.");
      }
    } catch (err) {
      setErrorMsg("Đã xảy ra lỗi đăng ký tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md relative z-10">
        
        {/* Brand logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-indigo-400">
            <Laptop className="h-8 w-8" />
            <span>LAPTOP<span className="text-white">STORE</span></span>
          </Link>
          <h2 className="mt-6 text-xl font-bold text-white tracking-tight">Tạo tài khoản mới</h2>
          <p className="mt-1.5 text-xs text-slate-500">Đăng ký để nhận các ưu đãi laptop tốt nhất</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nguyễn Văn A"
              />
              <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-600" />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="name@example.com"
              />
              <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-600" />
            </div>
          </div>

          {/* Password input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Nhập lại MK</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-600" />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            {loading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
}
