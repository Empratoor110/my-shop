// src/lib/melipayamak.ts
// ارسال کد OTP با استفاده از سرویس ملی‌پیامک
// این ماژول دیگر خودش کد نمی‌سازد؛ کد را به عنوان آرگومان می‌گیرد و ارسال می‌کند.

const MELIPAYAMAK_API_KEY = process.env.MELIPAYAMAK_API_KEY || "";
const MELIPAYAMAK_BODY_ID = Number(process.env.MELIPAYAMAK_BODY_ID || 0);

interface MelipayamakResponse {
  recId?: number | string;
  status: string;
}

interface SendOtpResult {
  success: boolean;
  error?: string;
}

export async function sendOtpSms(phone: string, code: string): Promise<SendOtpResult> {
  if (!MELIPAYAMAK_API_KEY || !MELIPAYAMAK_BODY_ID) {
    return { success: false, error: "Melipayamak config not set" };
  }

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
        args: [code],
      }),
    });

    const data: MelipayamakResponse = await res.json();
    console.log("Melipayamak response:", data);

    const isSuccess = res.ok && !!data.recId && (data.status === "عملیات موفق" || data.status === "موفق");

    if (isSuccess) {
      return { success: true };
    } else {
      console.error("Melipayamak error:", data);
      return { success: false, error: data.status || JSON.stringify(data) };
    }
  } catch (error) {
    console.error("Melipayamak fetch error:", error);
    return { success: false, error: String(error) };
  }
}
