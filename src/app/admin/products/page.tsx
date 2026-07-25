"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

export default function AdminProductsPage() {
  const { logout } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openAdd() {
    setEditProduct(null);
    setForm({ name: "", price: "", category: "", description: "", stock: "" });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      description: p.description || "",
      stock: p.stock.toString(),
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.price || !form.category) {
      setError("نام، قیمت و دسته‌بندی اجباری هستند");
      return;
    }
    setLoading(true);
    const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
    const method = editProduct ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setShowForm(false);
      fetchProducts();
    } else {
      setError(data.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا مطمئن هستید؟")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchProducts();
  }

  const inputStyle = { background: "#FBF9F2", borderColor: "#E7E2D3", color: "#12312F" };

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="مدیریت محصولات" onLogout={logout} />
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
              boxShadow: "0 8px 20px -8px rgba(193,68,60,0.5)",
            }}
          >
            + افزودن محصول
          </button>
        </div>

        {showForm && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 12px 30px -18px rgba(18,49,47,0.25)" }}
          >
            <h2 className="text-lg font-extrabold mb-4" style={{ color: "#12312F" }}>
              {editProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  نام محصول *
                </label>
                <input
                  name="name"
                  placeholder="نام محصول"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                    قیمت (تومان) *
                  </label>
                  <input
                    name="price"
                    placeholder="قیمت"
                    value={form.price}
                    onChange={handleChange}
                    type="number"
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                    موجودی *
                  </label>
                  <input
                    name="stock"
                    placeholder="تعداد"
                    value={form.stock}
                    onChange={handleChange}
                    type="number"
                    className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                    style={inputStyle}
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  دسته‌بندی *
                </label>
                <input
                  name="category"
                  placeholder="مثلاً: بذر، کود، سم"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  توضیحات
                </label>
                <textarea
                  name="description"
                  placeholder="توضیحات محصول"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C] resize-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <div
                className="mt-3 rounded-xl p-3 text-sm text-center font-medium"
                style={{ background: "#FBEAE8", color: "#A8332C", border: "1px solid #F2C7C2" }}
              >
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-transform active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  boxShadow: "0 8px 20px -8px rgba(193,68,60,0.5)",
                }}
              >
                {loading ? "در حال ذخیره..." : editProduct ? "ذخیره تغییرات" : "افزودن محصول"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl font-semibold transition-colors"
                style={{ border: "1.5px solid #E7E2D3", color: "#4B5B58", background: "#FFFCF6" }}
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 8px 24px -16px rgba(18,49,47,0.2)" }}
        >
          {products.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#B9C1BE" }}>
              <div className="text-4xl mb-2">📦</div>
              <p className="font-medium">هنوز محصولی اضافه نشده</p>
            </div>
          ) : (
            <table className="w-full">
              <thead style={{ background: "#F6F4EC", borderBottom: "1px solid #EDE7D6" }}>
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: "#7A8A87" }}>نام محصول</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: "#7A8A87" }}>دسته‌بندی</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: "#7A8A87" }}>قیمت</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: "#7A8A87" }}>موجودی</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold" style={{ color: "#7A8A87" }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid #EDE7D6" }}
                    className="transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF9F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3 font-semibold" style={{ color: "#12312F" }}>{p.name}</td>
                    <td className="px-4 py-3" style={{ color: "#7A8A87" }}>{p.category}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "#C1443C" }}>{p.price.toLocaleString()} تومان</td>
                    <td className="px-4 py-3" style={{ color: "#12312F" }}>{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-sm font-semibold hover:underline"
                          style={{ color: "#1F5C59" }}
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-sm font-semibold hover:underline"
                          style={{ color: "#C1443C" }}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
