import type { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import prisma from "@/lib/prisma";
import formidable from "formidable";
import path from "path";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

// tipo auxiliar que descreve apenas os campos que precisamos
type MaybeFilepath = { filepath?: string; path?: string };

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  // garante que a pasta exista
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

  // tipa fotosArray corretamente como File[] do formidable
  const fotosArray: formidable.File[] = Array.isArray(files.fotos)
    ? (files.fotos as formidable.File[])
    : files.fotos
      ? [files.fotos as formidable.File]
      : [];

  try {
    const fotosData = fotosArray.map((file, index) => {
      // cast seguro: primeiro para unknown, depois para o tipo mínimo que queremos
      const f = file as unknown as MaybeFilepath;
      const filePath = f.filepath ?? f.path;
      if (!filePath) {
        // caso raro: lança pra cair no catch e logar
        throw new Error("Caminho do arquivo indefinido");
      }

      return {
        url: `/uploads/${path.basename(filePath)}`,
        ordem: index + 1,
        imovelId: String(imovelId),
      };
    });

    console.log("💾 Salvando fotos no banco:", fotosData);
    await prisma.foto.createMany({ data: fotosData });
    console.log("📦 Campos recebidos:", fields);
    console.log("🖼️ FotosData:", fotosData);
    console.log("📦 imovelId recebido:", imovelId);

    return res.status(200).json({ message: "Fotos enviadas com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar fotos:", error);
    // envia mensagem com o erro (string) pra facilitar debug no frontend
    return res.status(500).json({ message: "Erro ao salvar fotos.", error: String(error) });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return authorize(handlePost, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido" });
}
