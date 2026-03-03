import type { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import formidable from "formidable";
import path from "path";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

type MaybeFilepath = { filepath?: string; path?: string; mimetype?: string; originalFilename?: string };

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  const form = formidable({
    keepExtensions: true,
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  });

  const { fields, files } = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const imovelId = Array.isArray(fields.imovelId) ? fields.imovelId[0] : fields.imovelId;
  if (!imovelId) {
    return res.status(400).json({ message: "ID do imóvel é obrigatório." });
  }

  const fotosArray: formidable.File[] = Array.isArray(files.fotos)
    ? (files.fotos as formidable.File[])
    : files.fotos
      ? [files.fotos as formidable.File]
      : [];

  try {
    const fotosData = await Promise.all(
      fotosArray.map(async (file, index) => {
        const f = file as unknown as MaybeFilepath;
        const filePath = f.filepath ?? f.path;
        if (!filePath) {
          throw new Error("Caminho do arquivo indefinido");
        }

        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(f.originalFilename ?? filePath);
        const storagePath = `${imovelId}/${Date.now()}-${index}${ext}`;
        const contentType = f.mimetype ?? "image/jpeg";

        const { error } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, buffer, { contentType, upsert: false });

        if (error) {
          throw new Error(`Erro ao enviar imagem para Supabase: ${error.message}`);
        }

        const { data: urlData } = supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        // Limpa o arquivo temporário do disco
        fs.unlinkSync(filePath);

        return {
          url: urlData.publicUrl,
          ordem: index + 1,
          imovelId: String(imovelId),
        };
      })
    );

    await prisma.foto.createMany({ data: fotosData });

    return res.status(200).json({ message: "Fotos enviadas com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar fotos:", error);
    return res.status(500).json({ message: "Erro ao salvar fotos.", error: String(error) });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return authorize(handlePost, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido" });
}
