import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, items, total } = await req.json();

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "اطلاعات سفارش ناقص است" },
        { status: 400 }
      );
    }

    // بررسی موجودی همه محصولات
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `محصول یافت نشد` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `موجودی ${product.name} کافی نیست` },
          { status: 400 }
        );
      }
    }

    // ثبت سفارش
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // کم کردن موجودی محصولات
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}