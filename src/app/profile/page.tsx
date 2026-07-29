"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, address })
      });
      const data = await res.json();
      if (data.ok) {
        setMsg('پروفایل با موفقیت ذخیره شد');
        window.location.href = '/shop';
      } else {
        setMsg(data.error || 'خطا در ذخیره');
      }
    } catch (e) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">تکمیل پروفایل</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">نام</label>
          <input className="mt-1 w-full p-2 border rounded" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">نام خانوادگی</label>
          <input className="mt-1 w-full p-2 border rounded" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">آدرس</label>
          <textarea className="mt-1 w-full p-2 border rounded" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        {msg && <div className="text-green-600">{msg}</div>}
        <button className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>{loading ? 'در حال ذخیره...' : 'ذخیره و ادامه'}</button>
      </form>
    </div>
  );
}
