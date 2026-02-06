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

  // CARREGAR DADOS
  if (req.method === "GET") {
    const profile = await prisma.corretorProfile.findUnique({
      where: { userId: user.id },
      select: { dominioPersonalizado: true, dominioStatus: true },
    });
    return res.status(200).json(profile);
  }

  // SALVAR DOMÍNIO
  if (req.method === "POST") {
    const { dominio } = req.body;
    if (!dominio) return res.status(400).json({ error: "Domínio é obrigatório" });

    const dominioNormalizado = normalizarDominio(dominio);
    const dominiosBloqueados = ["automatech.app.br", "imobhub.automatech.app.br"];

    if (dominiosBloqueados.includes(dominioNormalizado)) {
      return res.status(400).json({ error: "Este domínio é reservado" });
    }

    const dominioEmUso = await prisma.corretorProfile.findFirst({
      where: { dominioPersonalizado: dominioNormalizado, NOT: { userId: user.id } },
    });

    if (dominioEmUso) {
      return res.status(409).json({ error: "Domínio já em uso" });
    }

    await prisma.corretorProfile.update({
      where: { userId: user.id },
      data: {
        dominioPersonalizado: dominioNormalizado,
        dominioStatus: "PENDENTE",
        dominioVerificadoEm: null,
      },
    });

    return res.status(200).json({ ok: true, mensagem: "Domínio salvo com sucesso!" });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
