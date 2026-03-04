import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { randomUUID } from "node:crypto";
import type { StatusComissao, TipoComissao } from "@/lib/types";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;

  // GET — listar comissões
  if (req.method === "GET") {
    try {
      const { status, tipo } = req.query;

      let query = supabaseAdmin
        .from("Comissao")
        .select("*, imovel:Imovel(id,titulo,cidade)")
        .eq("corretorId", corretorId)
        .order("createdAt", { ascending: false });

      if (status && status !== "TODOS") query = query.eq("status", status as StatusComissao);
      if (tipo && tipo !== "TODOS") query = query.eq("tipo", tipo as TipoComissao);

      const { data: comissoes, error } = await query;
      if (error) throw new Error(error.message);

      // Totais
      const { data: todas } = await supabaseAdmin
        .from("Comissao")
        .select("valorComissao,status,dataRecebimento")
        .eq("corretorId", corretorId);

      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const todasList = todas ?? [];
      const totalRecebido = todasList
        .filter((c) => c.status === "RECEBIDA")
        .reduce((s: number, c: any) => s + c.valorComissao, 0);

      const totalPendente = todasList
        .filter((c) => c.status === "PENDENTE")
        .reduce((s: number, c: any) => s + c.valorComissao, 0);

      const recebidoMes = todasList
        .filter(
          (c: any) =>
            c.status === "RECEBIDA" &&
            c.dataRecebimento &&
            new Date(c.dataRecebimento) >= inicioMes
        )
        .reduce((s: number, c: any) => s + c.valorComissao, 0);

      return res.status(200).json({
        comissoes: comissoes ?? [],
        resumo: { totalRecebido, totalPendente, recebidoMes },
      });
    } catch (error) {
      console.error("Erro ao listar comissões:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — criar comissão
  if (req.method === "POST") {
    try {
      const { descricao, valorImovel, percentual, valorComissao, tipo, dataVenda, observacoes, imovelId } = req.body;

      if (!descricao?.trim() || valorComissao === undefined) {
        return res.status(400).json({ message: "Descrição e valor da comissão são obrigatórios." });
      }

      if (imovelId) {
        const { data: imovel } = await supabaseAdmin
          .from("Imovel")
          .select("id,corretorId")
          .eq("id", imovelId)
          .maybeSingle();
        if (!imovel || imovel.corretorId !== corretorId) {
          return res.status(400).json({ message: "Imóvel não encontrado." });
        }
      }

      const { data: comissao, error } = await supabaseAdmin
        .from("Comissao")
        .insert({
          id: randomUUID(),
          descricao: descricao.trim(),
          valorImovel: valorImovel ? parseFloat(valorImovel) : null,
          percentual: percentual ? parseFloat(percentual) : null,
          valorComissao: parseFloat(valorComissao),
          tipo: tipo || "VENDA",
          dataVenda: dataVenda ? new Date(dataVenda).toISOString() : null,
          observacoes: observacoes?.trim() || null,
          imovelId: imovelId || null,
          corretorId,
        })
        .select("*, imovel:Imovel(id,titulo,cidade)")
        .single();

      if (error) throw new Error(error.message);
      return res.status(201).json(comissao);
    } catch (error) {
      console.error("Erro ao criar comissão:", error);
      return res.status(500).json({ message: "Erro ao criar comissão." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
