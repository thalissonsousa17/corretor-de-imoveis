import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;

  // Caminho absoluto onde as fotos são salvas na sua VPS
  const uploadDir = "/projects/corretor-de-imoveis/public/uploads";
  const fileName = Array.isArray(pathArray) ? pathArray.join("/") : pathArray;
  const filePath = path.join(uploadDir, fileName || "");

  // 1. Verifica se o arquivo existe fisicamente AGORA no disco
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Arquivo não encontrado no servidor" });
  }

  // 2. Identifica o tipo de imagem (jpeg, png, etc)
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  // 3. Define os headers para o navegador entender que é uma imagem
  res.setHeader("Content-Type", contentType);
  // Cache curto de 1 hora para não pesar o servidor, mas permitir atualizações
  res.setHeader("Cache-Control", "public, max-age=3600");

  // 4. Lê o arquivo e envia o "buffer" direto para o front-end
  const imageBuffer = fs.readFileSync(filePath);
  return res.send(imageBuffer);
}
