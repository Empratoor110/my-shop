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
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}