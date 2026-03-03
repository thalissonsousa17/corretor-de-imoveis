import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { supabaseAdmin, STORAGE_BUCKET } from "../../../lib/supabase";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const foto = await prisma.foto.findUnique({ where: { id: String(id) } });

      if (!foto) {
        return res.status(404).json({ error: "Foto não encontrada" });
      }

      if (foto.url) {
        if (foto.url.startsWith("https://") && foto.url.includes(".supabase.co/storage/")) {
          // Extrai o path dentro do bucket a partir da URL pública do Supabase
          // Formato: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
          const marker = `/object/public/${STORAGE_BUCKET}/`;
          const idx = foto.url.indexOf(marker);
          if (idx !== -1) {
            const storagePath = foto.url.substring(idx + marker.length);
            await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
          }
        } else if (foto.url.startsWith("/uploads/")) {
          // Compatibilidade com fotos antigas armazenadas localmente
          const filePath = path.join(process.cwd(), "public", foto.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      await prisma.foto.delete({ where: { id: String(id) } });

      return res.status(200).json({ message: "Foto excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      return res.status(500).json({ error: "Erro ao excluir foto" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
