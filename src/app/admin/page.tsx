"use client";

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [format, setFormat] = useState('json');
  const { data, error, mutate } = useSWR(`/api/admin/reports/sales?from=${from}&to=${to}&format=${format}`, fetcher);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">داشبورد ادمین - گزارش فروش</h1>
      <div className="mb-4 flex gap-2">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-2 border rounded" />
        <select value={format} onChange={e => setFormat(e.target.value)} className="p-2 border rounded">
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => mutate()}>بارگذاری</button>
      </div>
      {error && <div className="text-red-600">خطا در بارگذاری گزارش: {String(error)}</div>}
      {!data && <div>در حال بارگذاری...</div>}
      {data && data.ok && (
        <div>
          <div className="mb-4">مجموع فروش: <strong>{data.totalSales}</strong> — تعداد سفارش‌ها: <strong>{data.count}</strong></div>
          <div className="overflow-auto bg-white shadow rounded">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">تلفن</th>
                  <th className="p-2">وضعیت</th>
                  <th className="p-2">مبلغ</th>
                  <th className="p-2">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {data.orders?.map((o: any) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2">{o.id}</td>
                    <td className="p-2">{o.user?.phone}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">{o.total}</td>
                    <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
