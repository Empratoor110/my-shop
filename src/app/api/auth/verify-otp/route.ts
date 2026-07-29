import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").trim();
    const code = String(body.code || "").trim();

    if (!phone || !code) {
      return NextResponse.json({ ok: false, error: "phone and code required" }, { status: 400 });
    }

    const otp = await prisma.otpCode.findFirst({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ ok: false, error: "کد معتبر پیدا نشد یا منقضی شده" }, { status: 400 });
    }

    const ok = await bcrypt.compare(code, otp.code);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "کد اشتباه است" }, { status: 400 });
    }

    // mark used
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    // پیدا کردن یا ساخت کارب��
    const user = await prisma.user.upsert({
      where: { phone },
      create: { phone },
      update: {},
    });

    // sign JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

    return NextResponse.json({ ok: true, user }, { headers: { "Set-Cookie": cookie } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
