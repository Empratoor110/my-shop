import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { sendOtpSms } from "../../../../lib/melipayamak";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").trim();

    if (!phone || phone.length < 9) {
      return NextResponse.json({ ok: false, error: "شماره موبایل نامعتبر است" }, { status: 400 });
    }

    // ساده: حداکثر 3 درخواست در 5 دقیقه
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCount = await prisma.otpCode.count({ where: { phone, createdAt: { gt: fiveMinAgo } } });

    if (recentCount >= 3) {
      return NextResponse.json({ ok: false, error: "بیش از حد درخواست ارسال شده، لطفاً بعدا تلاش کنید" }, { status: 429 });
    }

    // تولید کد 5 رقمی
    const otpPlain = Math.floor(10000 + Math.random() * 90000).toString();
    const hashed = await bcrypt.hash(otpPlain, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه

    await prisma.otpCode.create({
      data: {
        phone,
        code: hashed,
        expiresAt,
        used: false,
      },
    });

    // ارسال پیامک
    const sendResult = await sendOtpSms(phone, otpPlain);

    if (!sendResult.success) {
      return NextResponse.json({ ok: false, error: "ارسال پیامک ناموفق بود: " + (sendResult.error || "") }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
