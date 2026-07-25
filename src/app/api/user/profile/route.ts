import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      firstName,
      lastName,
      fatherName,
      seedAmount,
      farmLocation,
      phone,
      sheba,
      referralCode,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        fatherName,
        seedAmount,
        farmLocation,
        contactPhone: phone,
        sheba,
        referralCode,
      },
    });

    return NextResponse.json({ success: true, user });
} catch (error) {
    console.error("Profile Error:", error);
    return NextResponse.json(
      { error: "خطای سرور", detail: String(error) },
      { status: 500 }
    );
  }
}