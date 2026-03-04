import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

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

  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("plano")
    .eq("userId", user.id)
    .maybeSingle();

  if (!profile || profile.plano === "GRATUITO") {
    return NextResponse.redirect(new URL("/upgrade", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
