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

/*    HELPERS */
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  let clean = url.replace(/\\/g, "/");
  if (!clean.startsWith("/")) clean = "/" + clean;
  return clean;
}

async function filtrarFotosValidas(fotos: Foto[]): Promise<Foto[]> {
  // O banco de dados agora é o dono da verdade.
  // Retornamos todas as fotos sem validar o arquivo físico para evitar o erro 404 falso na VPS.
  return fotos;
}

/*    DELETE */
const handleDelete = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido." });
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
          const name = (foto.url || "")
            .replace(/\\/g, "/")
            .replace(/^\/+/, "")
            .replace(/^uploads\//, "");

          await fs.unlink(path.join(uploadDir, name));
        } catch (error) {
          console.error(`Erro ao deletar arquivo de foto:`, error);
          console.log(`Tentado deletar: ${path.join(uploadDir, foto.url || "")}`);
        }
      })
    );

    await prisma.foto.deleteMany({ where: { imovelId: id } });
    await prisma.imovel.delete({ where: { id } });

    res.status(204).end();
    return;
  } catch (error) {
    console.error("Erro DELETE:", error);
    return res.status(500).json({ message: "Erro ao deletar imóvel." });
  }
};

/*    PUT (ATUALIZAR IMÓVEL + FOTOS) */
const handlePut = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido." });
  }

  try {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
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

    const imovelExistente = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: true },
    });

    if (!imovelExistente) return res.status(404).json({ message: "Imóvel não encontrado." });

    if (imovelExistente.corretorId !== req.user!.id)
      return res.status(403).json({ message: "Acesso negado." });

    /* ===== DADOS ===== */
    const data: Partial<Imovel> = {};

    if (fields.titulo) data.titulo = String(fields.titulo);
    if (fields.descricao) data.descricao = String(fields.descricao);
    if (fields.tipo) data.tipo = String(fields.tipo);
    if (fields.localizacao) data.localizacao = String(fields.localizacao);
    if (fields.cidade) data.cidade = String(fields.cidade);
    if (fields.estado) data.estado = String(fields.estado);
    if (fields.bairro) data.bairro = String(fields.bairro);
    if (fields.rua) data.rua = String(fields.rua);
    if (fields.numero) data.numero = String(fields.numero);
    if (fields.cep) data.cep = String(fields.cep);

    if (fields.preco) {
      const preco = parseFloat(String(fields.preco));
      if (!isNaN(preco)) data.preco = preco;
    }

    /* ===== REMOVER FOTOS ===== */
    let fotosRemoverIds: string[] = [];
    if (fields.fotosRemover) {
      try {
        fotosRemoverIds = JSON.parse(String(fields.fotosRemover));
      } catch {}
    }

    const uploadDir = "/projects/corretor-de-imoveis/public/uploads";
    await fs.mkdir(uploadDir, { recursive: true });

    if (fotosRemoverIds.length > 0) {
      const fotosParaExcluir = imovelExistente.fotos.filter((f) => fotosRemoverIds.includes(f.id));

      await Promise.all(
        fotosParaExcluir.map(async (foto) => {
          try {
            // Extrai apenas o nome do arquivo final
            const fileName = path.basename(foto.url);
            const filePath = path.join(uploadDir, fileName);

            await fs.unlink(filePath);
          } catch (e) {
            // Este erro é esperado para as fotos que você já deletou via terminal (rm)
            console.error(`Aviso: Arquivo já não existia no disco: ${foto.url}`);
          }
        })
      );

      await prisma.foto.deleteMany({
        where: { id: { in: fotosRemoverIds } },
      });
    }

    /* ===== ADICIONAR FOTOS ===== */
    const fotosFiles: UploadedFile[] = Array.isArray(files?.fotos)
      ? (files.fotos as UploadedFile[])
      : files?.fotos
        ? [files.fotos as UploadedFile]
        : [];

    /* ===== ADICIONAR FOTOS (VERSÃO CORRIGIDA) ===== */
    if (fotosFiles.length > 0) {
      const ultimaFoto = await prisma.foto.findFirst({
        where: { imovelId: id },
        orderBy: { ordem: "desc" },
        select: { ordem: true },
      });

      const ordemBase = ultimaFoto?.ordem ?? 0;
      const fotosData = [];

      for (let index = 0; index < fotosFiles.length; index++) {
        const file = fotosFiles[index];
        const tempPath = file.filepath ?? file.path;
        if (!tempPath) continue;

        // Forçamos a extensão correta e limpamos sufixos estranhos
        const originalExt = path.extname(file.originalFilename || "").toLowerCase() || ".jpg";
        const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${originalExt}`;
        const finalPath = path.join(uploadDir, fileName);

        try {
          await fs.rename(tempPath, finalPath);

          fotosData.push({
            url: `/uploads/${fileName}`,
            ordem: ordemBase + index + 1,
            imovelId: id,
          });
        } catch (moveError) {
          console.error("Erro ao mover arquivo:", moveError);
        }
      }

      if (fotosData.length > 0) {
        await prisma.foto.createMany({ data: fotosData });
      }
    }

    /* ===== ATUALIZAR IMÓVEL ===== */
    await prisma.imovel.update({
      where: { id },
      data,
    });

    const imovelAtualizado = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: { orderBy: { ordem: "asc" } } },
    });

    if (!imovelAtualizado)
      return res.status(404).json({ message: "Imóvel não encontrado após atualização." });

    const fotosValidas = await filtrarFotosValidas(imovelAtualizado.fotos);

    return res.status(200).json({
      ...imovelAtualizado,
      fotos: fotosValidas.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    });
  } catch (error) {
    console.error("Erro PUT:", error);
    return res.status(500).json({ message: "Erro ao atualizar imóvel." });
  }
};

/* GET */
const handleGetById = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido." });

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado." });

  const fotosValidas = await filtrarFotosValidas(imovel.fotos);

  return res.status(200).json({
    ...imovel,
    fotos: fotosValidas.map((f) => ({ ...f, url: normalizeUrl(f.url) })),
  });
};

/*  PATCH (STATUS) */
const handlePatch = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) return res.status(400).json({ message: "Dados inválidos." });

  const updated = await prisma.imovel.update({
    where: { id: String(id) },
    data: { status: status as ImovelStatus },
    include: { fotos: true },
  });

  const fotosValidas = await filtrarFotosValidas(updated.fotos);

  return res.status(200).json({
    ...updated,
    fotos: fotosValidas.map((f) => ({ ...f, url: normalizeUrl(f.url) })),
  });
};

/*    HANDLER */
export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") return authorize(handleDelete, "CORRETOR")(req, res);
  if (req.method === "PUT") return authorize(handlePut, "CORRETOR")(req, res);
  if (req.method === "PATCH") return authorize(handlePatch, "CORRETOR")(req, res);
  if (req.method === "GET") return handleGetById(req, res);

  return res.status(405).json({ message: "Método não permitido." });
}
