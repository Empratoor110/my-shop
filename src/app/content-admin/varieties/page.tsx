"use client";
import { useState, useEffect } from "react";
import { useContentAdminAuth } from "@/hooks/useContentAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

type Category = "specs" | "weeds" | "diseases" | "pests";

const categories: { key: Category; label: string; icon: string }[] = [
  { key: "specs", label: "مشخصات ارقام", icon: "🌱" },
  { key: "weeds", label: "علف‌های هرز", icon: "🍃" },
  { key: "diseases", label: "بیماری‌ها", icon: "🦠" },
  { key: "pests", label: "آفات", icon: "🐛" },
];

interface ImageSlot {
  url: string;
  title: string;
}

// فیلدهای تفصیلی زراعی که فقط برای دسته‌ی «مشخصات ارقام» نمایش داده می‌شن
const extraSpecFields: { key: string; label: string; placeholder?: string }[] = [
  { key: "growthType", label: "تیپ رشد", placeholder: "مثلاً: وابسته" },
  { key: "daysToSpike", label: "روز تا ظهور سنبله" },
  { key: "daysToMaturity", label: "روز تا رسیدگی فیزیولوژیک" },
  { key: "plantHeight", label: "ارتفاع بوته (سانتی‌متر)" },
  { key: "grainColor", label: "رنگ دانه", placeholder: "مثلاً: زرد روشن" },
  { key: "thousandGrainWeight", label: "وزن هزار دانه (گرم)" },
  { key: "lodging", label: "خوابیدگی", placeholder: "مثلاً: مقاوم" },
  { key: "grainShattering", label: "ریزش دانه", placeholder: "مثلاً: مقاوم" },
  { key: "grainProtein", label: "پروتئین دانه (%)" },
  { key: "grainHardness", label: "سختی دانه" },
  { key: "yellowRust", label: "زنگ زرد", placeholder: "مثلاً: نیمه مقاوم" },
];

interface VarietyItem {
  id: string;
  category: Category;
  name: string;
  detail: string;
  image1?: string | null;
  image1Title?: string | null;
  image2?: string | null;
  image2Title?: string | null;
  image3?: string | null;
  image3Title?: string | null;
  image4?: string | null;
  image4Title?: string | null;
  yieldInfo?: string | null;
  region?: string | null;
  resistance?: string | null;
  growthType?: string | null;
  daysToSpike?: string | null;
  daysToMaturity?: string | null;
  plantHeight?: string | null;
  grainColor?: string | null;
  thousandGrainWeight?: string | null;
  lodging?: string | null;
  grainShattering?: string | null;
  grainProtein?: string | null;
  grainHardness?: string | null;
  yellowRust?: string | null;
}

const emptySlots = (): ImageSlot[] => [
  { url: "", title: "" },
  { url: "", title: "" },
  { url: "", title: "" },
  { url: "", title: "" },
];

function itemToSlots(item: VarietyItem): ImageSlot[] {
  return [
    { url: item.image1 || "", title: item.image1Title || "" },
    { url: item.image2 || "", title: item.image2Title || "" },
    { url: item.image3 || "", title: item.image3Title || "" },
    { url: item.image4 || "", title: item.image4Title || "" },
  ];
}

