// مسیر فایل: src/app/api/content-admin/varieties/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.varietyItem.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Content admin varieties fetch error:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category,
      name,
      detail,
      images,
      yieldInfo,
      region,
      resistance,
      growthType,
      daysToSpike,
      daysToMaturity,
      plantHeight,
      grainColor,
      thousandGrainWeight,
      lodging,
      grainShattering,
      grainProtein,
      grainHardness,
      yellowRust,
    } = body;
    // images: آرایه‌ای با حداکثر ۴ آیتم به شکل { url, title }

    if (!category || !name || !detail) {
      return NextResponse.json(
        { error: "دسته‌بندی، نام و توضیحات اجباری است" },
        { status: 400 }
      );
    }

    const validCategories = ["specs", "weeds", "diseases", "pests"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "دسته‌بندی نامعتبر است" }, { status: 400 });
    }

    const imgs = Array.isArray(images) ? images.slice(0, 4) : [];

    const item = await prisma.varietyItem.create({
      data: {
        category,
        name,
        detail,
        image1: imgs[0]?.url || null,
        image1Title: imgs[0]?.title || null,
        image2: imgs[1]?.url || null,
        image2Title: imgs[1]?.title || null,
        image3: imgs[2]?.url || null,
        image3Title: imgs[2]?.title || null,
        image4: imgs[3]?.url || null,
        image4Title: imgs[3]?.title || null,
        yieldInfo: yieldInfo || null,
        region: region || null,
        resistance: resistance || null,
        growthType: growthType || null,
        daysToSpike: daysToSpike || null,
        daysToMaturity: daysToMaturity || null,
        plantHeight: plantHeight || null,
        grainColor: grainColor || null,
        thousandGrainWeight: thousandGrainWeight || null,
        lodging: lodging || null,
        grainShattering: grainShattering || null,
        grainProtein: grainProtein || null,
        grainHardness: grainHardness || null,
        yellowRust: yellowRust || null,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Content admin varieties create error:", error);
    return NextResponse.json({ error: "خطا در ثبت اطلاعات" }, { status: 500 });
  }
}
