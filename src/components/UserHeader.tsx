"use client";
import { useRouter, usePathname } from "next/navigation";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "پروفایل", href: "/profile" },
    //{ label: "سبد خرید", href: "/cart" },
  ];

  function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  return (
    <div className="bg-white border-b mb-4">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
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
          <button
            onClick={handleLogout}
            className="text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}