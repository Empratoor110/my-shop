"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import MathCaptcha from "@/components/MathCaptcha";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function ContentAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  function refreshCaptcha() {
    setCaptchaKey((k) => k + 1);
  }

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("ایمیل و رمز عبور را وارد کنید");
      return;
    }
    if (!captchaAnswer) {
      setError("لطفاً تأیید کنید که انسان هستید");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/content-admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken, captchaAnswer }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem("contentAdminId", data.contentAdminId);
      router.push("/content-admin/varieties");
    } else {
      setError(data.error);
      refreshCaptcha();
    }
  }

  return (
    <div
      className={`${vazir.className} min-h-screen flex items-center justify-center relative overflow-hidden px-4`}
      dir="rtl"
      style={{
        // پس‌زمینه‌ی سبز-فیروزه‌ای متفاوت با صفحه‌ی ورود ادمین فروش، برای تمایز بصری کامل
        background: "radial-gradient(1000px circle at 15% 15%, #1F5C40 0%, #0F2E1E 55%, #081F14 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #E7A94C 0, #E7A94C 1px, transparent 1px, transparent 26px)",
        }}
      />

      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #2F6B45 0%, #123B27 100%)",
              border: "1px solid rgba(231,169,76,0.35)",
            }}
          >
            📝
          </div>
        </div>

        <div
          className="rounded-[24px] p-8"
          style={{
            background: "#102A1B",
            border: "1px solid rgba(231,169,76,0.18)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
          }}
        >
          <div className="text-center mb-7">
            <h1 className="text-[20px] font-extrabold" style={{ color: "#F4F1E6" }}>
              مدیریت محتوا
            </h1>
            <p className="text-[13px] mt-2" style={{ color: "#84A691" }}>
              ورود مخصوص ویرایش ارقام بذری، علف‌های هرز، بیماری‌ها و آفات
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold mb-1.5 mr-1" style={{ color: "#84A691" }}>
                ایمیل
              </label>
              <input
                type="email"
                placeholder="content@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none border-2 transition-colors"
                style={{ background: "#0B2115", borderColor: "#1D4A30", color: "#F4F1E6" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1D4A30")}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5 mr-1" style={{ color: "#84A691" }}>
                رمز عبور
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-xl px-4 py-3 outline-none border-2 transition-colors"
                style={{ background: "#0B2115", borderColor: "#1D4A30", color: "#F4F1E6" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1D4A30")}
                dir="ltr"
              />
            </div>

            <div className="rounded-xl p-3" style={{ background: "#0B2115", border: "1px solid #1D4A30" }}>
              <MathCaptcha
                key={captchaKey}
                onChange={(token, answer) => {
                  setCaptchaToken(token);
                  setCaptchaAnswer(answer);
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all duration-200 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #E7A94C 0%, #C98A2E 100%)",
                color: "#0B2A29",
                boxShadow: "0 10px 24px -8px rgba(231,169,76,0.45)",
              }}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </div>

          {error && (
            <div
              className="mt-4 rounded-xl p-3 text-[13px] text-center font-medium"
              style={{ background: "rgba(193,68,60,0.12)", color: "#E8918A", border: "1px solid rgba(193,68,60,0.3)" }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <a href="/" className="text-[11px] transition-colors" style={{ color: "#6E9280" }}>
            ← بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}
