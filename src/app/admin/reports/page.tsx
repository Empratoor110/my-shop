"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";
import * as XLSX from "xlsx";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

interface StatusHistory {
  id: string;
  status: string;
  changedAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    phone: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    seedAmount: string;
    farmLocation: string;
    contactPhone: string;
    sheba: string;
    referralCode: string;
  };
  items: OrderItem[];
  history: StatusHistory[];
}

const statusLabels: { [key: string]: string } = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

// همون پالت وضعیت‌ها که در صفحه‌ی مدیریت سفارش‌ها استفاده کردیم
const statusStyles: { [key: string]: { bg: string; text: string } } = {
  pending: { bg: "#FBF3E4", text: "#8A6017" },
  confirmed: { bg: "#E7F1F0", text: "#1F5C59" },
  shipped: { bg: "#F0EAF6", text: "#6B4E8C" },
  delivered: { bg: "#E9F5EC", text: "#2F6B45" },
  cancelled: { bg: "#FBEAE8", text: "#A8332C" },
};

export default function AdminReportsPage() {
  const { logout } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    if (data.success) setOrders(data.orders);
    setLoading(false);
  }

  function formatDateTime(dateStr: string) {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("fa-IR"),
      time: date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  function exportToExcel() {
    const rows = orders.map((order) => {
      const created = formatDateTime(order.createdAt);
      const itemsText = order.items
        .map((item) => `${item.product.name} × ${item.quantity}`)
        .join(" | ");
      const historyText = order.history
        .map((h) => {
          const c = formatDateTime(h.changedAt);
          return `${statusLabels[h.status]} (${c.date} ${c.time})`;
        })
        .join(" | ");

      return {
        "نام": order.user.firstName,
        "نام خانوادگی": order.user.lastName,
        "نام پدر": order.user.fatherName,
        "شماره تماس": order.user.contactPhone,
        "محل کشت": order.user.farmLocation,
        "مقدار بذر (کیلوگرم)": order.user.seedAmount,
        "شماره شبا": order.user.sheba,
        "کد معرف": order.user.referralCode || "-",
        "اقلام سفارش": itemsText,
        "مبلغ کل (تومان)": order.total,
        "وضعیت فعلی": statusLabels[order.status],
        "تاریخ ثبت": created.date,
        "ساعت ثبت": created.time,
        "تاریخچه وضعیت‌ها": historyText,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش سفارشات");

    worksheet["!cols"] = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      { wch: 18 }, { wch: 14 }, { wch: 26 }, { wch: 12 },
      { wch: 40 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
      { wch: 10 }, { wch: 50 },
    ];

    const fileName = `گزارش-سفارشات-${new Date().toLocaleDateString("fa-IR").replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="گزارشات سفارش‌ها" onLogout={logout} />
      <div className="max-w-6xl mx-auto px-6 pt-2 pb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium" style={{ color: "#7A8A87" }}>
            {orders.length} سفارش ثبت شده
          </p>
          <button
            onClick={exportToExcel}
            disabled={orders.length === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #E7A94C 0%, #C98A2E 100%)",
              color: "#0B2A29",
              boxShadow: "0 8px 20px -8px rgba(231,169,76,0.55)",
            }}
          >
            📥 خروجی اکسل
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 font-medium" style={{ color: "#B9C1BE" }}>
            در حال بارگذاری...
          </div>
        ) : orders.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", color: "#B9C1BE" }}
          >
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">هنوز سفارشی ثبت نشده</p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 8px 24px -16px rgba(18,49,47,0.2)" }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: "#F6F4EC", borderBottom: "1px solid #EDE7D6" }}>
                <tr>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>نام خریدار</th>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>شماره تماس</th>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>محل کشت</th>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>مبلغ کل</th>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>وضعیت</th>
                  <th className="text-right px-3 py-3 font-semibold" style={{ color: "#7A8A87" }}>تاریخ ثبت</th>
                  <th className="text-right px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const created = formatDateTime(order.createdAt);
                  const isExpanded = expandedId === order.id;
                  const s = statusStyles[order.status];
                  return (
                    <>
                      <tr
                        key={order.id}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: "1px solid #EDE7D6" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF9F2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-3 py-3 font-semibold" style={{ color: "#12312F" }}>
                          {order.user.firstName} {order.user.lastName}
                        </td>
                        <td className="px-3 py-3" style={{ color: "#7A8A87" }} dir="ltr">{order.user.contactPhone}</td>
                        <td className="px-3 py-3" style={{ color: "#12312F" }}>{order.user.farmLocation}</td>
                        <td className="px-3 py-3 font-semibold" style={{ color: "#C1443C" }}>{order.total.toLocaleString()} تومان</td>
                        <td className="px-3 py-3">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: s.bg, color: s.text }}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs" style={{ color: "#B9C1BE" }}>
                          {created.date} - {created.time}
                        </td>
                        <td className="px-3 py-3" style={{ color: "#B9C1BE" }}>
                          {isExpanded ? "▲" : "▼"}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: "#F6F4EC", borderBottom: "1px solid #EDE7D6" }}>
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
                              <div>
                                <span className="block mb-0.5" style={{ color: "#B9C1BE" }}>نام پدر</span>
                                <span style={{ color: "#12312F" }}>{order.user.fatherName}</span>
                              </div>
                              <div>
                                <span className="block mb-0.5" style={{ color: "#B9C1BE" }}>مقدار بذر</span>
                                <span style={{ color: "#12312F" }}>{order.user.seedAmount} کیلوگرم</span>
                              </div>
                              <div>
                                <span className="block mb-0.5" style={{ color: "#B9C1BE" }}>شماره شبا</span>
                                <span style={{ color: "#12312F" }} dir="ltr">{order.user.sheba}</span>
                              </div>
                              <div>
                                <span className="block mb-0.5" style={{ color: "#B9C1BE" }}>کد معرف</span>
                                <span style={{ color: "#12312F" }}>{order.user.referralCode || "—"}</span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <h4 className="text-xs font-bold mb-1.5" style={{ color: "#4B5B58" }}>اقلام سفارش</h4>
                              <div
                                className="rounded-lg p-2 space-y-1"
                                style={{ background: "#FFFCF6", border: "1px solid #EDE7D6" }}
                              >
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-xs">
                                    <span style={{ color: "#12312F" }}>{item.product.name} × {item.quantity}</span>
                                    <span className="font-semibold" style={{ color: "#C1443C" }}>
                                      {(item.price * item.quantity).toLocaleString()} تومان
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold mb-1.5" style={{ color: "#4B5B58" }}>تاریخچه وضعیت</h4>
                              <div className="flex flex-wrap gap-2">
                                {order.history.map((h) => {
                                  const changed = formatDateTime(h.changedAt);
                                  const hs = statusStyles[h.status];
                                  return (
                                    <div
                                      key={h.id}
                                      className="flex items-center gap-2 text-xs rounded-lg px-2 py-1"
                                      style={{ background: "#FFFCF6", border: "1px solid #EDE7D6" }}
                                    >
                                      <span
                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: hs.bg, color: hs.text }}
                                      >
                                        {statusLabels[h.status]}
                                      </span>
                                      <span style={{ color: "#B9C1BE" }}>
                                        {changed.date} {changed.time}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
