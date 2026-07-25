"use client";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

const contacts = [
  {
    title: "کارشناس فروش",
    name: "واحد فروش سینابذر همدان",
    phone: "۰۸۱۳۲۵۰۰۰۰۰",
    hours: "شنبه تا چهارشنبه، ۸ الی ۱۶",
    icon: "🌾",
  },
  {
    title: "کارشناس فنی کشاورزی",
    name: "مشاوره‌ی انتخاب رقم و کاشت",
    phone: "۰۹۱۸۰۰۰۰۰۰۰",
    hours: "همه‌روزه، ۸ الی ۲۰",
    icon: "🧑‍🌾",
  },
  {
    title: "پشتیبانی سفارش‌ها",
    name: "پیگیری وضعیت ارسال و پرداخت",
    phone: "۰۹۱۸۱۱۱۱۱۱۱",
    hours: "شنبه تا چهارشنبه، ۹ الی ۱۷",
    icon: "📦",
  },
];

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className={`${vazir.className} min-h-screen py-10 px-4`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm font-semibold flex items-center gap-1"
          style={{ color: "#4B6E6B" }}
        >
          ← بازگشت به صفحه اصلی
        </button>

        <div className="text-center mb-10">
          <div className="text-4xl mb-3">📞</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: "#12312F" }}>
            تماس با کارشناسان
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#7A8A87" }}>
            پیش از خرید، با کارشناسان ما مشورت کنید تا رقم مناسب زمین‌تان را انتخاب کنید
          </p>
        </div>

        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 8px 24px -16px rgba(18,49,47,0.2)" }}
            >
              <div
                className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#FBF3E4", color: "#8A6017" }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold" style={{ color: "#12312F" }}>
                  {c.title}
                </h3>
                <p className="text-sm mb-1" style={{ color: "#7A8A87" }}>
                  {c.name}
                </p>
                <p className="text-[12px]" style={{ color: "#B9C1BE" }}>
                  {c.hours}
                </p>
              </div>
              <a
                href={`tel:${c.phone.replace(/[^\d]/g, "")}`}
                className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  boxShadow: "0 8px 20px -8px rgba(193,68,60,0.5)",
                }}
                dir="ltr"
              >
                {c.phone}
              </a>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-2xl p-5 text-center"
          style={{ background: "#E7F1F0", border: "1px solid #CFE3E1" }}
        >
          <p className="text-sm font-medium" style={{ color: "#1F5C59" }}>
            آدرس دفتر مرکزی: همدان، شهرک صنعتی، خیابان بذر، پلاک ۱۲
          </p>
        </div>
      </div>
    </div>
  );
}
