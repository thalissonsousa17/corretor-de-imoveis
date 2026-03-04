import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { data: adminExists } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("role", "ADMIN")
      .limit(1)
      .maybeSingle();
    return res.status(200).json({ adminExists: !!adminExists });
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}
