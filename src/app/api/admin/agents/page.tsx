"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Vazirmatn } from "next/font/google";
import AdminHeader from "@/components/AdminHeader";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

interface Agent {
  id: string;
  phone: string;
  agentCode: string;
  commissionRate: number;
  entityType: string | null;
  firstName?: string | null;
  lastName?: string | null;
  nationalId?: string | null;
  warehouseAddress?: string | null;
  companyName?: string | null;
  companyNationalId?: string | null;
  companyAddress?: string | null;
  ceoName?: string | null;
  ceoNationalId?: string | null;
  ceoPhone?: string | null;
  sheba?: string | null;
  approvalStatus: string;
  adminNote?: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FBF3E4", text: "#8A6017" },
  approved: { bg: "#E9F5EC", text: "#2F6B45" },
  rejected: { bg: "#FBEAE8", text: "#A8332C" },
};

export default function AdminAgentsPage() {
  const { logout } = useAdminAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [commissionInput, setCommissionInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    const res = await fetch("/api/admin/agents");
    const data = await res.json();
    if (data.success) setAgents(data.agents);
  }

  function openAgent(agent: Agent) {
    setSelected(agent);
    setCommissionInput(String(agent.commissionRate));
    setNoteInput(agent.adminNote || "");
  }

  async function updateAgent(approvalStatus?: string) {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/admin/agents/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvalStatus,
        commissionRate: commissionInput,
        adminNote: noteInput,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSelected(data.agent);
      fetchAgents();
    }
  }

  const filteredAgents = agents.filter((a) => filter === "all" || a.approvalStatus === filter);

  return (
    <div className={`${vazir.className} min-h-screen`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <AdminHeader title="مدیریت عاملین فروش" onLogout={logout} />
      <div className="max-w-6xl mx-auto px-6 pt-2 pb-8">
        {/* فیلتر وضعیت */}
        <div className="flex gap-2 mb-4">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                filter === f
                  ? { background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)", color: "#FFFCF6" }
                  : { background: "#FFFCF6", color: "#4B5B58", border: "1px solid #E7E2D3" }
              }
            >
              {f === "all" ? "همه" : statusLabels[f]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لیست */}
          <div className="space-y-3">
            {filteredAgents.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", color: "#B9C1BE" }}>
                <p className="font-medium">موردی یافت نشد</p>
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const s = statusStyles[agent.approvalStatus];
                const displayName = agent.entityType === "legal" ? agent.companyName : `${agent.firstName} ${agent.lastName}`;
                const isSelected = selected?.id === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => openAgent(agent)}
                    className="rounded-2xl p-4 cursor-pointer transition-all"
                    style={{
                      background: "#FFFCF6",
                      border: isSelected ? "2px solid #E7A94C" : "1px solid #EDE7D6",
                      boxShadow: isSelected ? "0 8px 20px -10px rgba(231,169,76,0.5)" : "0 2px 8px -6px rgba(18,49,47,0.1)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold" style={{ color: "#12312F" }}>{displayName}</p>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>
                        {statusLabels[agent.approvalStatus]}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "#7A8A87" }} dir="ltr">{agent.phone}</p>
                    <p className="text-[11px] mt-1" style={{ color: "#B9C1BE" }}>
                      کد معرف: {agent.agentCode} · {agent.entityType === "legal" ? "حقوقی" : "حقیقی"}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* جزئیات */}
          {selected && (
            <div className="rounded-2xl p-6 h-fit" style={{ background: "#FFFCF6", border: "1px solid #EDE7D6" }}>
              <h2 className="text-lg font-extrabold mb-4" style={{ color: "#12312F" }}>جزئیات عامل</h2>

              <div className="rounded-xl p-4 mb-4" style={{ background: "#F6F4EC" }}>
                <div className="grid grid-cols-2 gap-2.5 text-sm">
                  {selected.entityType === "legal" ? (
                    <>
                      <InfoRow label="نام شرکت" value={selected.companyName} />
                      <InfoRow label="شناسه ملی شرکت" value={selected.companyNationalId} />
                      <InfoRow label="آدرس شرکت" value={selected.companyAddress} span2 />
                      <InfoRow label="نام مدیرعامل" value={selected.ceoName} />
                      <InfoRow label="کد ملی مدیرعامل" value={selected.ceoNationalId} />
                      <InfoRow label="تماس مدیرعامل" value={selected.ceoPhone} />
                    </>
                  ) : (
                    <>
                      <InfoRow label="نام" value={selected.firstName} />
                      <InfoRow label="نام خانوادگی" value={selected.lastName} />
                      <InfoRow label="کد ملی" value={selected.nationalId} />
                      <InfoRow label="آدرس محل انبار" value={selected.warehouseAddress} span2 />
                    </>
                  )}
                  <InfoRow label="شماره تماس ورود" value={selected.phone} />
                  <InfoRow label="شماره شبا" value={selected.sheba} span2 />
                  <InfoRow label="کد معرف" value={selected.agentCode} />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  درصد کمیسیون
                </label>
                <input
                  type="number"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none focus:!border-[#E7A94C]"
                  style={{ background: "#FBF9F2", borderColor: "#E7E2D3", color: "#12312F" }}
                  dir="ltr"
                />
              </div>

              <div className="mb-4">
                <label className="text-[12px] font-semibold mb-1 block mr-1" style={{ color: "#7A8A87" }}>
                  توضیح (در صورت رد کردن نمایش داده می‌شود)
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 border-2 outline-none focus:!border-[#E7A94C] resize-none"
                  style={{ background: "#FBF9F2", borderColor: "#E7E2D3", color: "#12312F" }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateAgent("approved")}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2F6B45 0%, #1F5C40 100%)" }}
                >
                  تأیید عامل
                </button>
                <button
                  onClick={() => updateAgent("rejected")}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #C1443C 0%, #A8332C 100%)" }}
                >
                  رد درخواست
                </button>
                <button
                  onClick={() => updateAgent()}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                  style={{ border: "1.5px solid #E7E2D3", color: "#4B5B58", background: "#FFFCF6" }}
                >
                  فقط ذخیره‌ی کمیسیون
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, span2 }: { label: string; value?: string | null; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <span className="block text-[11px]" style={{ color: "#8A9A97" }}>{label}</span>
      <span className="font-medium" style={{ color: "#12312F" }}>{value || "—"}</span>
    </div>
  );
}
