"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

interface Agent {
  approvalStatus: string;
  adminNote?: string | null;
  agentCode: string;
  profileCompleted: boolean;
}

export default function AgentStatusPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agentId = localStorage.getItem("agentId");
    if (!agentId) {
      router.push("/agent/login");
      return;
    }
    fetchStatus(agentId);
  }, []);

  async function fetchStatus(agentId: string) {
    try {
      const res = await fetch(`/api/agent/profile?agentId=${agentId}`);
      const data = await res.json();
      if (!data.success) {
        router.push("/agent/login");
        return;
      }
      if (!data.agent.profileCompleted) {
        router.push("/agent/profile");
        return;
      }
      if (data.agent.approvalStatus === "approved") {
        router.push("/agent/dashboard");
        return;
      }
      setAgent(data.agent);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className={`${vazir.className} min-h-screen flex items-center justify-center`} style={{ background: "#F6F4EC" }}>
        <p style={{ color: "#B9C1BE" }}>در حال بارگذاری...</p>
      </div>
    );
  }

  const isRejected = agent?.approvalStatus === "rejected";

  return (
    <div className={`${vazir.className} min-h-screen flex items-center justify-center px-4`} dir="rtl" style={{ background: "#F6F4EC" }}>
      <div
        className="w-full max-w-sm p-8 rounded-[28px] text-center"
        style={{ background: "#FFFCF6", border: "1px solid #EDE7D6", boxShadow: "0 20px 50px -24px rgba(18,49,47,0.35)" }}
      >
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={
              isRejected
                ? { background: "#FBEAE8" }
                : { background: "linear-gradient(135deg, #E7A94C 0%, #C1443C 100%)" }
            }
          >
            {isRejected ? "✕" : "✓"}
          </div>
        </div>

        {isRejected ? (
          <>
            <h1 className="text-xl font-extrabold mb-2" style={{ color: "#A8332C" }}>
              درخواست شما رد شد
            </h1>
            <p className="text-sm mb-1" style={{ color: "#7A8A87" }}>
              متأسفانه درخواست همکاری شما تأیید نشد.
            </p>
            {agent?.adminNote && (
              <div className="mt-4 rounded-xl p-3 text-sm text-right" style={{ background: "#FBEAE8", color: "#A8332C" }}>
                <span className="font-semibold block mb-1">توضیح:</span>
                {agent.adminNote}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-extrabold mb-2" style={{ color: "#12312F" }}>
              اطلاعات شما با موفقیت ثبت شد
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#7A8A87" }}>
              بعد از بررسی اطلاعات، نتیجه از طریق پیامک به شماره‌ی شما اطلاع داده می‌شود.
            </p>
          </>
        )}

        <a
          href="/"
          className="inline-block mt-6 text-[13px] font-semibold"
          style={{ color: "#4B6E6B" }}
        >
          ← بازگشت به صفحه اصلی
        </a>
      </div>
    </div>
  );
}
