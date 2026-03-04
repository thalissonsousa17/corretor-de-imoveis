import { NextApiRequest } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export async function getSession(req: NextApiRequest) {
  // Tenta os três nomes de cookie possíveis
  const sessionToken =
    req.cookies["sessionId"] ||
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"] ||
    req.cookies["session"];

  if (!sessionToken) return null;

  try {
    // Query 1: sessão
    const { data: session } = await supabaseAdmin
      .from("Session")
      .select("id, userId, expiresAt")
      .eq("id", sessionToken)
      .maybeSingle();

    if (!session || new Date(session.expiresAt) < new Date()) return null;

    // Query 2: usuário
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();

    if (!user) return null;

    return { ...session, user };
  } catch (error) {
    console.error("Erro na validação da sessão:", error);
    return null;
  }
}