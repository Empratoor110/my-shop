"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import MathCaptcha from "@/components/MathCaptcha";

// فونت وزیرمتن — یه فونت فارسی با شخصیت، به‌جای فونت پیش‌فرض سیستم
const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function LoginPage() {
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
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setStep("otp");
      } else {
        setError(data.error || "خطا در ارسال کد تأیید");
        refreshCaptcha();
      }
    } catch (error) {
      setLoading(false);
      setError("خطا در ارتباط با سرور");
      refreshCaptcha();
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("phone", phone); // <-- ذخیره شماره تلفن
        router.push("/profile");
      } else {
        setError(data.error || "کد تأیید نامعتبر است");
      }
    } catch (error) {
      setLoading(false);
      setError("خطا در ارتباط با سرور");
    }
  }

  return (
    <div
      className={`${vazir.className} min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10`}
      dir="rtl"
      style={{
        background:
          "radial-gradient(1100px circle at 15% 10%, #123B3A 0%, #0B2A29 45%, #081F1E 100%)",
      }}
    >
      {/* الگوی تزئینی */}
      <svg
        aria-hidden
        className="absolute -top-16 -right-16 opacity-[0.09] pointer-events-none"
        width="380"
        height="380"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern id="tile" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M10 0 L20 10 L10 20 L0 10 Z"
              fill="none"
              stroke="#E7A94C"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#tile)" />
      </svg>
      <svg
        aria-hidden
        className="absolute -bottom-20 -left-20 opacity-[0.07] pointer-events-none"
        width="320"
        height="320"
        viewBox="0 0 100 100"
      >
        <rect width="100" height="100" fill="url(#tile)" />
      </svg>

      <div className="w-full max-w-sm relative">
        {/* نشان شرکت */}
        <div className="flex justify-center mb-5">
          <div
            className="w-full px-6 py-4 rounded-2xl flex items-center justify-center text-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)",
              boxShadow: "0 8px 24px -6px rgba(193,68,60,0.55)",
            }}
          >
            <span className="text-[22px] font-extrabold" style={{ color: "#0B2A29" }}>
              شرکت سینابذر همدان
            </span>
          </div>
        </div>

        <div
          className="rounded-[28px] p-8 relative"
          style={{
            background: "#FFFCF6",
            boxShadow:
              "0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(231,169,76,0.15)",
          }}
        >
          <div className="text-center mb-7">
            <h1
              className="text-[22px] font-extrabold tracking-tight"
              style={{ color: "#12312F" }}
            >
              فروش آنلاین بذر گندم
            </h1>
            <p className="text-[13px] mt-2" style={{ color: "#7A8A87" }}>
              {step === "phone"
                ? "شماره موبایل خود را وارد کنید"
                : `کد ارسال‌شده به ${phone} را وارد کنید`}
            </p>
          </div>

          {/* نشانگر مراحل */}
          <div className="flex items-center gap-2 mb-7 px-1">
            <StepDot active label="شماره" />
            <div
              className="flex-1 h-[2px] rounded-full transition-colors duration-300"
              style={{ background: step === "otp" ? "#E7A94C" : "#E7E2D3" }}
            />
            <StepDot active={step === "otp"} label="کد تأیید" />
          </div>

          {step === "phone" ? (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5 mr-1"
                  style={{ color: "#4B5B58" }}
                >
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full rounded-2xl px-4 py-3.5 text-center text-lg font-medium outline-none transition-all duration-200 border-2"
                  style={{
                    borderColor: "#E7E2D3",
                    background: "#FBF9F2",
                    color: "#12312F",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E7E2D3")}
                  dir="ltr"
                />
              </div>

              <div
                className="rounded-2xl p-3"
                style={{ background: "#FBF9F2", border: "1px solid #E7E2D3" }}
              >
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
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  color: "#FFFCF6",
                  boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
                }}
              >
                {loading && <Spinner />}
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
                <label
                  className="block text-[12px] font-semibold mb-1.5 mr-1"
                  style={{ color: "#4B5B58" }}
                >
                  کد یکبار مصرف
                </label>
                <input
                  type="text"
                  placeholder="• • • • •"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full rounded-2xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] outline-none transition-all duration-200 border-2"
                  style={{
                    borderColor: "#E7E2D3",
                    background: "#FBF9F2",
                    color: "#12312F",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#E7A94C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E7E2D3")}
                  dir="ltr"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  color: "#FFFCF6",
                  boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
                }}
              >
                {loading && <Spinner />}
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

        <div className="mt-6 text-center space-y-2">
          <div>
            <a href="/" className="text-xs transition-colors" style={{ color: "#4B6E6B" }}>
              ← بازگشت به صفحه اصلی
            </a>
          </div>
          <div>
            <a
              href="/admin/login"
              className="text-[11px] transition-colors"
              style={{ color: "#4B6E6B" }}
            >
              ورود مدیر سیستم
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full transition-all duration-300"
        style={{ background: active ? "#E7A94C" : "#E7E2D3" }}
      />
      <span
        className="text-[10px] font-semibold whitespace-nowrap"
        style={{ color: active ? "#8A6017" : "#B9C1BE" }}
      >
        {label}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}