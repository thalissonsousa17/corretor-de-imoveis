import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;

  // Caminho absoluto que vimos no seu terminal
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const fileName = Array.isArray(pathArray) ? pathArray.join("/") : pathArray;
  const filePath = path.join(uploadDir, fileName || "");

  if (!fs.existsSync(filePath)) {
    // Log para você ver no 'pm2 logs' onde ele está tentando buscar a foto
    console.error(`Arquivo não encontrado no disco: ${filePath}`);
    return res.status(404).json({ error: "Arquivo não encontrado" });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store, max-age=0"); // Desativa cache para teste

  const imageBuffer = fs.readFileSync(filePath);
  return res.send(imageBuffer);
}
