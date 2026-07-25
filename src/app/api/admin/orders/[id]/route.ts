import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}