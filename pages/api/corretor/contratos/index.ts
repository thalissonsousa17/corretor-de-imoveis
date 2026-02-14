import type { NextApiResponse } from "next";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { CONTRATOS_TEMPLATES } from "@/lib/contratos-templates";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Não autenticado" });

  if (req.method === "GET") {
    try {
      const salvos = await prisma.contrato.findMany({
        where: { corretorId: userId },
        orderBy: { updatedAt: "desc" },
      });

      return res.status(200).json({
        templates: CONTRATOS_TEMPLATES,
        salvos,
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
      const contrato = await prisma.contrato.create({
        data: {
          titulo,
          conteudo,
          tipo: tipo ?? "PERSONALIZADO",
          corretorId: userId,
        },
      });
      return res.status(201).json(contrato);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar contrato" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
});
