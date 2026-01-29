import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;

  // Pega o nome do arquivo (ex: "foto.jpg")
  const fileName = Array.isArray(pathArray) ? pathArray.pop() : pathArray;

  if (!fileName) return res.status(400).end();

  // ATENÇÃO: Verifique se este caminho no Linux está 100% correto
  const uploadDir = "/projects/corretor-de-imoveis/public/uploads";
  const filePath = path.join(uploadDir, fileName);

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);

    // Identifica o tipo para o navegador não baixar o arquivo em vez de exibir
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache para ficar rápido
    return res.send(fileBuffer);
  }

  // LOG PARA VOCÊ VER NO TERMINAL O QUE ESTÁ ERRADO
  console.error("ERRO: Arquivo não existe em:", filePath);
  return res.status(404).json({ error: "Imagem não encontrada" });
}
