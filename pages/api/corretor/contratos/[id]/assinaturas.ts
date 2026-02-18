import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const contratoId = req.query.id as string;

  // Verificar ownership do contrato
  const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
  if (!contrato || contrato.corretorId !== corretorId) {
    return res.status(404).json({ message: "Contrato não encontrado." });
  }

  // GET — listar assinaturas do contrato
  if (req.method === "GET") {
    try {
      const assinaturas = await prisma.assinatura.findMany({
        where: { contratoId },
        orderBy: { assinadoEm: "desc" },
      });
      return res.status(200).json(assinaturas);
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

      const novaAssinatura = await prisma.assinatura.create({
        data: {
          contratoId,
          nome: nome.trim(),
          email: email.trim(),
          documento: documento?.trim() || null,
          assinatura: assinaturaData,
          ip,
        },
      });

      return res.status(201).json(novaAssinatura);
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      return res.status(500).json({ message: "Erro ao salvar assinatura." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
