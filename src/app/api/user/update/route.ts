import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, address } = body;

    // ساد‌ه: کاربر را از کوکی token شناسایی نمی‌کنیم (نیاز به middleware یا verify JWT)
    // در نسخه بعدی: تایید JWT و استفاده از userId واقعی

    // فعلاً فقط پاسخ موفق به فرانت می‌دهیم و در سمت سرور ذخیره‌سازی را انجام نمی‌دهیم
    // TODO: verify JWT from cookie and update user by id

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
