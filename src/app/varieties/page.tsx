"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

type TabKey = "specs" | "weeds" | "diseases" | "pests";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "specs", label: "مشخصات ارقام", icon: "🌱" },
  { key: "weeds", label: "علف‌های هرز", icon: "🍃" },
  { key: "diseases", label: "بیماری‌ها", icon: "🦠" },
  { key: "pests", label: "آفات", icon: "🐛" },
];

const tabStyles: Record<TabKey, { tint: string; accent: string }> = {
  specs: { tint: "#FBF3E4", accent: "#8A6017" },
  weeds: { tint: "#E9F5EC", accent: "#2F6B45" },
  diseases: { tint: "#FBEAE8", accent: "#A8332C" },
  pests: { tint: "#FBF3E4", accent: "#8A6017" },
};

// همون فیلدهای تفصیلی زراعی که در پنل مدیریت وارد می‌شن — هرکدوم با آیکون و رنگ مخصوص خودش
const extraSpecFields: { key: string; label: string; icon: string; tint: string; accent: string }[] = [
  { key: "growthType", label: "تیپ رشد", icon: "🌾", tint: "#FBF3E4", accent: "#8A6017" },
  { key: "daysToSpike", label: "روز تا ظهور سنبله", icon: "⏳", tint: "#E7F1F0", accent: "#1F5C59" },
  { key: "daysToMaturity", label: "روز تا رسیدگی فیزیولوژیک", icon: "📅", tint: "#F0EAF6", accent: "#6B4E8C" },
  { key: "plantHeight", label: "ارتفاع بوته (سانتی‌متر)", icon: "📏", tint: "#E9F5EC", accent: "#2F6B45" },
  { key: "grainColor", label: "رنگ دانه", icon: "🎨", tint: "#FBEAE8", accent: "#A8332C" },
  { key: "thousandGrainWeight", label: "وزن هزار دانه (گرم)", icon: "⚖️", tint: "#FBF3E4", accent: "#8A6017" },
  { key: "lodging", label: "خوابیدگی", icon: "🌬️", tint: "#E7F1F0", accent: "#1F5C59" },
  { key: "grainShattering", label: "ریزش دانه", icon: "🌰", tint: "#F0EAF6", accent: "#6B4E8C" },
  { key: "grainProtein", label: "پروتئین دانه (%)", icon: "🧬", tint: "#E9F5EC", accent: "#2F6B45" },
  { key: "grainHardness", label: "سختی دانه", icon: "💎", tint: "#FBEAE8", accent: "#A8332C" },
  { key: "yellowRust", label: "زنگ زرد", icon: "🦠", tint: "#FBF3E4", accent: "#8A6017" },
];

