import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  const corretorId = { Id: req.user!.id };

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(uploadDir, { recursive: true });
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req);

    const { titulo, descricao, preco, tipo, localizacao } = fields;

    if (!titulo?.[0] || !preco?.[0] || !tipo?.[0]) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes." });
    }
    const novoImovel = await prisma.imovel.create({
      data: {
        titulo: titulo[0],
        descricao: descricao?.[0],
        preco: parseFloat(preco[0]),
        tipo: tipo[0],
        localizacao: localizacao?.[0],
        corretorId: corretorId,
        disponivel: true,
      },
    });

    const fotos = files.fotos;
    const fotosArray = Array.isArray(fotos) ? fotos : fotos ? [fotos] : [];

    const fotosRecords = [];
    for (let i = 0; i < fotosArray.length; i++) {
      const file = fotosArray[i];

      const relativepath = `/uploads/${path.basename(file.filepath)}`;

      const foto = await prisma.foto.create({
        data: {
          url: relativepath,
          imovelId: novoImovel.id,
          principal: i === 0,
          ordem: i,
        },
      });
      fotosRecords.push(foto);
    }
    return res.status(201).json({ ...novoImovel, fotos: fotosRecords });
  } catch (error) {
    console.error("Erro no upload ou criação do imóvel:", error);
    return res.status(500).json({
      message: "Erro interno no servidor durante o processamento do arquivo. ",
    });
  }
};

const handleGet = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: { disponivel: true },
      select: {
        id: true,
        titulo: true,
        preco: true,
        corretor: {
          select: { name: true },
        },
        fotos: {
          select: {
            url: true,
            principal: true,
            ordem: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });
    return res.status(200).json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export default async function handleImoveis(
  req: AuthApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return authorize(handlePost, "CORRETOR")(req, res);
  }
  if (req.method === "GET") {
    return handleGet(req, res);
  }
  return res.status(405).json({ message: "Método não permitido" });
}
