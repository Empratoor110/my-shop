"use client";
import { useRouter, usePathname } from "next/navigation";

interface AdminHeaderProps {
  title: string;
  onLogout: () => void;
}

export default function AdminHeader({ title, onLogout }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "داشبورد", href: "/admin/dashboard" },
    { label: "سفارش‌ها", href: "/admin/orders" },
    { label: "محصولات", href: "/admin/products" },
    { label: "گزارشات", href: "/admin/reports" },
  ];

  return (
    <div className="bg-white border-b mb-6">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">{title}</h1>
          <button
            onClick={onLogout}
            className="text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 text-sm"
          >
            خروج
          </button>
        </div>
        <div className="flex gap-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}