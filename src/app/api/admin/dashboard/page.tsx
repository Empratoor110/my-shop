"use client";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAdminAuth();

  const menuItems = [
    {
      title: "مدیریت سفارش‌ها",
      description: "مشاهده و تغییر وضعیت سفارش‌ها",
      icon: "📋",
      href: "/admin/orders",
      accent: "#1F5C59",
      tint: "#E7F1F0",
    },
    {
      title: "مدیریت محصولات",
      description: "افزودن، ویرایش و حذف محصولات",
      icon: "📦",
      href: "/admin/products",
      accent: "#2F6B45",
      tint: "#E9F5EC",
    },
    {
      title: "گزارشات",
      description: "آمار فروش و عملکرد فروشگاه",
      icon: "📊",
      href: "/admin/reports",
      accent: "#8A6017",
      tint: "#FBF3E4",
    },
    {
      title: "مدیریت عاملین فروش",
      description: "بررسی، تأیید و تنظیم کمیسیون عاملین",
      icon: "🧑‍💼",
      href: "/admin/agents",
      accent: "#6B4E8C",
      tint: "#F0EAF6",
    },
  ];

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="پنل مدیریت" onLogout={logout} />
      <div className="max-w-6xl mx-auto px-6 pt-2 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="rounded-2xl p-6 text-right transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: "#FFFCF6",
                border: "1px solid #EDE7D6",
                boxShadow: "0 4px 14px -8px rgba(18,49,47,0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 16px 32px -14px rgba(18,49,47,0.25)";
                e.currentTarget.style.borderColor = "#E7A94C55";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 14px -8px rgba(18,49,47,0.15)";
                e.currentTarget.style.borderColor = "#EDE7D6";
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                style={{ background: item.tint, color: item.accent }}
              >
                {item.icon}
              </div>
              <h3 className="font-bold mb-1" style={{ color: "#12312F" }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: "#7A8A87" }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
