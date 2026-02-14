import type { NextApiResponse } from "next";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Não autenticado" });

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const { titulo, conteudo } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ error: "Título e conteúdo são obrigatórios" });
    }

    try {
      const contrato = await prisma.contrato.findFirst({
        where: { id, corretorId: userId },
      });

      if (!contrato) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }

      const atualizado = await prisma.contrato.update({
        where: { id },
        data: { titulo, conteudo },
      });

      return res.status(200).json(atualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar contrato" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const contrato = await prisma.contrato.findFirst({
        where: { id, corretorId: userId },
      });

      if (!contrato) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }

      await prisma.contrato.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao excluir contrato" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
});
