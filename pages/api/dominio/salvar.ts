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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const user = await getUserFromApiRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const { dominio } = req.body;

  if (!dominio || typeof dominio !== "string") {
    return res.status(400).json({ error: "Domínio é obrigatório" });
  }

  const dominioNormalizado = normalizarDominio(dominio);

  const dominioRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;
  if (!dominioRegex.test(dominioNormalizado)) {
    return res.status(400).json({ error: "Domínio inválido" });
  }

  const dominiosBloqueados = ["automatech.app.br", "imobhub.automatech.app.br"];

  if (dominiosBloqueados.includes(dominioNormalizado)) {
    return res.status(400).json({ error: "Este domínio não pode ser utilizado" });
  }

  // 🔹 Verifica se domínio já está em uso
  const dominioEmUso = await prisma.dominio.findFirst({
    where: {
      dominio: dominioNormalizado,
      NOT: { userId: user.id },
    },
  });

  if (dominioEmUso) {
    return res.status(409).json({ error: "Domínio já está em uso por outro corretor" });
  }

  // 🔹 Verifica se o usuário já tem domínio
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
        status: "PENDENTE",
        userId: user.id,
      },
    });
  }

  return res.status(200).json({
    ok: true,
    dominio: dominioNormalizado,
    status: "PENDENTE",
    mensagem: "Domínio salvo com sucesso. Aguardando configuração de DNS.",
  });
}
