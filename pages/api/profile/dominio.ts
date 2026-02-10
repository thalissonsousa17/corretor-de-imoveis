import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api";

function normalizarDominio(dominio: string) {
  return dominio
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromApiRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // 🔹 GET — carregar domínio do usuário
  if (req.method === "GET") {
    const dominio = await prisma.dominio.findFirst({
      where: { userId: user.id },
      select: {
        dominio: true,
        status: true,
      },
    });

    return res.status(200).json(dominio);
  }

  // 🔹 POST — salvar / atualizar domínio
  if (req.method === "POST") {
    const { dominio } = req.body;

    if (!dominio || typeof dominio !== "string") {
      return res.status(400).json({ error: "Domínio inválido" });
    }

    const dominioNormalizado = normalizarDominio(dominio);

    // 🔒 Verificar se o domínio já está em uso por outro usuário
    const dominioEmUso = await prisma.dominio.findFirst({
      where: {
        dominio: dominioNormalizado,
        NOT: { userId: user.id },
      },
    });

    if (dominioEmUso) {
      return res.status(409).json({ error: "Domínio já está em uso" });
    }

    // 🔍 Verificar se o usuário já possui domínio
    const dominioExistente = await prisma.dominio.findFirst({
      where: { userId: user.id },
    });

    if (dominioExistente) {
      await prisma.dominio.update({
        where: { id: dominioExistente.id },
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
          userId: user.id,
        },
      });
    }

    return res.status(200).json({
      mensagem: "Domínio salvo com sucesso. Aguardando verificação DNS.",
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
