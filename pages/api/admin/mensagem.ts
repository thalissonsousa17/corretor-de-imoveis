import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { tipo, userId, assunto, mensagem } = req.body;

  if (!assunto?.trim() || !mensagem?.trim()) {
    return res.status(400).json({ message: "Assunto e mensagem são obrigatórios." });
  }

  if (!["individual", "broadcast"].includes(tipo)) {
    return res.status(400).json({ message: "Tipo inválido." });
  }

  try {
    // Mensagem individual para um corretor específico
    if (tipo === "individual") {
      if (!userId) {
        return res.status(400).json({ message: "userId é obrigatório para mensagem individual." });
      }

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target || target.role !== "CORRETOR") {
        return res.status(404).json({ message: "Corretor não encontrado." });
      }

      const ticket = await prisma.ticketSuporte.create({
        data: {
          assunto,
          descricao: mensagem,
          status: "EM_ANDAMENTO",
          prioridade: "MEDIA",
          userId,
          mensagens: {
            create: {
              conteudo: mensagem,
              autorId: req.user!.id,
              lida: false,
            },
          },
        },
      });

      return res.status(201).json({ message: "Mensagem enviada com sucesso.", ticketId: ticket.id });
    }

    // Broadcast para todos os corretores
    if (tipo === "broadcast") {
      const corretores = await prisma.user.findMany({
        where: { role: "CORRETOR" },
        select: { id: true },
      });

      if (corretores.length === 0) {
        return res.status(400).json({ message: "Nenhum corretor cadastrado." });
      }

      await prisma.$transaction(
        corretores.map((c) =>
          prisma.ticketSuporte.create({
            data: {
              assunto,
              descricao: mensagem,
              status: "EM_ANDAMENTO",
              prioridade: "MEDIA",
              userId: c.id,
              mensagens: {
                create: {
                  conteudo: mensagem,
                  autorId: req.user!.id,
                  lida: false,
                },
              },
            },
          })
        )
      );

      return res.status(201).json({
        message: `Notificação enviada para ${corretores.length} corretor(es).`,
      });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ message: "Erro interno ao enviar mensagem." });
  }
}

export default authorize(handler, "ADMIN");
