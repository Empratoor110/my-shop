"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AgentPage() {
  const { data, error } = useSWR('/api/agent/dashboard', fetcher);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">کارتابل عامل</h1>
      {error && <div className="text-red-600">{String(error)}</div>}
      {!data && <div>در حال بارگذاری...</div>}
      {data && data.ok && (
        <div>
          <div className="mb-4">عامل: {data.agent.phone} — کد: {data.agent.agentCode}</div>
          <div>مجموع فروش: {data.total}</div>
          <div className="mt-4">
            <h3 className="font-semibold">سفارش‌ها</h3>
            <ul className="list-disc ml-6">
              {data.orders.map((o: any) => (
                <li key={o.id}>{o.id} — {o.user?.phone} — {o.status} — {o.total}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
