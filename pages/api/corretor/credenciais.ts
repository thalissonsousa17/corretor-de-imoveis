import type { NextApiResponse } from "next";
import type { AuthApiRequest } from "../../../lib/authMiddleware";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";
import { authorize } from "../../../lib/authMiddleware";

// Configuração padrão do Next.js API route
export const config = {
  api: { bodyParser: true },
};

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const user = req.user!;
  const userId = user.id;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  try {
    const { emailAtual, emailNovo, senhaAtual, senhaNova } = req.body;

    // Validação básica
    if (!senhaAtual || !senhaNova) {
      return res.status(400).json({ error: "Senha atual e nova são obrigatórias." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, existingUser.password);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    //  atualização
    const updateData: Partial<{ email: string; password: string }> = {
      password: await bcrypt.hash(senhaNova, 10),
    };

    if (emailNovo && emailNovo !== existingUser.email) {
      // e-mails duplicados
      const emailExistente = await prisma.user.findUnique({ where: { email: emailNovo } });
      if (emailExistente) {
        return res.status(400).json({ error: "Este e-mail já está em uso." });
      }
      updateData.email = emailNovo;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return res.status(200).json({ message: "Credenciais atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar credenciais:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar credenciais." });
  }
}

export default authorize(handler, "CORRETOR");
