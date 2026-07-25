"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

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
}

const statusLabels: { [key: string]: string } = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

// رنگ‌های وضعیت هماهنگ با پالت برند (به‌جای رنگ‌های پیش‌فرض آبی/بنفش/زرد Tailwind)
const statusStyles: { [key: string]: { bg: string; text: string } } = {
  pending: { bg: "#FBF3E4", text: "#8A6017" },
  confirmed: { bg: "#E7F1F0", text: "#1F5C59" },
  shipped: { bg: "#F0EAF6", text: "#6B4E8C" },
  delivered: { bg: "#E9F5EC", text: "#2F6B45" },
  cancelled: { bg: "#FBEAE8", text: "#A8332C" },
};

export default function AdminOrdersPage() {
  const { logout } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (data.success) setOrders(data.orders);
  }

  async function updateStatus(orderId: string, status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
  }

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="مدیریت سفارش‌ها" onLogout={logout} />
      <div className="max-w-6xl mx-auto px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لیست سفارش‌ها */}
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", color: "#B9C1BE" }}
              >
                <div className="text-4xl mb-2">📋</div>
                <p className="font-medium">هنوز سفارشی ثبت نشده</p>
              </div>
            ) : (
              orders.map((order) => {
                const s = statusStyles[order.status];
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-2xl p-4 cursor-pointer transition-all duration-150"
                    style={{
                      background: "#FFFCF6",
                      border: isSelected ? "2px solid #E7A94C" : "1px solid #EDE7D6",
                      boxShadow: isSelected
                        ? "0 8px 20px -10px rgba(231,169,76,0.5)"
                        : "0 2px 8px -6px rgba(18,49,47,0.1)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold" style={{ color: "#12312F" }}>
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p className="text-sm" style={{ color: "#7A8A87" }}>
                          {order.user.phone}
                        </p>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm" style={{ color: "#B9C1BE" }}>
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                      <p className="font-bold" style={{ color: "#C1443C" }}>
                        {order.total.toLocaleString()} تومان
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* جزئیات سفارش */}
          {selectedOrder && (
            <div
              className="rounded-2xl p-6 h-fit"
              style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 8px 24px -14px rgba(18,49,47,0.2)" }}
            >
              <h2 className="text-lg font-extrabold mb-4" style={{ color: "#12312F" }}>
                جزئیات سفارش
              </h2>

              <div className="rounded-xl p-4 mb-4" style={{ background: "#F6F4EC" }}>
                <h3 className="font-bold text-sm mb-3" style={{ color: "#4B5B58" }}>
                  اطلاعات خریدار
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-sm" style={{ color: "#12312F" }}>
                  <div>
                    <span style={{ color: "#8A9A97" }}>نام: </span>
                    <span className="font-medium">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</span>
                  </div>
                  <div>
                    <span style={{ color: "#8A9A97" }}>نام پدر: </span>
                    <span className="font-medium">{selectedOrder.user.fatherName}</span>
                  </div>
                  <div>
                    <span style={{ color: "#8A9A97" }}>شماره تماس: </span>
                    <span className="font-medium">{selectedOrder.user.contactPhone}</span>
                  </div>
                  <div>
                    <span style={{ color: "#8A9A97" }}>محل کشت: </span>
                    <span className="font-medium">{selectedOrder.user.farmLocation}</span>
                  </div>
                  <div>
                    <span style={{ color: "#8A9A97" }}>مقدار بذر: </span>
                    <span className="font-medium">{selectedOrder.user.seedAmount} کیلوگرم</span>
                  </div>
                  <div>
                    <span style={{ color: "#8A9A97" }}>کد معرف: </span>
                    <span className="font-medium">{selectedOrder.user.referralCode || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span style={{ color: "#8A9A97" }}>شماره شبا: </span>
                    <span className="font-medium" dir="ltr">{selectedOrder.user.sheba}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-sm mb-3" style={{ color: "#4B5B58" }}>
                  اقلام سفارش
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm pb-2"
                      style={{ borderBottom: "1px solid #EDE7D6", color: "#12312F" }}
                    >
                      <span>{item.product.name} × {item.quantity}</span>
                      <span className="font-semibold" style={{ color: "#C1443C" }}>
                        {(item.price * item.quantity).toLocaleString()} تومان
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-extrabold pt-1" style={{ color: "#12312F" }}>
                    <span>مجموع</span>
                    <span>{selectedOrder.total.toLocaleString()} تومان</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-3" style={{ color: "#4B5B58" }}>
                  تغییر وضعیت
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusLabels).map(([key, label]) => {
                    const s = statusStyles[key];
                    const active = selectedOrder.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedOrder.id, key)}
                        disabled={loading || active}
                        className="py-2 px-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                        style={
                          active
                            ? { background: s.bg, color: s.text }
                            : { border: "1.5px solid #E7E2D3", color: "#4B5B58", background: "#FFFCF6" }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
