import type { NextApiRequest } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { parse } from "cookie";

export async function getUserFromApiRequest(req: NextApiRequest) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const parsed = parse(cookies);
  const sessionToken = parsed["sessionId"];

  if (!sessionToken) return null;

  const { data: session } = await supabaseAdmin
    .from("Session")
    .select("*, user:User(*)")
    .eq("id", sessionToken)
    .gt("expiresAt", new Date().toISOString())
    .maybeSingle();

  if (!session) return null;

  const u = Array.isArray(session.user) ? session.user[0] : session.user;
  return u ?? null;
}
