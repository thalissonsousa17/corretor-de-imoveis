import type { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import fs from "fs/promises";
import path from "path";
import type { Imovel, Foto, ImovelStatus } from "@prisma/client";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadedFile = formidable.File & {
  filepath?: string;
  path?: string;
};

interface UpdateImovelInput {
  titulo?: string;
  descricao?: string;
  preco?: string | number;
  tipo?: string;
  localizacao?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  fotosRemover?: string;
  status?: ImovelStatus | string;
}

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  let clean = url.replace(/\\/g, "/");
  if (!clean.startsWith("/")) clean = "/" + clean;
  return clean;
}

/* =========================
   DELETE
========================= */
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

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await Promise.all(
      imovel.fotos.map(async (foto: Foto) => {
        const filePath = path.join(uploadDir, foto.url.replace("/uploads/", ""));
        try {
          await fs.unlink(filePath);
        } catch {}
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

/* =========================
   PUT
========================= */
const handlePut = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const form = formidable({
      multiples: true,
      uploadDir: path.join(process.cwd(), "public/uploads"),
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

    if (!imovelExistente) {
      res.status(404).json({ message: "Imóvel não encontrado." });
      return;
    }

    if (imovelExistente.corretorId !== req.user!.id) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

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

    if (fotosRemoverIds.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");

      const fotosParaExcluir = imovelExistente.fotos.filter((f) => fotosRemoverIds.includes(f.id));

      await Promise.all(
        fotosParaExcluir.map(async (foto) => {
          const filePath = path.join(uploadDir, foto.url.replace("/uploads/", ""));
          try {
            await fs.unlink(filePath);
          } catch {}
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

    if (fotosFiles.length > 0) {
      const ultimaFoto = await prisma.foto.findFirst({
        where: { imovelId: id },
        orderBy: { ordem: "desc" },
        select: { ordem: true },
      });

      const ordemBase = ultimaFoto?.ordem ?? 0;

      await prisma.foto.createMany({
        data: fotosFiles.map((file, index) => {
          const filePath = file.filepath ?? file.path;
          if (!filePath) throw new Error("Arquivo sem caminho válido");

          return {
            url: `/uploads/${path.basename(filePath)}`,
            ordem: ordemBase + index + 1,
            imovelId: id,
          };
        }),
      });
    }

    await prisma.imovel.update({ where: { id }, data });

    const imovelAtualizado = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: { orderBy: { ordem: "asc" } } },
    });

    if (!imovelAtualizado) {
      res.status(404).json({ message: "Imóvel não encontrado após atualização." });
      return;
    }

    res.status(200).json({
      ...imovelAtualizado,
      fotos: imovelAtualizado.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    });
  } catch (error) {
    console.error("Erro PUT:", error);
    res.status(500).json({ message: "Erro ao atualizar imóvel." });
  }
};

/* =========================
   GET / PATCH
========================= */
const handleGetById = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido." });

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado." });

  res.status(200).json({
    ...imovel,
    fotos: imovel.fotos.map((f) => ({ ...f, url: normalizeUrl(f.url) })),
  });
};

const handlePatch = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) return res.status(400).json({ message: "Dados inválidos." });

  const updated = await prisma.imovel.update({
    where: { id: String(id) },
    data: { status: status as ImovelStatus },
    include: { fotos: true },
  });

  res.status(200).json({
    ...updated,
    fotos: updated.fotos.map((f) => ({ ...f, url: normalizeUrl(f.url) })),
  });
};

export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") return authorize(handleDelete, "CORRETOR")(req, res);
  if (req.method === "PUT") return authorize(handlePut, "CORRETOR")(req, res);
  if (req.method === "PATCH") return authorize(handlePatch, "CORRETOR")(req, res);
  if (req.method === "GET") return handleGetById(req, res);

  res.status(405).json({ message: "Método não permitido." });
}
