import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // گرفتن تاریخچه برای همه سفارش‌ها
    const orderIds = orders.map((o) => o.id);
    const histories = await prisma.orderStatusHistory.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { changedAt: "asc" },
    });

    const ordersWithHistory = orders.map((order) => ({
      ...order,
      history: histories.filter((h) => h.orderId === order.id),
    }));

    return NextResponse.json({ success: true, orders: ordersWithHistory });
  } catch (error) {
    console.error("Reports Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}