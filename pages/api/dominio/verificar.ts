import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const user = await getUserFromApiRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // 🔹 Verifica plano
  const profile = await prisma.corretorProfile.findUnique({
    where: { userId: user.id },
    select: { plano: true },
  });

  if (!profile || (profile.plano !== "EXPERT" && profile.plano !== "GRATUITO")) {
    return res.status(403).json({ error: "Plano necessário" });
  }

  // 🔹 Busca domínio do usuário
  const dominio = await prisma.dominio.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!dominio) {
    return res.status(400).json({ error: "Nenhum domínio para verificar" });
  }

  // 🔹 Verifica DNS
  const resultado = await verificarCnameDominio(dominio.dominio);
  const agora = new Date();

  const novoStatus = resultado.ok ? "ATIVO" : "PENDENTE";

  await prisma.dominio.update({
    where: { id: dominio.id },
    data: {
      status: novoStatus,
      verificadoEm: resultado.ok ? agora : null,
      ultimaVerificacao: agora,
    },
  });

  return res.status(200).json({
    ok: resultado.ok,
    status: novoStatus,
    mensagem: resultado.ok ? "Domínio ativado com sucesso!" : "DNS ainda não propagado.",
    detalhes: resultado,
  });
}
