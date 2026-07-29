"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/auth/verify?phone=${encodeURIComponent(phone)}`);
      } else {
        setError(data.error || 'خطا در ارسال کد');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">ورود یا ثبت‌نام</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">شماره موبایل</label>
          <input className="mt-1 w-full p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+98912..." />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>{loading ? 'در حال ارسال...' : 'دریافت کد'}</button>
      </form>
    </div>
  );
}