interface VarietyItem {
  id: string;
  category: TabKey;
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

interface GroupedData {
  specs: VarietyItem[];
  weeds: VarietyItem[];
  diseases: VarietyItem[];
  pests: VarietyItem[];
}

interface GalleryImage {
  url: string;
  title: string;
}

function getImages(item: VarietyItem): GalleryImage[] {
  const raw = [
    { url: item.image1, title: item.image1Title },
    { url: item.image2, title: item.image2Title },
    { url: item.image3, title: item.image3Title },
    { url: item.image4, title: item.image4Title },
  ];
  return raw
    .filter((i) => i.url)
    .map((i) => ({ url: i.url as string, title: i.title || "" }));
}

function VarietiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("specs");
  const [data, setData] = useState<GroupedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<{ images: GalleryImage[]; index: number; itemName: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs: TabKey[] = ["specs", "weeds", "diseases", "pests"];
    if (tabParam && validTabs.includes(tabParam as TabKey)) {
      setActiveTab(tabParam as TabKey);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!gallery) return;
      if (e.key === "Escape") setGallery(null);
      if (e.key === "ArrowLeft") stepGallery(1);
      if (e.key === "ArrowRight") stepGallery(-1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gallery]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/varieties");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (e) {
      console.error("خطا در دریافت اطلاعات ارقام:", e);
    }
    setLoading(false);
  }

  function openGallery(item: VarietyItem, startIndex: number) {
    const images = getImages(item);
    if (images.length === 0) return;
    setGallery({ images, index: startIndex, itemName: item.name });
  }

  function stepGallery(delta: number) {
    setGallery((prev) => {
      if (!prev) return prev;
      const len = prev.images.length;
      const next = (prev.index + delta + len) % len;
      return { ...prev, index: next };
    });
  }

  const currentItems = data ? data[activeTab] : [];

  return (
    <div className={`${vazir.className} min-h-screen py-10 px-4`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "#4B6E6B" }}
          >
            ← بازگشت به صفحه اصلی
          </button>
          <a
            href="/content-admin/login"
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "#4B6E6B" }}
          >
            ورود به بخش مدیریت →
          </a>
        </div>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: "#12312F" }}>
            معرفی ارقام بذری
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#7A8A87" }}>
            انتخاب رقم مناسب و آشنایی با تهدیدهای شایع، مهم‌ترین عامل موفقیت محصول است
          </p>
        </div>

        {/* تب‌ها */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setExpandedId(null);
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
                <span>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-16 font-medium" style={{ color: "#B9C1BE" }}>
            در حال بارگذاری...
          </div>
        ) : currentItems.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", color: "#B9C1BE" }}
          >
            <p className="font-medium">هنوز محتوایی برای این بخش ثبت نشده</p>
          </div>
        ) : activeTab === "specs" ? (
          <div className="space-y-2.5">
            {currentItems.map((v) => {
              const images = getImages(v);
              const isOpen = expandedId === v.id;
              const filledExtras = extraSpecFields.filter((f) => (v as any)[f.key]);

              return (
                <div
                  key={v.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 4px 14px -8px rgba(18,49,47,0.15)" }}
                >
                  {/* ردیف فشرده — همیشه دیده می‌شه */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : v.id)}
                    className="w-full flex items-center gap-3 p-4 text-right"
                  >
                    <div
                      className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg overflow-hidden"
                      style={{ background: "#FBF3E4", color: "#8A6017" }}
                    >
                      {images.length > 0 ? (
                        <img src={images[0].url} alt={v.name} className="w-full h-full object-cover" />
                      ) : (
                        "🌱"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold truncate" style={{ color: "#12312F" }}>
                        {v.name}
                      </h2>
                    </div>
                    <span
                      className="text-lg shrink-0 transition-transform duration-200"
                      style={{ color: "#B9C1BE", transform: isOpen ? "rotate(180deg)" : "none" }}
                    >
                      ⌄
                    </span>
                  </button>

                  {/* جزئیات — فقط وقتی باز بشه نمایش داده می‌شه */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid #EDE7D6" }}>
                      {images.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2.5 mt-4 mb-5">
                          {images.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => openGallery(v, i)}
                              className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.03]"
                              style={{ width: 120, height: 120, border: "1px solid #EDE7D6" }}
                            >
                              <img src={img.url} alt={img.title || v.name} className="w-full h-full object-cover" />
                              {img.title && (
                                <span
                                  className="absolute bottom-0 inset-x-0 text-[10px] text-center py-1 px-1 font-medium truncate"
                                  style={{ background: "rgba(11,42,41,0.75)", color: "#FFFCF6" }}
                                >
                                  {img.title}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {filledExtras.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                          {filledExtras.map((f) => (
                            <div
                              key={f.key}
                              className="rounded-xl px-3.5 py-3 flex items-center justify-between gap-3"
                              style={{ background: "#FFFCF6", border: "1px solid #EDE7D6" }}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm"
                                  style={{ background: f.tint, color: f.accent }}
                                >
                                  {f.icon}
                                </div>
                                <span className="text-[13px] font-extrabold truncate" style={{ color: "#16523E" }}>
                                  {f.label}
                                </span>
                              </div>
                              <span className="text-[13px] font-semibold shrink-0" style={{ color: "#12312F" }}>
                                {(v as any)[f.key]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rounded-xl p-4" style={{ background: "#F6F4EC" }}>
                        <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "#7A8A87" }}>
                          توضیحات
                        </span>
                        <p className="text-sm leading-relaxed" style={{ color: "#4B5B58" }}>
                          {v.detail}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((item) => {
              const s = tabStyles[activeTab];
              const icon = tabs.find((t) => t.key === activeTab)?.icon;
              const images = getImages(item);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-5"
                  style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 8px 24px -16px rgba(18,49,47,0.2)" }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl overflow-hidden cursor-pointer"
                      style={{ background: s.tint, color: s.accent }}
                      onClick={() => images.length > 0 && openGallery(item, 0)}
                    >
                      {images.length > 0 ? (
                        <img src={images[0].url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        icon
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold mb-1" style={{ color: "#12312F" }}>
                        {item.name}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#7A8A87" }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3">
                      <ImageStrip images={images} onOpen={(i) => openGallery(item, i)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 rounded-2xl font-bold text-[15px] text-white transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)",
              boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)",
            }}
          >
            ثبت سفارش بذر ←
          </button>
        </div>
      </div>

      {/* گالری تمام‌صفحه (Lightbox) */}
      {gallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(8,20,17,0.92)" }}
          onClick={() => setGallery(null)}
        >
          <button
            onClick={() => setGallery(null)}
            className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: "rgba(255,255,255,0.1)", color: "#F4F1E6" }}
          >
            ✕
          </button>

          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={gallery.images[gallery.index].url}
                alt={gallery.images[gallery.index].title || gallery.itemName}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              />

              {gallery.images.length > 1 && (
                <>
                  <button
                    onClick={() => stepGallery(1)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "rgba(0,0,0,0.4)", color: "#F4F1E6" }}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => stepGallery(-1)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "rgba(0,0,0,0.4)", color: "#F4F1E6" }}
                  >
                    ‹
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="font-bold" style={{ color: "#F4F1E6" }}>
                {gallery.images[gallery.index].title || gallery.itemName}
              </p>
              {gallery.images.length > 1 && (
                <p className="text-sm mt-1" style={{ color: "#8FADAA" }}>
                  {gallery.index + 1} از {gallery.images.length}
                </p>
              )}
            </div>

            {gallery.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {gallery.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setGallery((prev) => (prev ? { ...prev, index: i } : prev))}
                    className="w-14 h-14 rounded-xl overflow-hidden transition-all"
                    style={{
                      border: i === gallery.index ? "2px solid #E7A94C" : "2px solid transparent",
                      opacity: i === gallery.index ? 1 : 0.5,
                    }}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageStrip({ images, onOpen }: { images: GalleryImage[]; onOpen: (index: number) => void }) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {images.map((img, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.03]"
          style={{ width: 72, height: 72, border: "1px solid #EDE7D6" }}
        >
          <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
          {img.title && (
            <span
              className="absolute bottom-0 inset-x-0 text-[9px] text-center py-0.5 truncate px-1"
              style={{ background: "rgba(11,42,41,0.75)", color: "#FFFCF6" }}
            >
              {img.title}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function VarietiesPage() {
  return (
    <Suspense fallback={null}>
      <VarietiesPageContent />
    </Suspense>
  );
}
