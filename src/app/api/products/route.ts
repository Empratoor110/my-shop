import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// گرفتن همه محصولات
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

// افزودن محصول جدید
export async function POST(req: NextRequest) {
  try {
    const { name, price, category, description, stock } = await req.json();

    if (!name || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: "نام، قیمت، دسته‌بندی و موجودی اجباری هستند" },
        { status: 400 }
      );
    }

    if (parseInt(stock) < 0) {
      return NextResponse.json(
        { error: "موجودی نمیتواند منفی باشد" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        category,
        description,
        stock: parseInt(stock),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}