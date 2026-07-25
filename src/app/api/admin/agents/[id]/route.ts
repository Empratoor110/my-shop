// مسیر فایل: src/app/api/admin/agents/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { approvalStatus, commissionRate, adminNote } = await req.json();

    const data: any = {};
    if (approvalStatus) {
      if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
        return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
      }
      data.approvalStatus = approvalStatus;
    }
    if (commissionRate !== undefined) {
      data.commissionRate = Number(commissionRate);
    }
    if (adminNote !== undefined) {
      data.adminNote = adminNote;
    }

    const agent = await prisma.agent.update({ where: { id }, data });

    // TODO: در این نقطه می‌تونید پیامک اطلاع‌رسانی نتیجه (تأیید/رد) رو با sendOtpSms
    // یا یه تابع پیامک متنی دیگه به agent.phone ارسال کنید.

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Admin agent update error:", error);
    return NextResponse.json({ error: "خطا در ذخیره تغییرات" }, { status: 500 });
  }
}
