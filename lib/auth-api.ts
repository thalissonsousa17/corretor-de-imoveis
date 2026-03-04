import type { NextApiRequest } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { parse } from "cookie";

export async function getUserFromApiRequest(req: NextApiRequest) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const parsed = parse(cookies);
  const sessionToken = parsed["sessionId"];
  if (!sessionToken) return null;

  // Query 1: sessão
  const { data: session } = await supabaseAdmin
    .from("Session")
    .select("id, userId, expiresAt")
    .eq("id", sessionToken)
    .gt("expiresAt", new Date().toISOString())
    .maybeSingle();

  if (!session) return null;

  // Query 2: usuário
  const { data: user } = await supabaseAdmin
    .from("User")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  return user ?? null;
}