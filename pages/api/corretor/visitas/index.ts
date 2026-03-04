import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { randomUUID } from "node:crypto";
import { verificarLimitePlano } from "@/lib/verificarLimitePlano";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;

  // GET — listar visitas do corretor (filtro por mes/ano opcional)
  if (req.method === "GET") {
    try {
      const { mes, ano } = req.query;

      let query = supabaseAdmin
        .from("Visita")
        .select("*, imovel:Imovel(id,titulo,localizacao,cidade)")
        .eq("corretorId", corretorId)
        .order("dataHora", { ascending: true });

      if (mes && ano) {
        const m = parseInt(mes as string, 10) - 1;
        const a = parseInt(ano as string, 10);
        const inicio = new Date(a, m, 1).toISOString();
        const fim = new Date(a, m + 1, 1).toISOString();
        query = query.gte("dataHora", inicio).lt("dataHora", fim);
      }

      const { data: visitas, error } = await query;
      if (error) throw new Error(error.message);
      return res.status(200).json(visitas ?? []);
    } catch (error) {
      console.error("Erro ao listar visitas:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — agendar visita
  if (req.method === "POST") {
    try {
      const { dataHora, nomeVisitante, telefoneVisitante, emailVisitante, observacoes, imovelId } = req.body;

      if (!dataHora || !nomeVisitante?.trim()) {
        return res.status(400).json({ message: "Data/hora e nome do visitante sao obrigatorios." });
      }

      const limite = await verificarLimitePlano(corretorId, "visitas");
      if (!limite.permitido) {
        return res.status(403).json({
          message: `Limite de ${limite.limite} visita(s) do plano ${limite.plano} atingido. Faça upgrade para continuar.`,
          code: "PLANO_LIMITE_ATINGIDO",
          recurso: "visitas",
          planoAtual: limite.plano,
        });
      }

      if (imovelId) {
        const { data: imovel } = await supabaseAdmin
          .from("Imovel")
          .select("id,corretorId")
          .eq("id", imovelId)
          .maybeSingle();
        if (!imovel || imovel.corretorId !== corretorId) {
          return res.status(400).json({ message: "Imovel nao encontrado." });
        }
      }

      const { data: visita, error } = await supabaseAdmin
        .from("Visita")
        .insert({
          id: randomUUID(),
          dataHora: new Date(dataHora).toISOString(),
          nomeVisitante: nomeVisitante.trim(),
          telefoneVisitante: telefoneVisitante?.trim() || null,
          emailVisitante: emailVisitante?.trim() || null,
          observacoes: observacoes?.trim() || null,
          imovelId: imovelId || null,
          corretorId,
        })
        .select("*, imovel:Imovel(id,titulo,localizacao,cidade)")
        .single();

      if (error) throw new Error(error.message);
      return res.status(201).json(visita);
    } catch (error) {
      console.error("Erro ao agendar visita:", error);
      return res.status(500).json({ message: "Erro ao agendar visita." });
    }
  }

  return res.status(405).json({ message: "Metodo nao permitido." });
}

export default authorize(handler);
