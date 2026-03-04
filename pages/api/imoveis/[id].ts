import type { NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabase";
import { uploadFotoToStorage, deleteFotoFromStorage } from "../../../lib/storageUtils";
import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import type { Imovel, ImovelStatus } from "@/lib/types";
import { resolveFotoUrl } from "../../../lib/imageUtils";
import { randomUUID } from "node:crypto";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadedFile = formidable.File & {
  filepath?: string;
  path?: string;
};

/* --- DELETE --- */
const handleDelete = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido." });

  try {
    const { data: imovel } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("id", id)
      .maybeSingle();

    if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado." });
    if (imovel.corretorId !== req.user!.id)
      return res.status(403).json({ message: "Acesso negado." });

    await Promise.all(
      (imovel.fotos ?? []).map((foto: any) => deleteFotoFromStorage(foto.url))
    );

    await supabaseAdmin.from("Foto").delete().eq("imovelId", id);
    await supabaseAdmin.from("Imovel").delete().eq("id", id);

    res.status(204).end();
  } catch (error) {
    console.error("Erro DELETE:", error);
    res.status(500).json({ message: "Erro ao deletar imóvel." });
  }
};

/* --- PUT --- */
const handlePut = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido." });

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

    const { data: imovelExistente } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("id", id)
      .maybeSingle();

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
    const extraData: Record<string, number | null> = {};
    if (fields.quartos !== undefined) extraData.quartos = fields.quartos ? parseInt(String(fields.quartos)) || null : null;
    if (fields.banheiros !== undefined) extraData.banheiros = fields.banheiros ? parseInt(String(fields.banheiros)) || null : null;
    if (fields.suites !== undefined) extraData.suites = fields.suites ? parseInt(String(fields.suites)) || null : null;
    if (fields.vagas !== undefined) extraData.vagas = fields.vagas ? parseInt(String(fields.vagas)) || null : null;
    if (fields.areaTotal !== undefined) extraData.areaTotal = fields.areaTotal ? parseFloat(String(fields.areaTotal)) || null : null;
    if (fields.areaUtil !== undefined) extraData.areaUtil = fields.areaUtil ? parseFloat(String(fields.areaUtil)) || null : null;
    if (fields.condominio !== undefined) extraData.condominio = fields.condominio ? parseFloat(String(fields.condominio)) || null : null;
    if (fields.iptu !== undefined) extraData.iptu = fields.iptu ? parseFloat(String(fields.iptu)) || null : null;
    if (fields.anoConstrucao !== undefined) extraData.anoConstrucao = fields.anoConstrucao ? parseInt(String(fields.anoConstrucao)) || null : null;
    Object.assign(data, extraData);

    /* ===== REMOVER FOTOS ===== */
    let fotosRemoverIds: string[] = [];
    if (fields.fotosRemover) {
      try {
        fotosRemoverIds = JSON.parse(String(fields.fotosRemover));
      } catch {}
    }

    if (fotosRemoverIds.length > 0) {
      const fotosParaExcluir = (imovelExistente.fotos ?? []).filter((f: any) =>
        fotosRemoverIds.includes(f.id)
      );
      await Promise.all(fotosParaExcluir.map((foto: any) => deleteFotoFromStorage(foto.url)));
      await supabaseAdmin.from("Foto").delete().in("id", fotosRemoverIds);
    }

    /* ===== ADICIONAR FOTOS ===== */
    const fotosFiles: UploadedFile[] = Array.isArray(files?.fotos)
      ? (files.fotos as UploadedFile[])
      : files?.fotos
        ? [files.fotos as UploadedFile]
        : [];

    if (fotosFiles.length > 0) {
      const { data: ultimaFoto } = await supabaseAdmin
        .from("Foto")
        .select("ordem")
        .eq("imovelId", id)
        .order("ordem", { ascending: false })
        .limit(1)
        .maybeSingle();

      const ordemBase = ultimaFoto?.ordem ?? 0;
      const fotosData = [];

      for (let index = 0; index < fotosFiles.length; index++) {
        const file = fotosFiles[index];
        const tempPath = file.filepath ?? (file as any).path;
        if (!tempPath) continue;

        try {
          const buffer = await fs.readFile(tempPath);
          const url = await uploadFotoToStorage(buffer, file.originalFilename ?? "foto.jpg");
          await fs.unlink(tempPath).catch(() => {});
          fotosData.push({
            id: randomUUID(),
            url,
            ordem: ordemBase + index + 1,
            imovelId: id,
            principal: false,
          });
        } catch (moveError) {
          console.error("Erro ao enviar foto:", moveError);
        }
      }

      if (fotosData.length > 0) {
        await supabaseAdmin.from("Foto").insert(fotosData);
      }
    }

    if (Object.keys(data).length > 0) {
      await supabaseAdmin.from("Imovel").update(data).eq("id", id);
    }

    const { data: imovelAtualizado } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("id", id)
      .maybeSingle();

    if (!imovelAtualizado) return res.status(404).json({ message: "Erro ao recuperar imóvel." });

    (imovelAtualizado as any).fotos?.sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0));

    const fotosFormatadas = ((imovelAtualizado as any).fotos ?? []).map((f: any) => ({
      ...f,
      url: resolveFotoUrl(f.url),
    }));

    res.status(200).json({ ...imovelAtualizado, fotos: fotosFormatadas });
  } catch (error) {
    console.error("Erro PUT:", error);
    res.status(500).json({ message: "Erro ao atualizar imóvel." });
  }
};

/* --- GET --- */
const handleGetById = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido." });

  const { data: imovel } = await supabaseAdmin
    .from("Imovel")
    .select("*, fotos:Foto(*)")
    .eq("id", id)
    .maybeSingle();

  if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado." });

  (imovel as any).fotos?.sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const fotosFormatadas = ((imovel as any).fotos ?? []).map((f: any) => ({
    ...f,
    url: resolveFotoUrl(f.url),
  }));

  return res.status(200).json({ ...imovel, fotos: fotosFormatadas });
};

/* --- PATCH --- */
const handlePatch = async (req: AuthApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { status } = req.body;

  if (!id || !status) return res.status(400).json({ message: "Dados inválidos." });

  await supabaseAdmin
    .from("Imovel")
    .update({ status: status as ImovelStatus })
    .eq("id", String(id));

  const { data: updated } = await supabaseAdmin
    .from("Imovel")
    .select("*, fotos:Foto(*)")
    .eq("id", String(id))
    .maybeSingle();

  if (!updated) return res.status(404).json({ message: "Imóvel não encontrado." });

  const fotosFormatadas = ((updated as any).fotos ?? []).map((f: any) => ({
    ...f,
    url: resolveFotoUrl(f.url),
  }));

  return res.status(200).json({ ...updated, fotos: fotosFormatadas });
};

/* --- HANDLER --- */
export default async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") return authorize(handleDelete, "CORRETOR")(req, res);
  if (req.method === "PUT") return authorize(handlePut, "CORRETOR")(req, res);
  if (req.method === "PATCH") return authorize(handlePatch, "CORRETOR")(req, res);
  if (req.method === "GET") return handleGetById(req, res);

  return res.status(405).json({ message: "Método não permitido." });
}
