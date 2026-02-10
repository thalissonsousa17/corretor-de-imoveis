import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizarDominio } from "@/lib/dominio";

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

  const dominio = normalizarDominio(host);

  const DOMINIO_PADRAO = process.env.DOMINIO_PADRAO!;
  if (dominio === DOMINIO_PADRAO || dominio.endsWith(".localhost")) {
    return null;
  }

  const dominioAtivo = await prisma.dominio.findFirst({
    where: {
      dominio,
      status: "ATIVO",
    },
    select: {
      pagina: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!dominioAtivo?.pagina) {
    return NextResponse.rewrite(new URL("/dominio-nao-encontrado", req.url));
  }

  const url = req.nextUrl.clone();
  url.pathname = `/corretor/${dominioAtivo.pagina.slug}${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}
