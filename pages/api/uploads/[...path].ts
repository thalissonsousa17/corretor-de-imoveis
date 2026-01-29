import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;

  const fileName = Array.isArray(pathArray) ? pathArray[pathArray.length - 1] : pathArray;

  if (!fileName || typeof fileName !== "string") {
    return res.status(400).end();
  }

  const safeName = path.basename(fileName);

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

  const filePath = path.join(uploadDir, safeName);

  if (!fs.existsSync(filePath)) {
    console.error("Imagem não encontrada:", filePath);
    return res.status(404).end();
  }

  const ext = path.extname(safeName).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => res.status(500).end());
  stream.pipe(res);
}
