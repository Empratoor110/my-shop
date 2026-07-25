// مسیر فایل: src/app/api/content-admin/login/route.ts
// دقیقاً همون منطق لاگین ادمین فروش، ولی روی جدول ContentAdmin

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { captchaStore } from "../../admin/captcha/store";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const { email, password, captchaToken, captchaAnswer } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور را وارد کنید" },
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

    const admin = await prisma.contentAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `حساب شما به دلیل تلاش‌های ناموفق قفل شده. ${minutesLeft} دقیقه دیگر تلاش کنید` },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      const newAttempts = admin.failedAttempts + 1;
      const shouldLock = newAttempts >= MAX_ATTEMPTS;

      await prisma.contentAdmin.update({
        where: { id: admin.id },
        data: {
          failedAttempts: shouldLock ? 0 : newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
            : null,
        },
      });

      if (shouldLock) {
        return NextResponse.json(
          { error: `حساب شما به دلیل ${MAX_ATTEMPTS} تلاش ناموفق به مدت ${LOCK_MINUTES} دقیقه قفل شد` },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `ایمیل یا رمز عبور اشتباه است (${MAX_ATTEMPTS - newAttempts} تلاش باقیمانده)` },
        { status: 401 }
      );
    }

    await prisma.contentAdmin.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    return NextResponse.json({ success: true, contentAdminId: admin.id });
  } catch (error) {
    console.error("Content Admin Login Error:", error);
    return NextResponse.json({ error: "خطای سرور", detail: String(error) }, { status: 500 });
  }
}
