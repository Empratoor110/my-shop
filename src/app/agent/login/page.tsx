"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import MathCaptcha from "@/components/MathCaptcha";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function AgentLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  function refreshCaptcha() {
    setCaptchaKey((k) => k + 1);
  }

  async function sendOtp() {
    setError("");
    if (phone.length !== 11) {
      setError("شماره موبایل باید ۱۱ رقم باشد");
      return;
    }
    if (!captchaAnswer) {
      setError("لطفاً تأیید کنید که انسان هستید");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/agent/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, captchaToken, captchaAnswer }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setStep("otp");
    } else {
      setError(data.error);
      refreshCaptcha();
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/agent/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      localStorage.setItem("agentId", data.agentId);
      router.push(data.profileCompleted ? "/agent/status" : "/agent/profile");
    } else {
      setError(data.error);
    }
  }

  return (
    <div
      className={`${vazir.className} min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10`}
      dir="rtl"
      style={{
        background: "radial-gradient(1100px circle at 15% 10%, #123B3A 0%, #0B2A29 45%, #081F1E 100%)",
      }}
    >
      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-5">
          <div
            className="w-full px-6 py-4 rounded-2xl flex items-center justify-center text-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)",
              boxShadow: "0 8px 24px -6px rgba(193,68,60,0.55)",
            }}
          >
            <span className="text-[18px] font-extrabold" style={{ color: "#0B2A29" }}>
              پنل عاملین فروش سینابذر
            </span>
          </div>
        </div>

        <div
          className="rounded-[28px] p-8 relative"
          style={{
            background: "#FFFCF6",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(231,169,76,0.15)",
          }}
        >
          <div className="text-center mb-7">
            <h1 className="text-[20px] font-extrabold" style={{ color: "#12312F" }}>
              ورود عامل فروش
            </h1>
            <p className="text-[13px] mt-2" style={{ color: "#7A8A87" }}>
              {step === "phone"
                ? "شماره موبایل خود را وارد کنید"
                : `کد ارسال‌شده به ${phone} را وارد کنید`}
            </p>
          </div>

          {step === "phone" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5 mr-1" style={{ color: "#4B5B58" }}>
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full rounded-2xl px-4 py-3.5 text-center text-lg font-medium outline-none transition-all duration-200 border-2"
                  style={{ borderColor: "#E7E2D3", background: "#FBF9F2", color: "#12312F" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E7E2D3")}
                  dir="ltr"
                />
              </div>

              <div className="rounded-2xl p-3" style={{ background: "#FBF9F2", border: "1px solid #E7E2D3" }}>
                <MathCaptcha
                  key={captchaKey}
                  onChange={(token, answer) => {
                    setCaptchaToken(token);
                    setCaptchaAnswer(answer);
                  }}
                />
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  color: "#FFFCF6",
                  boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
                }}
              >
                {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-3.5 text-center text-[13px] font-medium"
                style={{ background: "#FBF3E4", color: "#8A6017", border: "1px solid #EFD9A8" }}
              >
                کد تأیید به شماره {phone} پیامک شد
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5 mr-1" style={{ color: "#4B5B58" }}>
                  کد یکبار مصرف
                </label>
                <input
                  type="text"
                  placeholder="• • • • •"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full rounded-2xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] outline-none transition-all duration-200 border-2"
                  style={{ borderColor: "#E7E2D3", background: "#FBF9F2", color: "#12312F" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E7E2D3")}
                  dir="ltr"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  color: "#FFFCF6",
                  boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
                }}
              >
                {loading ? "در حال تأیید..." : "تأیید و ورود"}
              </button>

              <button
                onClick={() => setStep("phone")}
                className="w-full text-[13px] py-1.5 font-medium transition-colors"
                style={{ color: "#8A9A97" }}
              >
                تغییر شماره موبایل
              </button>
            </div>
          )}

          {error && (
            <div
              className="mt-4 rounded-2xl p-3 text-[13px] text-center font-medium flex items-center justify-center gap-2"
              style={{ background: "#FBEAE8", color: "#A8332C", border: "1px solid #F2C7C2" }}
            >
              <span>⚠</span>
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
