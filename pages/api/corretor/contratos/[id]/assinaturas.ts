import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { randomUUID } from "node:crypto";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const contratoId = req.query.id as string;

  // Verificar ownership do contrato
  const { data: contrato } = await supabaseAdmin
    .from("Contrato")
    .select("id,corretorId")
    .eq("id", contratoId)
    .maybeSingle();

  if (!contrato || contrato.corretorId !== corretorId) {
    return res.status(404).json({ message: "Contrato não encontrado." });
  }

  // GET — listar assinaturas do contrato
  if (req.method === "GET") {
    try {
      const { data: assinaturas, error } = await supabaseAdmin
        .from("Assinatura")
        .select("*")
        .eq("contratoId", contratoId)
        .order("assinadoEm", { ascending: false });

      if (error) throw new Error(error.message);
      return res.status(200).json(assinaturas ?? []);
    } catch (error) {
      console.error("Erro ao listar assinaturas:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — adicionar assinatura
  if (req.method === "POST") {
    try {
      const { nome, email, documento, assinatura: assinaturaData } = req.body;

      if (!nome?.trim() || !email?.trim() || !assinaturaData) {
        return res.status(400).json({ message: "Nome, email e assinatura são obrigatórios." });
      }

      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        null;

      const { data: novaAssinatura, error } = await supabaseAdmin
        .from("Assinatura")
        .insert({
          id: randomUUID(),
          contratoId,
          nome: nome.trim(),
          email: email.trim(),
          documento: documento?.trim() || null,
          assinatura: assinaturaData,
          ip,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      return res.status(201).json(novaAssinatura);
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      return res.status(500).json({ message: "Erro ao salvar assinatura." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
