// src/lib/melipayamak.ts
// ارسال کد OTP با استفاده از سرویس پترن (الگو) ملی‌پیامک
// خودمون کد رو می‌سازیم، از طریق args داخل الگوی پیامکی جایگزین {0} می‌کنیم،
// و همون کد رو برمی‌گردونیم تا توی دیتابیس ذخیره بشه و بعداً verify بشه.

const MELIPAYAMAK_API_KEY = "7cf625a496c947f8bccea0943685d75f";
const MELIPAYAMAK_BODY_ID = 486756;

interface MelipayamakResponse {
  recId?: number | string; // شناسه‌ی پیگیری پیامک در صورت ارسال موفق
  status: string;          // توضیح وضعیت (مثلاً 'عملیات موفق')
}

interface SendOtpResult {
  success: boolean;
  code?: string; // کد OTP که ما ساختیم و پیامک شده (برای ذخیره در دیتابیس)
  error?: string;
}

export async function sendOtpSms(phone: string): Promise<SendOtpResult> {
  // ساخت یک کد ۵ رقمی تصادفی برای OTP
  const otpCode = Math.floor(10000 + Math.random() * 90000).toString();

  try {
    const url = `https://console.melipayamak.com/api/send/shared/${MELIPAYAMAK_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bodyId: MELIPAYAMAK_BODY_ID,
        to: phone,
        args: [otpCode], // این مقدار جای {0} توی متن الگو می‌شینه
      }),
    });

    const data: MelipayamakResponse = await res.json();
    console.log("Melipayamak response:", data);

    const isSuccess = res.ok && !!data.recId && data.status === "عملیات موفق";

    if (isSuccess) {
      return { success: true, code: otpCode };
    } else {
      console.error("Melipayamak error:", data);
      return { success: false, error: data.status || JSON.stringify(data) };
    }
  } catch (error) {
    console.error("Melipayamak fetch error:", error);
    return { success: false, error: String(error) };
  }
}
