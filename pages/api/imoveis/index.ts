import { NextApiRequest, NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import { supabaseAdmin } from "../../../lib/supabase";
import { uploadFotoToStorage } from "../../../lib/storageUtils";
import { randomUUID } from "node:crypto";
import formidable from "formidable";
import fs from "fs/promises";
import { LIMITE_IMOVEIS_POR_PLANO } from "@/lib/planos";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "100mb",
  },
};

const handleGet = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    const corretorId = req.user?.id;

    if (!corretorId) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const { data: imoveis, error } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("corretorId", corretorId)
      .order("createdAt", { ascending: false });

    if (error) throw new Error(error.message);

    return res.status(200).json(imoveis ?? []);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return res.status(500).json({ message: "Erro ao buscar imóveis." });
  }
};

const handlePost = async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
  const corretorId = req.user!.id;

  // ── Verificar limite do plano ──────────────────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("plano, planoStatus")
    .eq("userId", corretorId)
    .maybeSingle();

  const plano = (profile?.plano ?? "GRATUITO") as keyof typeof LIMITE_IMOVEIS_POR_PLANO;
  const limite = LIMITE_IMOVEIS_POR_PLANO[plano] ?? LIMITE_IMOVEIS_POR_PLANO.GRATUITO;

  if (limite !== Infinity) {
    const { count: totalImoveis } = await supabaseAdmin
      .from("Imovel")
      .select("*", { count: "exact", head: true })
      .eq("corretorId", corretorId);

    if ((totalImoveis ?? 0) >= limite) {
      return res.status(403).json({
        message: `Limite de ${limite} imóveis do plano ${plano} atingido. Faça upgrade para continuar.`,
        code: "PLANO_LIMITE_ATINGIDO",
      });
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  const form = formidable({
    uploadDir: "/tmp",
    keepExtensions: true,
    maxFiles: 20,
    maxFileSize: 15 * 1024 * 1024,
    maxTotalFileSize: 200 * 1024 * 1024,
    allowEmptyFiles: true,
    multiples: true,
  });

  const { fields, files } = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const getFieldValue = (field: string | string[] | undefined): string => {
    return Array.isArray(field) ? field[0] : (field ?? "");
  };

  const { titulo, descricao, preco, tipo, cidade, estado, localizacao, bairro, rua, numero, cep, finalidade } = fields;

  if (!titulo || !preco || !descricao) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  const finalidadeValue = getFieldValue(finalidade)?.toUpperCase() ?? "VENDA";
  const finalidadeFinal = finalidadeValue === "ALUGUEL" ? "ALUGUEL" : "VENDA";
  const numericValor = parseFloat(getFieldValue(preco));

  try {
    const imovelId = randomUUID();

    const now = new Date().toISOString();

    const { data: novoImovel, error: imovelError } = await supabaseAdmin
      .from("Imovel")
      .insert({
        id: imovelId,
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
        localizacao: getFieldValue(localizacao),
        finalidade: finalidadeFinal,
        status: "DISPONIVEL",
        corretorId,
        createdAt: now,
        updatedAt: now,
        ...(getFieldValue(fields.quartos) ? { quartos: parseInt(getFieldValue(fields.quartos)) } : {}),
        ...(getFieldValue(fields.banheiros) ? { banheiros: parseInt(getFieldValue(fields.banheiros)) } : {}),
        ...(getFieldValue(fields.suites) ? { suites: parseInt(getFieldValue(fields.suites)) } : {}),
        ...(getFieldValue(fields.vagas) ? { vagas: parseInt(getFieldValue(fields.vagas)) } : {}),
        ...(getFieldValue(fields.areaTotal) ? { areaTotal: parseFloat(getFieldValue(fields.areaTotal)) } : {}),
        ...(getFieldValue(fields.areaUtil) ? { areaUtil: parseFloat(getFieldValue(fields.areaUtil)) } : {}),
        ...(getFieldValue(fields.condominio) ? { condominio: parseFloat(getFieldValue(fields.condominio)) } : {}),
        ...(getFieldValue(fields.iptu) ? { iptu: parseFloat(getFieldValue(fields.iptu)) } : {}),
        ...(getFieldValue(fields.anoConstrucao) ? { anoConstrucao: parseInt(getFieldValue(fields.anoConstrucao)) } : {}),
      })
      .select("*")
      .single();

    if (imovelError) throw new Error(imovelError.message);

    const photosArray = Array.isArray(files.fotos) ? files.fotos : files.fotos ? [files.fotos] : [];

    if (photosArray.length > 0) {
      const fotosData = await Promise.all(
        photosArray.map(async (file: formidable.File, index: number) => {
          const buffer = await fs.readFile(file.filepath);
          const url = await uploadFotoToStorage(buffer, file.originalFilename ?? "foto.jpg");
          await fs.unlink(file.filepath).catch(() => {});
          return {
            id: randomUUID(),
            url,
            ordem: index + 1,
            imovelId,
            principal: index === 0,
          };
        })
      );

      await supabaseAdmin.from("Foto").insert(fotosData);
    }

    return res.status(201).json({ message: "Imóvel cadastrado com sucesso!", imovel: novoImovel });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Erro POST /api/imoveis:", errMsg);
    return res.status(500).json({ message: "Erro ao salvar o imóvel no banco de dados.", detail: errMsg });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return authorize(handleGet, "CORRETOR")(req, res);
  }

  if (req.method === "POST") {
    return authorize(handlePost, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido." });
}
