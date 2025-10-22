// pages/api/imoveis/fotos/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      // Busca a foto no banco
      const foto = await prisma.foto.findUnique({ where: { id: String(id) } });

      if (!foto) {
        return res.status(404).json({ error: "Foto não encontrada" });
      }

      // Exclui o arquivo físico (se existir)
      if (foto.url && foto.url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", foto.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Exclui do banco
      await prisma.foto.delete({ where: { id: String(id) } });

      return res.status(200).json({ message: "Foto excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      return res.status(500).json({ error: "Erro ao excluir foto" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
