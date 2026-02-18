import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const visitaId = req.query.id as string;

  // Verificar ownership
  const visita = await prisma.visita.findUnique({ where: { id: visitaId } });
  if (!visita || visita.corretorId !== corretorId) {
    return res.status(404).json({ message: "Visita nao encontrada." });
  }

  // PATCH — atualizar visita
  if (req.method === "PATCH") {
    try {
      const { dataHora, nomeVisitante, telefoneVisitante, emailVisitante, observacoes, status, imovelId } = req.body;

      const updated = await prisma.visita.update({
        where: { id: visitaId },
        data: {
          ...(dataHora !== undefined && { dataHora: new Date(dataHora) }),
          ...(nomeVisitante !== undefined && { nomeVisitante: nomeVisitante.trim() }),
          ...(telefoneVisitante !== undefined && { telefoneVisitante: telefoneVisitante?.trim() || null }),
          ...(emailVisitante !== undefined && { emailVisitante: emailVisitante?.trim() || null }),
          ...(observacoes !== undefined && { observacoes: observacoes?.trim() || null }),
          ...(status !== undefined && { status }),
          ...(imovelId !== undefined && { imovelId: imovelId || null }),
        },
        include: {
          imovel: { select: { id: true, titulo: true, localizacao: true, cidade: true } },
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar visita:", error);
      return res.status(500).json({ message: "Erro ao atualizar visita." });
    }
  }

  // DELETE — remover visita
  if (req.method === "DELETE") {
    try {
      await prisma.visita.delete({ where: { id: visitaId } });
      return res.status(200).json({ message: "Visita removida." });
    } catch (error) {
      console.error("Erro ao remover visita:", error);
      return res.status(500).json({ message: "Erro ao remover visita." });
    }
  }

  return res.status(405).json({ message: "Metodo nao permitido." });
}

export default authorize(handler);
