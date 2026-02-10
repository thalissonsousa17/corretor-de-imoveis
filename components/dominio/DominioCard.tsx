import { prisma } from "@/lib/prisma";
import type { NextApiResponse } from "next";
import type { AuthApiRequest } from "@/lib/authMiddleware";

function normalizarDominio(dominio: string): string {
  return dominio
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const userId = user.id;

  // 🔹 GET
  if (req.method === "GET") {
    const dominio = await prisma.dominio.findFirst({
      where: { userId },
      select: {
        dominio: true,
        status: true,
        verificadoEm: true,
        ultimaVerificacao: true,
      },
    });

    return res.status(200).json(dominio);
  }

  // 🔹 POST
  if (req.method === "POST") {
    const { dominio } = req.body as { dominio?: string };

    if (!dominio) {
      return res.status(400).json({ error: "Domínio inválido" });
    }

    const dominioNormalizado = normalizarDominio(dominio);

    const dominioEmUso = await prisma.dominio.findFirst({
      where: {
        dominio: dominioNormalizado,
        NOT: { userId },
      },
    });

    if (dominioEmUso) {
      return res.status(409).json({ error: "Domínio já está em uso" });
    }

    const existente = await prisma.dominio.findFirst({
      where: { userId },
    });

    if (existente) {
      await prisma.dominio.update({
        where: { id: existente.id },
        data: {
          dominio: dominioNormalizado,
          status: "PENDENTE",
          verificadoEm: null,
          ultimaVerificacao: null,
        },
      });
    } else {
      await prisma.dominio.create({
        data: {
          dominio: dominioNormalizado,
          userId,
        },
      });
    }

    return res.status(200).json({
      mensagem: "Domínio salvo com sucesso. Aguardando verificação DNS.",
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
