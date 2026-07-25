import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ویرایش محصول
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name, price, category, description, stock } = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseInt(price),
        category,
        description,
        stock: parseInt(stock) || 0,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

// حذف محصول
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}