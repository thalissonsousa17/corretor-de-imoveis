import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function getUserFromRequest(req: NextRequest) {
  const sessionToken = req.cookies.get("session")?.value;
  if (!sessionToken) return null;

  const { data: session } = await supabaseAdmin
    .from("Session")
    .select("*, user:User(*, profile:CorretorProfile(*))")
    .eq("id", sessionToken)
    .maybeSingle();

  if (!session || new Date(session.expiresAt) < new Date()) return null;

  const user = Array.isArray(session.user) ? session.user[0] : session.user;
  return user ?? null;
}
