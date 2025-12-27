import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const rotasPremium = ["/dashboard/estatisticas", "/dashboard/relatorios"];

  const precisaPlano = rotasPremium.some((rota) => pathname.startsWith(rota));

  if (!precisaPlano) {
    return NextResponse.next();
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const profile = await prisma.corretorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || profile.plano === "GRATUITO") {
    return NextResponse.redirect(new URL("/upgrade", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
