import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/auth";
import { parse } from "date-fns";
import { toCSV } from "../../../../lib/csv";

export async function GET(req: Request) {
  try {
    // simple admin check (in future: proper role field)
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // For now we assume any authenticated user can call this endpoint;
    // future: check if authUser is contentAdmin or admin.

    const url = new URL(req.url);
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");
    const format = url.searchParams.get("format") || "json";

    const to = toStr ? new Date(toStr) : new Date();
    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);
    const count = orders.length;

    if (format === "csv") {
      const rows = orders.map(o => ({
        id: o.id,
        phone: o.user?.phone || "",
        status: o.status,
        total: o.total,
        createdAt: o.createdAt.toISOString(),
      }));
      const csv = toCSV(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sales_${from.toISOString()}_${to.toISOString()}.csv"`,
        },
      });
    }

    return NextResponse.json({ ok: true, from: from.toISOString(), to: to.toISOString(), totalSales, count, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
