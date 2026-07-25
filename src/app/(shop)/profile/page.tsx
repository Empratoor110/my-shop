"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import UserHeader from "@/components/UserHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    farmLocation: "",
    phone: "",
    sheba: "",
    referralCode: "",
  });

  // دریافت شماره از localStorage با کلید "phone"
  useEffect(() => {
    const userPhone = localStorage.getItem("phone") || "";
    if (userPhone) {
      setForm(prev => ({ ...prev, phone: userPhone }));
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setError("");
    if (!form.firstName || !form.lastName || !form.fatherName || !form.farmLocation || !form.phone || !form.sheba) {
      setError("لطفاً همه فیلدهای اجباری را پر کنید");
      return;
    }
    if (form.phone.length !== 11) {
      setError("شماره تماس باید ۱۱ رقم باشد");
      return;
    }
    if (form.sheba.length !== 24) {
      setError("شماره شبا باید ۲۴ کاراکتر باشد");
      return;
    }
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push("/cart");
    } else {
      setError(data.error);
    }
  }

  const inputStyle = {
    background: "#FBF9F2",
    borderColor: "#E7E2D3",
    color: "#12312F",
  };

  const readOnlyStyle = {
    background: "#F0EEE8", // کمی تیره‌تر برای مشخص شدن غیرفعال بودن
    borderColor: "#D5D0C4",
    color: "#7A8A87",
    cursor: "not-allowed",
  };

  return (
    <div className={`${vazir.className} min-h-screen py-8`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <UserHeader />
      <div className="flex items-center justify-center px-4 mt-4">
        <div
          className="p-8 rounded-[28px] w-full max-w-sm"
          style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 20px 50px -24px rgba(18,49,47,0.35)" }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)" }}
              >
                👤
              </div>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "#12312F" }}>
              تکمیل اطلاعات
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7A8A87" }}>
              لطفاً اطلاعات خود را وارد کنید
            </p>
          </div>

          <div className="space-y-4">
            {/* اطلاعات هویتی */}
            <div>
              <p className="text-[11px] font-bold mb-2 mr-1" style={{ color: "#8A6017" }}>
                اطلاعات هویتی
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="نام *">
                  <input
                    name="firstName"
                    placeholder="نام"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                  />
                </Field>
                <Field label="نام خانوادگی *">
                  <input
                    name="lastName"
                    placeholder="نام خانوادگی"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                  />
                </Field>
              </div>
              <div className="mt-2.5">
                <Field label="نام پدر *">
                  <input
                    name="fatherName"
                    placeholder="نام پدر"
                    value={form.fatherName}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            {/* اطلاعات کشاورزی */}
            <div>
              <p className="text-[11px] font-bold mb-2 mr-1" style={{ color: "#8A6017" }}>
                اطلاعات کشت
              </p>
              <div className="space-y-2.5">
                <Field label="محل کشت *">
                  <input
                    name="farmLocation"
                    placeholder="استان، شهر، روستا"
                    value={form.farmLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            {/* اطلاعات تماس و بانکی */}
            <div>
              <p className="text-[11px] font-bold mb-2 mr-1" style={{ color: "#8A6017" }}>
                اطلاعات تماس و واریز
              </p>
              <div className="space-y-2.5">
                <Field label="شماره تماس *">
                  <input
                    name="phone"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    maxLength={11}
                    value={form.phone}
                    onChange={handleChange}
                    readOnly // <-- کاربر نمی‌تونه ویرایش کنه
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors"
                    style={{ ...inputStyle, ...readOnlyStyle }} // <-- استایل مخصوص readOnly
                    dir="ltr"
                  />
                </Field>
                <Field label="شماره شبا *">
                  <input
                    name="sheba"
                    placeholder="IR______________________"
                    maxLength={26}
                    value={form.sheba}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                    dir="ltr"
                  />
                </Field>
                <Field
                  label={
                    <>
                      کد معرف <span style={{ color: "#B9C1BE" }}>(اختیاری)</span>
                    </>
                  }
                >
                  <input
                    name="referralCode"
                    placeholder="کد معرف را وارد کنید"
                    value={form.referralCode}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                    dir="ltr"
                  />
                </Field>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="mt-4 rounded-xl p-3 text-sm text-center font-medium"
              style={{ background: "#FBEAE8", color: "#A8332C", border: "1px solid #F2C7C2" }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-2xl font-bold text-[15px] text-white disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
              boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
            }}
          >
            {loading ? "در حال ذخیره..." : "ادامه به سبد خرید ←"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
        {label}
      </label>
      {children}
    </div>
  );
}