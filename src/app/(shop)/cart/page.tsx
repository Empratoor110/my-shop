"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import UserHeader from "@/components/UserHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [id: string]: CartItem }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("همه");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) {
      setProducts(data.products);
      const cats = ["همه", ...Array.from(new Set(data.products.map((p: Product) => p.category))) as string[]];
      setCategories(cats);
    }
  }

  function addToCart(product: Product) {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev[product.id];
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return { ...prev, [product.id]: { product, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [product.id]: { product, quantity: "" as any } };
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      if (existing.quantity === 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: { ...existing, quantity: existing.quantity - 1 } };
    });
  }

  function handleQuantityInput(product: Product, val: string) {
    if (val === "") {
      setCart((prev) => ({
        ...prev,
        [product.id]: { product, quantity: "" as any },
      }));
      return;
    }
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return;
    if (num > 1000000) return;
    setCart((prev) => ({
      ...prev,
      [product.id]: { product, quantity: num },
    }));
  }

  const filteredProducts = activeCategory === "همه"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * (Number(item.quantity) || 0)), 0);

  async function handleOrder() {
    if (cartItems.length === 0) return;
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push("/success");
    }
  }

  return (
    <div className={`${vazir.className} min-h-screen pb-36`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <UserHeader />
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-extrabold" style={{ color: "#12312F" }}>
            سبد خرید
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A8A87" }}>
            محصولات مورد نظر را انتخاب کنید
          </p>
        </div>

        {/* دسته‌بندی‌ها */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm whitespace-nowrap font-semibold transition-all duration-200"
              style={
                activeCategory === cat
                  ? {
                      background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                      color: "#FFFCF6",
                      boxShadow: "0 6px 16px -6px rgba(193,68,60,0.55)",
                    }
                  : {
                      background: "#FFFCF6",
                      color: "#4B5B58",
                      border: "1px solid #E7E2D3",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* لیست محصولات */}
        <div className="space-y-3 mb-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#B9C1BE" }}>
              <div className="text-4xl mb-2">📦</div>
              <p className="font-medium">محصولی یافت نشد</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl p-4 transition-opacity"
                style={{
                  background: "#FFFCF6",
                  border: "1px solid #EDE7D6",
                  boxShadow: "0 4px 14px -8px rgba(18,49,47,0.15)",
                  opacity: product.stock === 0 ? 0.55 : 1,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold" style={{ color: "#12312F" }}>
                        {product.name}
                      </h3>
                      {product.stock === 0 && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#FBEAE8", color: "#A8332C" }}
                        >
                          ناموجود
                        </span>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#FBF3E4", color: "#8A6017" }}
                        >
                          {product.stock} عدد باقیمانده
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm mt-1" style={{ color: "#7A8A87" }}>
                        {product.description}
                      </p>
                    )}
                    <p className="font-bold mt-1.5" style={{ color: "#C1443C" }}>
                      {product.price.toLocaleString()} تومان
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cart[product.id] ? (
                      <>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                          style={{ border: "1.5px solid #E7E2D3", color: "#4B5B58" }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          value={cart[product.id].quantity === 0 || cart[product.id].quantity === ("" as any) ? "" : cart[product.id].quantity}
                          onChange={(e) => handleQuantityInput(product, e.target.value)}
                          placeholder="۰"
                          className="w-16 text-center rounded-xl py-1.5 font-bold outline-none border-2 transition-colors"
                          style={{ borderColor: "#E7E2D3", background: "#FBF9F2", color: "#12312F" }}
                          dir="ltr"
                        />
                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)" }}
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-transform active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                          boxShadow: "0 6px 14px -6px rgba(193,68,60,0.5)",
                        }}
                      >
                        افزودن
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* نوار پرداخت پایین صفحه */}
      {cartItems.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{
            background: "#FFFCF6",
            borderTop: "1px solid #EDE7D6",
            boxShadow: "0 -12px 30px -12px rgba(18,49,47,0.2)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium" style={{ color: "#7A8A87" }}>
                {cartItems.length} نوع محصول
              </span>
              <span className="font-extrabold text-lg" style={{ color: "#12312F" }}>
                {total.toLocaleString()} تومان
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white disabled:opacity-50 transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
              }}
            >
              {loading ? "در حال ثبت سفارش..." : "ثبت سفارش ←"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
