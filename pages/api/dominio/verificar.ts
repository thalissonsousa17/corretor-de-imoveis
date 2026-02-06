import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { verificarCnameDominio } from "@/lib/dns";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const profile = await prisma.corretorProfile.findUnique({
    where: { userId: req.user!.id },
    select: {
      dominioPersonalizado: true,
      plano: true,
    },
  });

  // segurança extra (ok manter)
  if (!profile) {
    return res.status(404).json({ error: "Perfil não encontrado" });
  }

  if (profile.plano !== "EXPERT") {
    return res.status(403).json({
      error: "Recurso disponível apenas para o plano EXPERT",
    });
  }

  if (!profile.dominioPersonalizado) {
    return res.status(400).json({
      error: "Nenhum domínio cadastrado para verificação",
    });
  }

  const resultado = await verificarCnameDominio(profile.dominioPersonalizado);
  const agora = new Date();

  if (!resultado.ok) {
    await prisma.corretorProfile.update({
      where: { userId: req.user!.id },
      data: {
        dominioStatus: "PENDENTE",
        dominioUltimaVerificacao: agora,
      },
    });

    return res.status(200).json({
      ok: false,
      status: "PENDENTE",
      dominio: profile.dominioPersonalizado,
      esperado: resultado.expected,
      encontrado: resultado.found ?? null,
      erro: resultado.error,
    });
  }

  await prisma.corretorProfile.update({
    where: { userId: req.user!.id },
    data: {
      dominioStatus: "ATIVO",
      dominioVerificadoEm: agora,
      dominioUltimaVerificacao: agora,
    },
  });

  return res.status(200).json({
    ok: true,
    status: "ATIVO",
    dominio: profile.dominioPersonalizado,
    mensagem: "Domínio verificado e ativado com sucesso",
  });
});
