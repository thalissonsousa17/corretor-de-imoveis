import { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { ImovelStatus } from "@prisma/client";

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "PATCH") {
      return res.status(405).json({ message: "Método não permitido" });
    }

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const { status } = req.body as { status?: string };

    if (!status || !Object.values(ImovelStatus).includes(status as ImovelStatus)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const imovel = await prisma.imovel.findFirst({
      where: {
        id,
        corretorId: req.user.id,
      },
    });

    if (!imovel) {
      return res.status(404).json({ message: "Imóvel não encontrado" });
    }

    await prisma.imovel.update({
      where: { id },
      data: {
        status: status as ImovelStatus,
      },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});
