import type { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import path from "path";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

type MaybeFilepath = { filepath?: string; path?: string };

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
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
    const fotosData = fotosArray.map((file, index) => {
      const f = file as unknown as MaybeFilepath;
      const filePath = f.filepath ?? f.path;
      if (!filePath) {
        throw new Error("Caminho do arquivo indefinido");
      }

      return {
        url: `/uploads/${path.basename(filePath)}`,
        ordem: index + 1,
        imovelId: String(imovelId),
      };
    });

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
