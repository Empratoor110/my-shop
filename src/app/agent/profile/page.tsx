"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

type EntityType = "individual" | "legal";

export default function AgentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("individual");

  const [individualForm, setIndividualForm] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    warehouseAddress: "",
  });

  const [legalForm, setLegalForm] = useState({
    companyName: "",
    companyNationalId: "",
    companyAddress: "",
    ceoName: "",
    ceoNationalId: "",
    ceoPhone: "",
  });

  const [sheba, setSheba] = useState("");

  useEffect(() => {
    const agentId = localStorage.getItem("agentId");
    if (!agentId) {
      router.push("/agent/login");
      return;
    }
    checkExisting(agentId);
  }, []);

  async function checkExisting(agentId: string) {
    try {
      const res = await fetch(`/api/agent/profile?agentId=${agentId}`);
      const data = await res.json();
      if (data.success && data.agent.profileCompleted) {
        router.push("/agent/status");
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setChecking(false);
  }

  function handleIndividualChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIndividualForm({ ...individualForm, [e.target.name]: e.target.value });
  }

  function handleLegalChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLegalForm({ ...legalForm, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setError("");

    if (!sheba || sheba.length !== 24) {
      setError("شماره شبا باید ۲۴ کاراکتر باشد");
      return;
    }

    if (entityType === "individual") {
      const { firstName, lastName, nationalId, warehouseAddress } = individualForm;
      if (!firstName || !lastName || !nationalId || !warehouseAddress) {
        setError("لطفاً همه فیلدهای اجباری را پر کنید");
        return;
      }
    } else {
      const { companyName, companyNationalId, companyAddress, ceoName, ceoNationalId, ceoPhone } = legalForm;
      if (!companyName || !companyNationalId || !companyAddress || !ceoName || !ceoNationalId || !ceoPhone) {
        setError("لطفاً همه فیلدهای اجباری را پر کنید");
        return;
      }
    }

    setLoading(true);
    const agentId = localStorage.getItem("agentId");
    const payload =
      entityType === "individual"
        ? { agentId, entityType, sheba, ...individualForm }
        : { agentId, entityType, sheba, ...legalForm };

    const res = await fetch("/api/agent/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push("/agent/status");
    } else {
      setError(data.error);
    }
  }

  const inputStyle = { background: "#FBF9F2", borderColor: "#E7E2D3", color: "#12312F" };

  if (checking) {
    return (
      <div className={`${vazir.className} min-h-screen flex items-center justify-center`} style={{ background: "#F6F4EC" }}>
        <p style={{ color: "#B9C1BE" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className={`${vazir.className} min-h-screen py-8`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <div className="flex items-center justify-center px-4 mt-4">
        <div
          className="p-8 rounded-[28px] w-full max-w-sm"
          style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 20px 50px -24px rgba(18,49,47,0.35)" }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)" }}
              >
                🧑‍💼
              </div>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "#12312F" }}>
              تکمیل اطلاعات عامل فروش
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7A8A87" }}>
              بعد از تکمیل، اطلاعات شما برای بررسی ارسال می‌شود
            </p>
          </div>

          {/* انتخاب نوع شخصیت */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setEntityType("individual")}
              className="py-3 rounded-xl font-semibold text-sm transition-all"
              style={
                entityType === "individual"
                  ? { background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)", color: "#FFFCF6" }
                  : { background: "#FBF9F2", color: "#4B5B58", border: "1.5px solid #E7E2D3" }
              }
            >
              شخص حقیقی
            </button>
            <button
              type="button"
              onClick={() => setEntityType("legal")}
              className="py-3 rounded-xl font-semibold text-sm transition-all"
              style={
                entityType === "legal"
                  ? { background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)", color: "#FFFCF6" }
                  : { background: "#FBF9F2", color: "#4B5B58", border: "1.5px solid #E7E2D3" }
              }
            >
              شخصیت حقوقی
            </button>
          </div>

          <div className="space-y-3">
            {entityType === "individual" ? (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="نام *">
                    <input name="firstName" value={individualForm.firstName} onChange={handleIndividualChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                  </Field>
                  <Field label="نام خانوادگی *">
                    <input name="lastName" value={individualForm.lastName} onChange={handleIndividualChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                  </Field>
                </div>
                <Field label="کد ملی *">
                  <input name="nationalId" value={individualForm.nationalId} onChange={handleIndividualChange} maxLength={10} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} dir="ltr" />
                </Field>
                <Field label="آدرس محل انبار *">
                  <input name="warehouseAddress" value={individualForm.warehouseAddress} onChange={handleIndividualChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                </Field>
              </>
            ) : (
              <>
                <Field label="نام شرکت *">
                  <input name="companyName" value={legalForm.companyName} onChange={handleLegalChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                </Field>
                <Field label="شناسه ملی شرکت *">
                  <input name="companyNationalId" value={legalForm.companyNationalId} onChange={handleLegalChange} maxLength={11} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} dir="ltr" />
                </Field>
                <Field label="آدرس شرکت *">
                  <input name="companyAddress" value={legalForm.companyAddress} onChange={handleLegalChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                </Field>
                <Field label="نام مدیرعامل *">
                  <input name="ceoName" value={legalForm.ceoName} onChange={handleLegalChange} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="کد ملی مدیرعامل *">
                    <input name="ceoNationalId" value={legalForm.ceoNationalId} onChange={handleLegalChange} maxLength={10} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} dir="ltr" />
                  </Field>
                  <Field label="تماس مدیرعامل *">
                    <input name="ceoPhone" value={legalForm.ceoPhone} onChange={handleLegalChange} maxLength={11} className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]" style={inputStyle} dir="ltr" />
                  </Field>
                </div>
              </>
            )}

            <Field label="شماره شبا (برای واریز کمیسیون) *">
              <input
                placeholder="IR______________________"
                maxLength={26}
                value={sheba}
                onChange={(e) => setSheba(e.target.value)}
                className="w-full rounded-xl px-4 py-3 border-2 outline-none transition-colors focus:!border-[#E7A94C]"
                style={inputStyle}
                dir="ltr"
              />
            </Field>
          </div>

          {error && (
            <div className="mt-4 rounded-xl p-3 text-sm text-center font-medium" style={{ background: "#FBEAE8", color: "#A8332C", border: "1px solid #F2C7C2" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-2xl font-bold text-[15px] text-white disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)", boxShadow: "0 10px 24px -8px rgba(193,68,60,0.65)" }}
          >
            {loading ? "در حال ذخیره..." : "ثبت اطلاعات ←"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
