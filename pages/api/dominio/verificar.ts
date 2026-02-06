import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api"; // Padronizado com o de cima
import { verificarCnameDominio } from "@/lib/dns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromApiRequest(req);
  if (!user) return res.status(401).json({ error: "Não autenticado" });

  const profile = await prisma.corretorProfile.findUnique({
    where: { userId: user.id },
    select: { dominioPersonalizado: true, plano: true },
  });

  if (!profile || (profile.plano !== "EXPERT" && profile.plano !== "GRATUITO")) {
    return res.status(403).json({ error: "Plano necessário" });
  }

  if (!profile.dominioPersonalizado) {
    return res.status(400).json({ error: "Nenhum domínio para verificar" });
  }

  const resultado = await verificarCnameDominio(profile.dominioPersonalizado);
  const agora = new Date();

  const novoStatus = resultado.ok ? "ATIVO" : "PENDENTE";

  await prisma.corretorProfile.update({
    where: { userId: user.id },
    data: {
      dominioStatus: novoStatus,
      dominioVerificadoEm: resultado.ok ? agora : undefined,
      dominioUltimaVerificacao: agora,
    },
  });

  return res.status(200).json({
    ok: resultado.ok,
    status: novoStatus,
    mensagem: resultado.ok ? "Domínio ativado!" : "DNS ainda não propagado.",
    detalhes: resultado,
  });
}
