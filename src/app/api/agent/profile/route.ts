// مسیر فایل: src/app/api/agent/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, entityType, sheba } = body;

    if (!agentId) {
      return NextResponse.json({ error: "شناسه‌ی عامل یافت نشد" }, { status: 400 });
    }

    if (!entityType || !["individual", "legal"].includes(entityType)) {
      return NextResponse.json({ error: "نوع شخصیت را انتخاب کنید" }, { status: 400 });
    }

    if (!sheba || sheba.length !== 24) {
      return NextResponse.json({ error: "شماره شبا باید ۲۴ کاراکتر باشد" }, { status: 400 });
    }

    let data: any = { entityType, sheba, profileCompleted: true, approvalStatus: "pending" };

    if (entityType === "individual") {
      const { firstName, lastName, nationalId, warehouseAddress } = body;
      if (!firstName || !lastName || !nationalId || !warehouseAddress) {
        return NextResponse.json({ error: "لطفاً همه‌ی فیلدهای شخص حقیقی را پر کنید" }, { status: 400 });
      }
      data = { ...data, firstName, lastName, nationalId, warehouseAddress };
    } else {
      const { companyName, companyNationalId, companyAddress, ceoName, ceoNationalId, ceoPhone } = body;
      if (!companyName || !companyNationalId || !companyAddress || !ceoName || !ceoNationalId || !ceoPhone) {
        return NextResponse.json({ error: "لطفاً همه‌ی فیلدهای شخصیت حقوقی را پر کنید" }, { status: 400 });
      }
      data = { ...data, companyName, companyNationalId, companyAddress, ceoName, ceoNationalId, ceoPhone };
    }

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data,
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Agent Profile Save Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "شناسه‌ی عامل یافت نشد" }, { status: 400 });
    }
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: "عامل یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Agent Profile Fetch Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
