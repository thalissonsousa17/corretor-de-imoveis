import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { supabaseAdmin } from "@/lib/supabase";
import { serialize } from "cookie";
import { cookieOptions } from "@/lib/cookies";

export default async function handleLougout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;

  // Clear cookie FIRST — always, regardless of session delete outcome
  res.setHeader(
    "Set-Cookie",
    serialize("sessionId", "", {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    })
  );

  if (sessionId) {
    try {
      // Fecha o LogAcesso correspondente a esta sessão
      const { data: log } = await supabaseAdmin
        .from("LogAcesso")
        .select("id, loginAt")
        .eq("sessionId", sessionId)
        .is("logoutAt", null)
        .maybeSingle();

      if (log) {
        const loginAtStr: string = log.loginAt;
        const utc = loginAtStr.endsWith("Z") || loginAtStr.includes("+") ? loginAtStr : loginAtStr + "Z";
        const durationMinutes = Math.round((Date.now() - new Date(utc).getTime()) / 60000);
        await supabaseAdmin
          .from("LogAcesso")
          .update({ logoutAt: new Date().toISOString(), durationMinutes })
          .eq("id", log.id);
      }
    } catch {}

    try {
      await supabaseAdmin.from("Session").delete().eq("id", sessionId);
    } catch {}
  }

  return res.status(200).json({ message: "Logout realizado com sucesso." });
}
