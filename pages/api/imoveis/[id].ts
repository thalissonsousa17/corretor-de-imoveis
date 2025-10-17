import type { NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Use o caminho relativo corrigido
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import fs from "fs/promises";
import path from "path";
import { select } from "@material-tailwind/react";

// ----------------------------------------------------------------------------------
// Handler para DELEÇÃO (DELETE) - ROTA PROTEGIDA
// ----------------------------------------------------------------------------------
const handleDelete = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query; // Pega o ID do imóvel da URL (id)

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID do imóvel inválido." });
  }

  try {
    // 1. Verifica se o imóvel existe e se o corretor logado é o dono
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: { fotos: true }, // Inclui fotos para exclusão
    });

    if (!imovel) {
      return res.status(404).json({ message: "Imóvel não encontrado." });
    }

    if (imovel.corretorId !== req.user!.id) {
      return res.status(403).json({
        message: "Acesso negado. Você não é o corretor responsável por este imóvel.",
      });
    }

    // 2. Exclui os arquivos físicos das fotos
    const uploadDir = path.join(process.cwd(), "public");
    const deletePromises = imovel.fotos.map((foto: { url: string }) => {
      const filePath = path.join(uploadDir, foto.url);
      // Remove o arquivo, ignorando erros se o arquivo já não existir
      return fs
        .unlink(filePath)
        .catch((err) => console.warn(`Falha ao deletar arquivo: ${filePath}`, err.message));
    });
    await Promise.all(deletePromises);

    // 3. Deleta o Imóvel (e as Fotos em cascata, se configurado no banco, mas fazemos manualmente para garantir)
    // Se você não configurou a exclusão em cascata, você precisará deletar as Fotos primeiro:
    await prisma.foto.deleteMany({ where: { imovelId: id } });
    await prisma.imovel.delete({ where: { id } });

    res.status(204).end(); // 204 No Content para deleção bem-sucedida
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    return res.status(500).json({ message: "Erro interno ao deletar imóvel." });
  }
};

// Handler para ATUALIZAÇÃO (PUT) - ROTA PROTEGIDA

const handlePut = async (req: AuthApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query;
  const { titulo, descricao, preco, tipo, localizacao, disponivel } = req.body;

  // pages/api/imoveis/[id].ts (Dentro do handlePut ou crie um handlePatch)

  if (req.method === "PATCH") {
    const { id } = req.query;
    const { disponivel } = req.body; // Recebe o novo status (true/false)

    try {
      const updatedImovel = await prisma.imovel.update({
        where: { id: String(id) },
        data: { disponivel: Boolean(disponivel) },
      });
      return res.status(200).json({
        message: `Status atualizado para ${updatedImovel.disponivel ? "Disponível" : "Indisponível"}`,
        imovel: updatedImovel,
      });
    } catch (error) {
      // ... (erro)
    }
  }

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID do imóvel inválido." });
  }

  try {
    // 1. Verifica se o corretor logado é o dono
    const imovel = await prisma.imovel.findUnique({ where: { id } });

    if (!imovel) {
      return res.status(404).json({ message: "Imóvel não encontrado." });
    }

    if (imovel.corretorId !== req.user!.id) {
      return res.status(403).json({
        message: "Acesso negado. Você não tem permissão para atualizar este imóvel.",
      });
    }

    // 2. Cria o objeto de dados para atualização (apenas campos que vieram na requisição)
    interface ImovelUpdateData {
      titulo?: string;
      descricao?: string;
      preco?: number;
      tipo?: string;
      localizacao?: string;
      disponivel?: boolean;
    }
    const data: ImovelUpdateData = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (descricao !== undefined) data.descricao = descricao;
    if (preco !== undefined) data.preco = parseFloat(preco);
    if (tipo !== undefined) data.tipo = tipo;
    if (localizacao !== undefined) data.localizacao = localizacao;
    if (disponivel !== undefined) data.disponivel = disponivel;

    const imovelAtualizado = await prisma.imovel.update({
      where: { id },
      data: data,
    });

    return res.status(200).json(imovelAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar imóvel." });
  }
};

// Função Principal que Roteia as Requisições

export default async function handleImovelById(req: AuthApiRequest, res: NextApiResponse) {
  // O PUT e o DELETE são protegidos e requerem a role 'CORRETOR'
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { status } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "ID do Imóvel Inválido." });
    }

    try {
      const imovelAtualizado = await prisma.imovel.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json(imovelAtualizado);
    } catch (error) {
      console.error("Error ao atualizar status:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar status." });
    }
  }

  //Put - Atualização geral (rota protegida)

  if (req.method === "PUT") {
    return authorize(handlePut, "CORRETOR")(req, res);
  }

  if (req.method === "DELETE") {
    return authorize(handleDelete, "CORRETOR")(req, res);
  }

  // O GET - Busca imóvel especifico
  if (req.method === "GET") {
    const handleGetById = async (req: AuthApiRequest, res: NextApiResponse) => {
      const { id } = req.query;

      if (typeof id !== "string") {
        return res.status(400).json({ message: "ID do imóvel inválido." });
      }

      try {
        const imovel = await prisma.imovel.findUnique({
          where: { id },
          include: {
            corretor: {
              select: {
                name: true,
                email: true,
              },
            },
            fotos: {
              orderBy: { ordem: "asc" },
            },
          },
        });

        if (!imovel) {
          return res.status(404).json({ message: "Imóvel não encontrado ou não disponível." });
        }
        return res.status(200).json(imovel);
      } catch (error) {
        console.error("Erro ao buscar imóvel:", error);
        return res.status(500).json({ message: "Erro interno ao buscar imóvel." });
      }
    };

    return handleGetById(req, res);
  }
  return res.status(405).json({ message: "Método não permitido." });
}
