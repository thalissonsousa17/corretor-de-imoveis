import { NextApiRequest } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export async function getSession(req: NextApiRequest) {
  const sessionToken =
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"] ||
    req.cookies["session"];

  if (!sessionToken) return null;

  try {
    const { data: session } = await supabaseAdmin
      .from("Session")
      .select("*, user:User(*)")
      .eq("id", sessionToken)
      .maybeSingle();

    if (!session || new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = Array.isArray(session.user) ? session.user[0] : session.user;
    return { ...session, user };
  } catch (error) {
    console.error("Erro na validação da sessão:", error);
    return null;
  }
}
