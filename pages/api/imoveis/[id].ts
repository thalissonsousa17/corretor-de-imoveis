import type { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import fs from "fs/promises";
import path from "path";
import type { Imovel, Foto, ImovelStatus } from "@prisma/client";
import formidable from "formidable";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadedFile = formidable.File & {
  filepath?: string;
  path?: string;
};

/* --- HELPERS LOCAIS --- */
const formatarFotosParaResposta = (fotos: Foto[]) => {
  return fotos.map((f) => {
    const fileName = f.url.split(/[\\/]/).pop();
    return {
      ...f,
      url: `/api/uploads/${fileName}`,
    };
  });
};

/* --- DELETE --- */
const handleDelete = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: true },
    });

    if (!imovel) {
      res.status(404).json({ message: "Imóvel não encontrado." });
      return;
    }

    if (imovel.corretorId !== req.user!.id) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

    const uploadDir = "/projects/corretor-de-imoveis/public/uploads";

    await Promise.all(
      imovel.fotos.map(async (foto) => {
        try {
          const name = path.basename(foto.url);
          await fs.unlink(path.join(uploadDir, name));
        } catch (error) {
          console.error(`Erro ao deletar arquivo físico:`, error);
        }
      })
    );

    await prisma.foto.deleteMany({ where: { imovelId: id } });
    await prisma.imovel.delete({ where: { id } });

    res.status(204).end();
  } catch (error) {
    console.error("Erro DELETE:", error);
    res.status(500).json({ message: "Erro ao deletar imóvel." });
  }
};

/* --- PUT --- */
const handlePut = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const form = formidable({ multiples: true, keepExtensions: true });
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const imovelExistente = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: true },
    });

    if (!imovelExistente) {
      res.status(404).json({ message: "Imóvel não encontrado." });
      return;
    }

    const data: Partial<Imovel> = {};
    if (fields.titulo) data.titulo = String(fields.titulo);
    if (fields.descricao) data.descricao = String(fields.descricao);
    if (fields.tipo) data.tipo = String(fields.tipo);
    if (fields.localizacao) data.localizacao = String(fields.localizacao);
    if (fields.preco) data.preco = parseFloat(String(fields.preco));

    const uploadDir = "/projects/corretor-de-imoveis/public/uploads";
    await fs.mkdir(uploadDir, { recursive: true });

    if (fields.fotosRemover) {
      const fotosRemoverIds = JSON.parse(String(fields.fotosRemover));
      const fotosParaExcluir = imovelExistente.fotos.filter((f) => fotosRemoverIds.includes(f.id));

      await Promise.all(
        fotosParaExcluir.map(async (foto) => {
          try {
            await fs.unlink(path.join(uploadDir, path.basename(foto.url)));
          } catch (e) {
            /* ignore */
          }
        })
      );
      await prisma.foto.deleteMany({ where: { id: { in: fotosRemoverIds } } });
    }

    const fotosFiles: UploadedFile[] = Array.isArray(files?.fotos)
      ? (files.fotos as UploadedFile[])
      : files?.fotos
        ? [files.fotos as UploadedFile]
        : [];

    if (fotosFiles.length > 0) {
      const ultimaFoto = await prisma.foto.findFirst({
        where: { imovelId: id },
        orderBy: { ordem: "desc" },
      });
      let ordemBase = ultimaFoto?.ordem ?? -1;

      for (const file of fotosFiles) {
        const tempPath = file.filepath ?? file.path;
        if (!tempPath) continue;
        const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${path.extname(file.originalFilename || "").toLowerCase()}`;
        await fs.rename(tempPath, path.join(uploadDir, fileName));
        await prisma.foto.create({
          data: { url: `/uploads/${fileName}`, ordem: ++ordemBase, imovelId: id },
        });
      }
    }

    const updated = await prisma.imovel.update({
      where: { id },
      data,
      include: { fotos: { orderBy: { ordem: "asc" } } },
    });

    res.status(200).json({
      ...updated,
      fotos: formatarFotosParaResposta(updated.fotos),
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar." });
  }
};

/* --- GET --- */
const handleGetById = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;
  const imovel = await prisma.imovel.findUnique({
    where: { id: String(id) },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  if (!imovel) {
    res.status(404).json({ message: "Não encontrado." });
    return;
  }

  res.status(200).json({
    ...imovel,
    fotos: formatarFotosParaResposta(imovel.fotos),
  });
};

/* --- PATCH --- */
const handlePatch = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;
  const { status } = req.body;

  const updated = await prisma.imovel.update({
    where: { id: String(id) },
    data: { status: status as ImovelStatus },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  res.status(200).json({
    ...updated,
    fotos: formatarFotosParaResposta(updated.fotos),
  });
};

/* --- HANDLER PRINCIPAL --- */
export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "DELETE":
      return authorize(handleDelete, "CORRETOR")(req, res);
    case "PUT":
      return authorize(handlePut, "CORRETOR")(req, res);
    case "PATCH":
      return authorize(handlePatch, "CORRETOR")(req, res);
    case "GET":
      return handleGetById(req, res);
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
      res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
