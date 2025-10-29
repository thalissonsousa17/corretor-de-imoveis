import type { NextApiResponse } from "next";
import type { AuthApiRequest } from "../../../lib/authMiddleware";
import { authorize } from "../../../lib/authMiddleware";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  // Permitir apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const userId = req.user?.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    // Busca usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verifica senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, user.password);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    // Criptografa nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza no banco
    await prisma.user.update({
      where: { id: userId },
      data: { password: novaSenhaHash },
    });

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ error: "Erro interno ao alterar senha." });
  }
}, "CORRETOR");
