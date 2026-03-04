import type { NextApiResponse } from "next";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { CONTRATOS_TEMPLATES } from "@/lib/contratos-templates";
import { verificarLimitePlano } from "@/lib/verificarLimitePlano";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Não autenticado" });

  if (req.method === "GET") {
    try {
      const { data: salvos, error } = await supabaseAdmin
        .from("Contrato")
        .select("*")
        .eq("corretorId", userId)
        .order("updatedAt", { ascending: false });

      if (error) throw new Error(error.message);

      return res.status(200).json({
        templates: CONTRATOS_TEMPLATES,
        salvos: salvos ?? [],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar contratos" });
    }
  }

  if (req.method === "POST") {
    const { titulo, conteudo, tipo } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ error: "Título e conteúdo são obrigatórios" });
    }

    try {
      const limite = await verificarLimitePlano(userId, "contratos");
      if (!limite.permitido) {
        return res.status(403).json({
          error: `Limite de ${limite.limite} contrato(s) do plano ${limite.plano} atingido. Faça upgrade para continuar.`,
          code: "PLANO_LIMITE_ATINGIDO",
          recurso: "contratos",
          planoAtual: limite.plano,
        });
      }
      const { data: contrato, error } = await supabaseAdmin
        .from("Contrato")
        .insert({
          id: randomUUID(),
          titulo,
          conteudo,
          tipo: tipo ?? "PERSONALIZADO",
          corretorId: userId,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      return res.status(201).json(contrato);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar contrato" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
});
