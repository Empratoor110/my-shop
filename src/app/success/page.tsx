"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">سفارش ثبت شد!</h1>
        <p className="text-gray-500 mb-6">
          سفارش شما با موفقیت ثبت شد و در اسرع وقت بررسی خواهد شد.
        </p>
        <button
          onClick={() => router.push("/cart")}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    </div>
  );
}