export default function ContentAdminVarietiesPage() {
  const { logout } = useContentAdminAuth();
  const [items, setItems] = useState<VarietyItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("specs");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<VarietyItem | null>(null);
  const [error, setError] = useState("");
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const emptyForm = {
    name: "",
    detail: "",
    yieldInfo: "",
    region: "",
    resistance: "",
    growthType: "",
    daysToSpike: "",
    daysToMaturity: "",
    plantHeight: "",
    grainColor: "",
    thousandGrainWeight: "",
    lodging: "",
    grainShattering: "",
    grainProtein: "",
    grainHardness: "",
    yellowRust: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [slots, setSlots] = useState<ImageSlot[]>(emptySlots());

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/content-admin/varieties");
    const data = await res.json();
    if (data.success) setItems(data.items);
  }

  function openAdd() {
    setEditItem(null);
    setForm(emptyForm);
    setSlots(emptySlots());
    setShowForm(true);
    setError("");
  }

  function openEdit(item: VarietyItem) {
    setEditItem(item);
    setForm({
      name: item.name,
      detail: item.detail,
      yieldInfo: item.yieldInfo || "",
      region: item.region || "",
      resistance: item.resistance || "",
      growthType: item.growthType || "",
      daysToSpike: item.daysToSpike || "",
      daysToMaturity: item.daysToMaturity || "",
      plantHeight: item.plantHeight || "",
      grainColor: item.grainColor || "",
      thousandGrainWeight: item.thousandGrainWeight || "",
      lodging: item.lodging || "",
      grainShattering: item.grainShattering || "",
      grainProtein: item.grainProtein || "",
      grainHardness: item.grainHardness || "",
      yellowRust: item.yellowRust || "",
    });
    setSlots(itemToSlots(item));
    setShowForm(true);
    setError("");
  }

  function handleSlotImageChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("حجم هر تصویر نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploadingSlot(index);
    const reader = new FileReader();
    reader.onload = () => {
      setSlots((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], url: reader.result as string };
        return next;
      });
      setUploadingSlot(null);
    };
    reader.onerror = () => {
      setError("خطا در خواندن تصویر");
      setUploadingSlot(null);
    };
    reader.readAsDataURL(file);
  }

  function handleSlotTitleChange(index: number, title: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title };
      return next;
    });
  }

  function removeSlotImage(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { url: "", title: "" };
      return next;
    });
  }

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.detail) {
      setError("نام و توضیحات اجباری است");
      return;
    }
    setLoading(true);
    const url = editItem ? `/api/content-admin/varieties/${editItem.id}` : "/api/content-admin/varieties";
    const method = editItem ? "PUT" : "POST";
    const imagesToSend = slots.filter((s) => s.url);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: activeCategory, ...form, images: imagesToSend }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setShowForm(false);
      fetchItems();
    } else {
      setError(data.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا مطمئن هستید؟")) return;
    const res = await fetch(`/api/content-admin/varieties/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchItems();
  }

  const filteredItems = items.filter((i) => i.category === activeCategory);
  const isSpecs = activeCategory === "specs";
  const inputStyle = { background: "#FBF9F2", borderColor: "#E7E2D3", color: "#12312F" };

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="مدیریت محتوای ارقام بذری" onLogout={logout} />
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-8">
        {/* تب دسته‌بندی */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {categories.map((c) => {
            const active = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => {
                  setActiveCategory(c.key);
                  setShowForm(false);
                }}
                className="px-4 py-2.5 rounded-full text-sm whitespace-nowrap font-semibold transition-all duration-200 flex items-center gap-1.5"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                        color: "#FFFCF6",
                        boxShadow: "0 6px 16px -6px rgba(193,68,60,0.55)",
                      }
                    : { background: "#FFFCF6", color: "#4B5B58", border: "1px solid #E7E2D3" }
                }
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-4">
          <a
            href={`/varieties?tab=${activeCategory}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ background: "#FFFCF6", color: "#1F5C59", border: "1.5px solid #CFE3E1" }}
          >
            👁 نمایش در سایت
          </a>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #E7A94C 0%, #C98A2E 100%)",
              color: "#0B2A29",
              boxShadow: "0 8px 20px -8px rgba(231,169,76,0.5)",
            }}
          >
            + افزودن مورد جدید
          </button>
        </div>

        {showForm && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 12px 30px -18px rgba(18,49,47,0.25)" }}
          >
            <h2 className="text-lg font-extrabold mb-4" style={{ color: "#12312F" }}>
              {editItem ? "ویرایش مورد" : "افزودن مورد جدید"} — {categories.find((c) => c.key === activeCategory)?.label}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  نام *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={isSpecs ? "مثلاً: رقم پیشتاز" : "مثلاً: زنگ زرد"}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  توضیحات *
                </label>
                <textarea
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C] resize-none"
                  style={inputStyle}
                />
              </div>

              {/* ۴ اسلات تصویر با عنوان مجزا */}
              <div>
                <label className="text-[12px] font-semibold mb-2 block mr-1" style={{ color: "#7A8A87" }}>
                  تصاویر (حداکثر ۴ عدد، هرکدوم با عنوان دلخواه)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-3"
                      style={{ background: "#FBF9F2", border: "1px solid #E7E2D3" }}
                    >
                      {slot.url ? (
                        <div className="relative mb-2">
                          <img
                            src={slot.url}
                            alt={`تصویر ${index + 1}`}
                            className="w-full h-24 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlotImage(index)}
                            className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "rgba(193,68,60,0.9)" }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          className="flex flex-col items-center justify-center h-24 rounded-lg mb-2 cursor-pointer text-[11px] font-medium"
                          style={{ border: "1.5px dashed #D8CFB8", color: "#B9AF8E" }}
                        >
                          <span className="text-xl mb-1">📷</span>
                          افزودن عکس {index + 1}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSlotImageChange(index, e)}
                          />
                        </label>
                      )}
                      {uploadingSlot === index && (
                        <p className="text-[10px] mb-1" style={{ color: "#8A9A97" }}>
                          در حال پردازش...
                        </p>
                      )}
                      <input
                        type="text"
                        placeholder="عنوان تصویر"
                        value={slot.title}
                        onChange={(e) => handleSlotTitleChange(index, e.target.value)}
                        disabled={!slot.url}
                        className="w-full text-[12px] rounded-lg px-2.5 py-1.5 border outline-none disabled:opacity-40"
                        style={{ background: "#FFFCF6", borderColor: "#E7E2D3", color: "#12312F" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {isSpecs && (
                <div>
                  <p className="text-[12px] font-bold mb-2 mr-1" style={{ color: "#8A6017" }}>
                    مشخصات تفصیلی زراعی
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {extraSpecFields.map((f) => (
                      <div key={f.key}>
                        <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                          {f.label}
                        </label>
                        <input
                          value={(form as any)[f.key]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                disabled={loading || uploadingSlot !== null}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-transform active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
                  boxShadow: "0 8px 20px -8px rgba(193,68,60,0.5)",
                }}
              >
                {loading ? "در حال ذخیره..." : editItem ? "ذخیره تغییرات" : "افزودن"}
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

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", color: "#B9C1BE" }}
            >
              <p className="font-medium">هنوز موردی اضافه نشده</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const thumb = item.image1;
              const imageCount = [item.image1, item.image2, item.image3, item.image4].filter(Boolean).length;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-5"
                  style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 4px 14px -8px rgba(18,49,47,0.15)" }}
                >
                  <div className="flex justify-between items-start gap-3">
                    {thumb && (
                      <div className="relative shrink-0">
                        <img
                          src={thumb}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover"
                          style={{ border: "1px solid #E7E2D3" }}
                        />
                        {imageCount > 1 && (
                          <span
                            className="absolute -bottom-1 -left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: "#8A6017" }}
                          >
                            {imageCount}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: "#12312F" }}>
                        {item.name}
                      </h3>
                      <p className="text-sm" style={{ color: "#7A8A87" }}>
                        {item.detail}
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "#1F5C59" }}
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "#C1443C" }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
