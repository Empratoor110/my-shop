// مسیر فایل: src/app/api/varieties/route.ts
// API عمومی — صفحه‌ی /varieties از این می‌خونه (نیازی به لاگین ادمین نداره)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.varietyItem.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    const grouped = {
      specs: items.filter((i) => i.category === "specs"),
      weeds: items.filter((i) => i.category === "weeds"),
      diseases: items.filter((i) => i.category === "diseases"),
      pests: items.filter((i) => i.category === "pests"),
    };

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error("Varieties fetch error:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}
