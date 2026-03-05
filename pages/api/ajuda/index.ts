import { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405).json({ message: "Método não permitido." });

  const { data, error } = await supabaseAdmin
    .from("AjudaItem")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("createdAt", { ascending: true });

  if (error) return res.status(500).json({ message: "Erro ao buscar itens de ajuda." });

  return res.status(200).json(data ?? []);
});
