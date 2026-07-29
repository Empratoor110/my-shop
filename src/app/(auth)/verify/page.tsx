"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const phone = params?.get('phone') || '';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await res.json();
      if (data.ok) {
        // اگر پروفایل ناقص باشه، کاربر رو به صفحه تکمیل می‌فرستیم
        const needsProfile = !(data.user.firstName || data.user.lastName);
        router.push(needsProfile ? '/profile' : '/shop');
      } else {
        setError(data.error || 'کد اشتباه');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">وارد کردن کد</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">کد ارسال شده</label>
          <input className="mt-1 w-full p-2 border rounded" value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد ۵ رقمی" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>{loading ? 'در حال بررسی...' : 'تأیید کد'}</button>
      </form>
    </div>
  );
}
