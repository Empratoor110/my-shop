import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    // find agent by phone
    const agent = await prisma.agent.findUnique({ where: { phone: authUser.phone } });
    if (!agent) return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: { agentId: agent.id },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const total = orders.reduce((s, o) => s + (o.total || 0), 0);

    return NextResponse.json({ ok: true, agent: { id: agent.id, phone: agent.phone, agentCode: agent.agentCode }, orders, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
