import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_env";

export interface AuthUser {
  id: string;
  phone: string;
}

function parseCookie(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string,string>;
  return cookieHeader.split(";").map(c => c.trim()).reduce((acc, pair) => {
    const [k, ...v] = pair.split("=");
    acc[k] = decodeURIComponent(v.join("="));
    return acc;
  }, {} as Record<string,string>);
}

export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  try {
    const cookieHeader = req.headers.get("cookie");
    const cookies = parseCookie(cookieHeader);
    const token = cookies["token"];
    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET) as { userId?: string } | string;
    const userId = typeof payload === "object" && (payload as any).userId ? (payload as any).userId : null;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return { id: user.id, phone: user.phone };
  } catch (err) {
    console.error("getUserFromRequest error:", err);
    return null;
  }
}
