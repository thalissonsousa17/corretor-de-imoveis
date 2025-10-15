// pages/api/imoveis/index.ts (APENAS o método POST)

import { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import prisma from "../../../lib/prisma";
import formidable from "formidable";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  const corretorId = req.user!.id; // ID do corretor logado

  // Configuração do Formidable para lidar com upload de arquivos
  const form = formidable({
    uploadDir: path.join(process.cwd(), "public", "uploads"),
    keepExtensions: true,
    maxFiles: 10, // Limite de 10 arquivos
    maxFileSize: 10 * 1024 * 1024, // 5MB por arquivo
  });

  const { fields, files } = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });

  const { titulo, descricao, preco, tipo, cidade, estado, localizacao, bairro, rua, numero, cep } =
    fields;

  if (!titulo || !preco || !descricao || !cidade) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  const getFieldValue = (field: string | string[] | undefined): string => {
    return Array.isArray(field) ? field[0] : (field ?? "");
  };
  const numericValor = parseFloat(getFieldValue(preco));

  // const precoValue = Array.isArray(preco) ? preco[0] : preco;
  // const numericValor = parseFloat(precoValue ?? "0");

  try {
    const novoImovel = await prisma.imovel.create({
      data: {
        titulo: getFieldValue(titulo),
        descricao: getFieldValue(descricao),
        preco: isNaN(numericValor) ? 0 : numericValor,
        tipo: getFieldValue(tipo) || "CASA",
        cidade: getFieldValue(cidade),
        estado: getFieldValue(estado) || "PB",
        bairro: getFieldValue(bairro),
        rua: getFieldValue(rua),
        numero: getFieldValue(numero),
        cep: getFieldValue(cep),
        // Garantia de que localizacao é string
        localizacao: getFieldValue(localizacao),
        disponivel: getFieldValue(fields.disponivel) === "true",
        corretorId: corretorId,

        fotos: {
          create: [], // Inicialmente vazio, será preenchido depois
        },
      },
    });

    const photosArray = Array.isArray(files.fotos) ? files.fotos : files.fotos ? [files.fotos] : [];

    if (photosArray.length > 0) {
      const photoData = photosArray.map((file: formidable.File, index: number) => ({
        url: `/uploads/${path.basename(file.filepath)}`, // URL pública
        ordem: index + 1,
        imovelId: novoImovel.id,
      }));

      await prisma.foto.createMany({ data: photoData });
    }

    return res.status(201).json({ message: "Imóvel cadastrado com sucesso!", imovel: novoImovel });
  } catch (dbError) {
    console.error("Erro ao salvar no BD:", dbError);
    return res.status(500).json({ message: "Erro ao salvar o imóvel no banco de dados." });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return authorize(handlePost, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido." });
}
