import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middlewareDominio(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return null;
  }

  const host = req.headers.get("host");
  if (!host) return null;

  const dominio = host.replace(/^www\./, "");
  const DOMINIO_PADRAO = "imobhub.automatech.app.br";

  if (dominio === DOMINIO_PADRAO || dominio.endsWith(".localhost:3000")) {
    return null;
  }

  const corretor = await prisma.corretorProfile.findFirst({
    where: {
      dominioPersonalizado: dominio,
      dominioStatus: "ATIVO",
    },
    select: {
      slug: true,
    },
  });

  if (!corretor) {
    return NextResponse.rewrite(new URL("/dominio-nao-encontrado", req.url));
  }

  const url = req.nextUrl.clone();

  url.pathname = `/corretor/${corretor.slug}${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}
