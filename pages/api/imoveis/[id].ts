import type { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import fs from "fs/promises";
import path from "path";
import type { Imovel, Foto } from "@prisma/client";
import type { ImovelStatus } from "@prisma/client";

import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
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
        } catch {
          console.warn("Falha ao excluir:", filePath);
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

const handlePut = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const form = formidable({ multiples: true });

    const { fields } = await new Promise<{
      fields: formidable.Fields;
    }>((resolve, reject) => {
      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else resolve({ fields });
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

    let fotosRemoverIds: string[] = [];

    if (fields.fotosRemover) {
      try {
        fotosRemoverIds = JSON.parse(String(fields.fotosRemover));
      } catch {
        console.warn("fotosRemover inválido");
      }
    }

    if (fotosRemoverIds.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");

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

    const atualizado = await prisma.imovel.update({
      where: { id },
      data,
      include: { fotos: true },
    });

    res.status(200).json({
      ...atualizado,
      fotos: atualizado.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    });
  } catch (error) {
    console.error("Erro PUT:", error);
    res.status(500).json({ message: "Erro ao atualizar imóvel." });
  }
};

const handleGetById = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        fotos: { orderBy: { ordem: "asc" } },
      },
    });

    if (!imovel) {
      res.status(404).json({ message: "Imóvel não encontrado." });
      return;
    }

    const perfil = await prisma.corretorProfile.findUnique({
      where: { userId: imovel.corretorId },
      include: { user: true },
    });

    if (!perfil) {
      res.status(404).json({ message: "Corretor não encontrado." });
      return;
    }

    res.status(200).json({
      ...imovel,
      fotos: imovel.fotos.map((f) => ({ ...f, url: normalizeUrl(f.url) })),
      corretor: {
        id: perfil.userId,
        name: perfil.user.name,
        email: perfil.user.email,
        creci: perfil.creci,
        avatarUrl: normalizeUrl(perfil.avatarUrl),
        bannerUrl: normalizeUrl(perfil.bannerUrl),
        logoUrl: normalizeUrl(perfil.logoUrl),
        biografia: perfil.biografia,
        instagram: perfil.instagram,
        facebook: perfil.facebook,
        linkedin: perfil.linkedin,
        whatsapp: perfil.whatsapp,
        slug: perfil.slug,
      },
    });
  } catch (error) {
    console.error("Erro GET:", error);
    res.status(500).json({ message: "Erro ao buscar imóvel." });
  }
};

const handlePatch = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { status } = req.body;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido." });
  }

  if (!status || !["DISPONIVEL", "VENDIDO", "ALUGADO", "INATIVO"].includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }

  try {
    const updated = await prisma.imovel.update({
      where: { id },
      data: { status: status as ImovelStatus },
      include: { fotos: true },
    });

    return res.status(200).json({
      ...updated,
      fotos: updated.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    });
  } catch (error) {
    console.error("Erro PATCH:", error);
    return res.status(500).json({ message: "Erro ao atualizar status." });
  }
};

export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") return authorize(handleDelete, "CORRETOR")(req, res);
  if (req.method === "PUT") return authorize(handlePut, "CORRETOR")(req, res);
  if (req.method === "PATCH") return authorize(handlePatch, "CORRETOR")(req, res);
  if (req.method === "GET") return handleGetById(req, res);

  res.status(405).json({ message: "Método não permitido." });
}
