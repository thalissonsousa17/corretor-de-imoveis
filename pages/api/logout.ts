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

  if (sessionId) {
    try {
      await supabaseAdmin.from("Session").delete().eq("id", sessionId);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao encerrar a sessão", error });
    }
  }

  res.setHeader(
    "Set-Cookie",
    serialize("sessionId", "", {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    })
  );

  return res.status(200).json({ message: "Logout realizado com sucesso." });
}
