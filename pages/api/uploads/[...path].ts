import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".jfif": "image/jpeg",
  ".svg": "image/svg+xml",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;

  const fileName = Array.isArray(pathArray) ? pathArray[pathArray.length - 1] : pathArray;

  console.log("[API Uploads] Requisitando arquivo:", fileName);

  if (!fileName || typeof fileName !== "string") {
    console.error("[API Uploads] Nome de arquivo inválido ou ausente.");
    return res.status(400).end();
  }

  const safeName = path.basename(fileName);
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, safeName);

  console.log("[API Uploads] Buscando em:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("[API Uploads] Arquivo não encontrado fisicamente:", filePath);
    return res.status(404).end();
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  console.log("[API Uploads] Servindo arquivo com Content-Type:", contentType);

  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("[API Uploads] Erro no stream:", err);
    res.status(500).end();
  });
  stream.pipe(res);
}
