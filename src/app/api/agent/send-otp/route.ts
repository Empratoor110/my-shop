import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captchaStore } from "../../admin/captcha/store";
import { sendOtpSms } from "@/lib/melipayamak";

export async function POST(req: NextRequest) {
  try {
    const { phone, captchaToken, captchaAnswer } = await req.json();

    if (!phone || phone.length !== 11) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    if (!captchaToken || !captchaAnswer) {
      return NextResponse.json(
        { error: "لطفاً تأیید کنید که انسان هستید" },
        { status: 400 }
      );
    }

    const expectedAnswer = captchaStore.get(captchaToken);
    if (!expectedAnswer || expectedAnswer !== parseInt(captchaAnswer)) {
      return NextResponse.json(
        { error: "پاسخ کپچا اشتباه است" },
        { status: 400 }
      );
    }
    captchaStore.delete(captchaToken);

    await prisma.otpCode.deleteMany({
      where: { phone },
    });

    const smsResult = await sendOtpSms(phone);

    if (!smsResult.success || !smsResult.code) {
      return NextResponse.json(
        { error: "خطا در ارسال پیامک. لطفاً دوباره تلاش کنید" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await prisma.otpCode.create({
      data: { phone, code: smsResult.code, expiresAt },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
