import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const leadId = req.query.id as string;

  // Verificar se o lead pertence ao corretor
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.corretorId !== corretorId) {
    return res.status(404).json({ message: "Lead não encontrado." });
  }

  // PATCH — atualizar lead
  if (req.method === "PATCH") {
    try {
      const { nome, email, whatsapp, telefone, mensagem, observacoes, imovelInteresse, status } = req.body;

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: {
          ...(nome !== undefined && { nome: nome.trim() }),
          ...(email !== undefined && { email: email.trim() }),
          ...(whatsapp !== undefined && { whatsapp: whatsapp?.trim() || null }),
          ...(telefone !== undefined && { telefone: telefone?.trim() || null }),
          ...(mensagem !== undefined && { mensagem: mensagem?.trim() || null }),
          ...(observacoes !== undefined && { observacoes: observacoes?.trim() || null }),
          ...(imovelInteresse !== undefined && { imovelInteresse: imovelInteresse?.trim() || null }),
          ...(status !== undefined && { status }),
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      return res.status(500).json({ message: "Erro ao atualizar lead." });
    }
  }

  // DELETE — remover lead
  if (req.method === "DELETE") {
    try {
      await prisma.lead.delete({ where: { id: leadId } });
      return res.status(200).json({ message: "Lead removido." });
    } catch (error) {
      console.error("Erro ao remover lead:", error);
      return res.status(500).json({ message: "Erro ao remover lead." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
