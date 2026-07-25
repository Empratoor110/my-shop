"use client";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function HomePage() {
  const router = useRouter();

  const options = [
    {
      title: "خرید بذر",
      description: "ثبت سفارش بذر گندم با شماره موبایل",
      icon: "🌾",
      href: "/login",
      accent: "#C1443C",
      tint: "#FBEAE8",
    },
    {
      title: "معرفی ارقام بذری",
      description: "آشنایی با انواع ارقام بذر گندم",
      icon: "🌱",
      href: "/varieties",
      accent: "#2F6B45",
      tint: "#E9F5EC",
    },
    {
      title: "تماس با کارشناسان",
      description: "مشاوره رایگان قبل از خرید",
      icon: "📞",
      href: "/contact",
      accent: "#1F5C59",
      tint: "#E7F1F0",
    },
  ];

  return (
    <div
      className={`${vazir.className} min-h-screen relative overflow-hidden`}
      dir="rtl"
      style={{
        background: "radial-gradient(1200px circle at 20% 0%, #123B3A 0%, #0B2A29 45%, #081F1E 100%)",
      }}
    >
      {/* الگوی تزئینی گوشه‌ها */}
      <svg
        aria-hidden
        className="absolute -top-16 -right-16 opacity-[0.08] pointer-events-none"
        width="380"
        height="380"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern id="tile-home" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="#E7A94C" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#tile-home)" />
      </svg>

      <div className="relative max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
        {/* نشان شرکت */}
        <div
          className="px-8 py-4 rounded-2xl mb-6 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)",
            boxShadow: "0 8px 24px -6px rgba(193,68,60,0.55)",
          }}
        >
          <span className="text-[22px] font-extrabold" style={{ color: "#0B2A29" }}>
            شرکت سینابذر همدان
          </span>
        </div>

        <h1 className="text-center text-2xl md:text-3xl font-extrabold mb-3" style={{ color: "#F4F1E6" }}>
          فروش آنلاین بذر گندم
        </h1>
        <p className="text-center text-sm md:text-base mb-12 max-w-md" style={{ color: "#8FADAA" }}>
          خرید مطمئن بذر گندم اصلاح‌شده، مستقیم از تولیدکننده
        </p>

        {/* سه گزینه‌ی اصلی */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {options.map((opt) => (
            <button
              key={opt.href}
              onClick={() => router.push(opt.href)}
              className="rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 group"
              style={{
                background: "#FFFCF6",
                border: "1px solid rgba(231,169,76,0.15)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-105"
                style={{ background: opt.tint, color: opt.accent }}
              >
                {opt.icon}
              </div>
              <h3 className="font-bold mb-1.5" style={{ color: "#12312F" }}>
                {opt.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#7A8A87" }}>
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
