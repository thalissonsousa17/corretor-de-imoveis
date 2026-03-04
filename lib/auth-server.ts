import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function getUserFromRequest(req: NextRequest) {
  const sessionToken = req.cookies.get("sessionId")?.value;
  if (!sessionToken) return null;

  // Query 1: busca a sessão
  const { data: session } = await supabaseAdmin
    .from("Session")
    .select("id, userId, expiresAt")
    .eq("id", sessionToken)
    .maybeSingle();

  if (!session || new Date(session.expiresAt) < new Date()) return null;

  // Query 2: busca o usuário
  const { data: user } = await supabaseAdmin
    .from("User")
    .select("id, email, role, name")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user) return null;

  // Query 3: busca o perfil
  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("plano, planoStatus, slug")
    .eq("userId", user.id)
    .maybeSingle();

  return { ...user, profile: profile ?? null };
}