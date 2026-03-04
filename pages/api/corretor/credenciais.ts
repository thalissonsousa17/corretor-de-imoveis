import type { NextApiResponse } from "next";
import type { AuthApiRequest } from "../../../lib/authMiddleware";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabase";
import { authorize } from "../../../lib/authMiddleware";

export const config = {
  api: { bodyParser: true },
};

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user!.id;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  try {
    const { emailNovo, senhaAtual, senhaNova } = req.body;

    if (!senhaAtual || !senhaNova) {
      return res.status(400).json({ error: "Senha atual e nova são obrigatórias." });
    }

    const { data: existingUser } = await supabaseAdmin
      .from("User")
      .select("id,email,password")
      .eq("id", userId)
      .maybeSingle();

    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, existingUser.password);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    const updateData: Partial<{ email: string; password: string }> = {
      password: await bcrypt.hash(senhaNova, 10),
    };

    if (emailNovo && emailNovo !== existingUser.email) {
      const { data: emailExistente } = await supabaseAdmin
        .from("User")
        .select("id")
        .eq("email", emailNovo)
        .maybeSingle();
      if (emailExistente) {
        return res.status(400).json({ error: "Este e-mail já está em uso." });
      }
      updateData.email = emailNovo;
    }

    await supabaseAdmin.from("User").update(updateData).eq("id", userId);

    return res.status(200).json({ message: "Credenciais atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar credenciais:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar credenciais." });
  }
}

export default authorize(handler, "CORRETOR");
