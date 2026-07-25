import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "کد تأیید اشتباه یا منقضی شده است" },
        { status: 400 }
      );
    }

    // کد رو به عنوان استفاده شده علامت بزن
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // کاربر رو پیدا کن یا بساز
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      isProfileComplete: !!user.firstName,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "خطای سرور", detail: String(error) }, { status: 500 });
  }
  
}