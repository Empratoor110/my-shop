import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, address } = body;

    // Simple validation
    if (!firstName && !lastName && !address) {
      return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        address: address ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
