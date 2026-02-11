import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns"; // ← ADICIONAR

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

  const dnsCheck = await verificarCnameDominio(dominioNormalizado);
  const agora = new Date();
  const novoStatus = dnsCheck.ok ? "ATIVO" : "PENDENTE";

  const dominioExistente = await prisma.dominio.findFirst({
    where: { userId: user.id },
  });

  if (dominioExistente) {
    await prisma.dominio.update({
      where: { id: dominioExistente.id },
      data: {
        dominio: dominioNormalizado,
        status: novoStatus,
        verificadoEm: dnsCheck.ok ? agora : null,
        ultimaVerificacao: agora,
      },
    });
  } else {
    await prisma.dominio.create({
      data: {
        dominio: dominioNormalizado,
        status: novoStatus,
        userId: user.id,
        verificadoEm: dnsCheck.ok ? agora : null,
        ultimaVerificacao: agora,
      },
    });
  }

  if (dnsCheck.ok) {
    return res.status(200).json({
      ok: true,
      dominio: dominioNormalizado,
      status: "ATIVO",
      mensagem: "Domínio salvo e verificado com sucesso! Já está ativo.",
    });
  } else {
    return res.status(200).json({
      ok: true,
      dominio: dominioNormalizado,
      status: "PENDENTE",
      mensagem: "Domínio salvo. Configure o DNS para ativar.",
      dnsDetalhes: {
        error: dnsCheck.error,
        expected: dnsCheck.expected,
        found: dnsCheck.found,
      },
    });
  }
}
