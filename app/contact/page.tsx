"use client";

import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, CheckCircle2, Building } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Họ và tên tối thiểu phải có 2 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(5, "Tiêu đề tối thiểu phải có 5 ký tự"),
  message: z.string().min(10, "Nội dung tin nhắn tối thiểu phải có 10 ký tự"),
});

type FormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setSuccess(false);
    setLoading(true);

    // Validate using Zod
    const validationResult = contactFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Map backend field errors
          const backendErrors: Partial<Record<keyof FormData, string>> = {};
          Object.keys(result.errors).forEach((key) => {
            backendErrors[key as keyof FormData] = result.errors[key][0];
          });
          setErrors(backendErrors);
        } else {
          setGeneralError(result.error || "Gửi thông tin thất bại.");
        }
      } else {
        setSuccess(true);
        // Clear form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (err) {
      setGeneralError("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold tracking-wider text-indigo-400 bg-indigo-500/10 uppercase mb-4">
            <Building className="h-3.5 w-3.5" /> Liên hệ hỗ trợ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 tracking-tight">
            Kết Nối Với Chúng Tôi
          </h1>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            Bạn có câu hỏi, đóng góp ý kiến hoặc cần hỗ trợ kỹ thuật? Đừng ngần ngại gửi tin nhắn cho chúng tôi. Đội ngũ hỗ trợ sẽ phản hồi bạn trong vòng 24 giờ làm việc.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Contact info & Map */}
          <div className="space-y-8">
            <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-6">Thông Tin Liên Hệ</h2>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trụ sở</h3>
                    <p className="mt-1 text-slate-200 text-xs leading-relaxed">
                      Tòa nhà TechCenter, 123 Đường Láng, phường Láng Hạ, quận Đống Đa, Hà Nội.
                    </p>
                  </div>
                </div>

                {/* Hotlines */}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điện thoại / Hotline</h3>
                    <p className="mt-1 text-slate-200 text-xs">
                      1900 8888 (Tổng đài hỗ trợ 24/7)
                    </p>
                    <p className="text-slate-400 text-xxs mt-0.5">
                      0987 654 321 (Bộ phận kinh doanh)
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</h3>
                    <p className="mt-1 text-slate-200 text-xs">
                      support@laptopstore.vn (Hỗ trợ kỹ thuật)
                    </p>
                    <p className="text-slate-400 text-xxs mt-0.5">
                      contact@laptopstore.vn (Liên hệ hợp tác)
                    </p>
                  </div>
                </div>

                {/* Operating hours */}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giờ làm việc</h3>
                    <p className="mt-1 text-slate-200 text-xs">
                      Thứ 2 - Thứ 7: 8:00 AM - 9:00 PM
                    </p>
                    <p className="text-slate-400 text-xxs mt-0.5">
                      Chủ Nhật: 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulated Map */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden relative group">
              <div className="absolute top-4 left-4 z-10 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xxs font-bold text-slate-300 backdrop-blur-sm">
                Vị trí của chúng tôi trên bản đồ
              </div>
              <div className="h-64 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden relative flex items-center justify-center">
                {/* Techy map background representation */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-35"></div>
                <div className="absolute h-24 w-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="relative z-10 text-center space-y-2">
                  <MapPin className="h-10 w-10 text-indigo-400 mx-auto animate-bounce" />
                  <p className="text-xs text-white font-bold">LAPTOP STORE HÀ NỘI</p>
                  <p className="text-[10px] text-slate-500">123 Đường Láng, Đống Đa, Hà Nội</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-6">Gửi Tin Nhắn Cho Chúng Tôi</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.</span>
                </div>
              )}

              {generalError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Họ và tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                    errors.name ? "border-red-500/60 focus:ring-red-500" : "border-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                      errors.email ? "border-red-500/60 focus:ring-red-500" : "border-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0987654321"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                      errors.phone ? "border-red-500/60 focus:ring-red-500" : "border-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                  {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tiêu đề liên hệ *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Cần hỗ trợ về..."
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                    errors.subject ? "border-red-500/60 focus:ring-red-500" : "border-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
                {errors.subject && <p className="text-red-400 text-[10px] mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Nội dung tin nhắn *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Nhập nội dung chi tiết..."
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                    errors.message ? "border-red-500/60 focus:ring-red-500" : "border-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                ></textarea>
                {errors.message && <p className="text-red-400 text-[10px] mt-1">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? "Đang xử lý gửi..." : "Gửi thông tin liên hệ"}
                {!loading && <Send className="h-4 w-4" />}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
