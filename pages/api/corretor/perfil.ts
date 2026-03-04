import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabase";
import { authorize } from "../../../lib/authMiddleware";
import { randomUUID } from "node:crypto";
import multer from "multer";
import path from "path";

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export const config = {
  api: { bodyParser: false },
};

export interface AuthApiRequest extends NextApiRequest {
  user?: { id: string; email: string; role: string };
  files?: {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
    logo?: Express.Multer.File[];
  };
}

// ── memoryStorage: sem disco, funciona no Vercel ───────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

const BUCKET = "perfil-fotos";

async function uploadToStorage(file: Express.Multer.File, folder: string): Promise<string> {
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const fileName = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

  if (error) throw new Error(`Erro no upload (${folder}): ${error.message}`);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { data: perfil } = await supabaseAdmin
        .from("CorretorProfile")
        .select("id, creci, slug, biografia, instagram, facebook, linkedin, whatsapp, metaTitle, metaDescription, avatarUrl, bannerUrl, logoUrl, slogan, accentColor, videoUrl, bioTitle, plano, planoStatus, stripeCurrentPeriodEnd, assinaturaCriadaEm, ultimoPagamentoEm, stripeSubscriptionId, createdAt")
        .eq("userId", userId)
        .maybeSingle();

      const { data: u } = await supabaseAdmin
        .from("User")
        .select("name, email, stripeCustomerId")
        .eq("id", userId)
        .maybeSingle();

      if (!perfil) {
        return res.status(200).json({
          plano: "GRATUITO",
          planoStatus: "INATIVO",
          stripeCurrentPeriodEnd: null,
          assinaturaCriadaEm: null,
          ultimoPagamentoEm: null,
          stripeCustomerId: null,
          name: u?.name ?? "",
          email: u?.email ?? "",
        });
      }

      const assinaturaManual = perfil.plano !== "GRATUITO" && !(perfil as any).stripeSubscriptionId;

      return res.status(200).json({
        ...perfil,
        planoStatus: assinaturaManual ? "ATIVO" : perfil.planoStatus,
        stripeCurrentPeriodEnd: assinaturaManual ? null : perfil.stripeCurrentPeriodEnd,
        assinaturaCriadaEm: assinaturaManual ? perfil.createdAt : perfil.assinaturaCriadaEm,
        ultimoPagamentoEm: assinaturaManual ? perfil.createdAt : perfil.ultimoPagamentoEm,
        stripeCustomerId: assinaturaManual ? null : (u?.stripeCustomerId ?? null),
        name: u?.name ?? "",
        email: u?.email ?? "",
      });
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
      return res.status(500).json({ error: "Erro interno ao buscar perfil." });
    }
  }

  // ── POST ──────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      // Parse multipart em memória
      await new Promise<void>((resolve, reject) => {
        upload.fields([
          { name: "avatar", maxCount: 1 },
          { name: "banner", maxCount: 1 },
          { name: "logo",   maxCount: 1 },
        ])(
          req as unknown as Parameters<ReturnType<typeof upload.fields>>[0],
          res as unknown as Parameters<ReturnType<typeof upload.fields>>[1],
          (err: unknown) => (err ? reject(err) : resolve())
        );
      });

      // Normaliza campos que multer pode retornar como array
      if (typeof req.body === "object" && req.body !== null) {
        for (const key of Object.keys(req.body)) {
          const value = req.body[key as keyof typeof req.body];
          if (Array.isArray(value)) {
            (req.body as Record<string, string>)[key] = String(value[0]);
          }
        }
      }

      const body = (req.body || {}) as Record<string, string>;
      const { name, email, creci, slug, biografia, instagram, facebook, linkedin, whatsapp, metaTitle, metaDescription } = body;

      // ── Upload imagens → Supabase Storage ────────────────────────────────
      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;
      let logoUrl: string | null | undefined;

      if (req.files?.avatar?.[0]) avatarUrl = await uploadToStorage(req.files.avatar[0], `${userId}/avatar`);
      if (req.files?.banner?.[0]) bannerUrl = await uploadToStorage(req.files.banner[0], `${userId}/banner`);
      if (req.files?.logo?.[0])   logoUrl   = await uploadToStorage(req.files.logo[0],   `${userId}/logo`);
      if (body.logo === "null" || body.logo === "undefined") logoUrl = null;

      // ── Atualiza User ─────────────────────────────────────────────────────
      const userUpdateData: Record<string, string> = { updatedAt: new Date().toISOString() };
      if (name)  userUpdateData.name  = name;
      if (email) userUpdateData.email = email;
      if (name || email) {
        await supabaseAdmin.from("User").update(userUpdateData).eq("id", userId);
      }

      // ── Slug deduplication ────────────────────────────────────────────────
      let finalSlug = slug ? normalizeSlug(slug) : undefined;
      if (finalSlug) {
        let suffix = 1;
        let currentSlug = finalSlug;
        while (true) {
          const { data: existing } = await supabaseAdmin
            .from("CorretorProfile")
            .select("userId")
            .eq("slug", currentSlug)
            .maybeSingle();
          if (!existing || (existing as any).userId === userId) break;
          currentSlug = normalizeSlug(slug + suffix.toString());
          suffix++;
        }
        finalSlug = currentSlug;
      }

      // ── Payload ───────────────────────────────────────────────────────────
      const rawData: Record<string, unknown> = {
        creci, slug: finalSlug, biografia, instagram, facebook, linkedin,
        whatsapp, metaTitle, metaDescription,
        slogan: body.slogan, accentColor: body.accentColor,
        videoUrl: body.videoUrl, bioTitle: body.bioTitle,
        updatedAt: new Date().toISOString(),
      };
      if (avatarUrl !== undefined) rawData.avatarUrl = avatarUrl;
      if (bannerUrl !== undefined) rawData.bannerUrl = bannerUrl;
      if (logoUrl   !== undefined) rawData.logoUrl   = logoUrl;

      const dataToSave = Object.fromEntries(
        Object.entries(rawData).filter(([, v]) => v !== undefined)
      );

      // ── Upsert CorretorProfile ────────────────────────────────────────────
      const { data: existingPerfil } = await supabaseAdmin
        .from("CorretorProfile").select("id").eq("userId", userId).maybeSingle();

      if (existingPerfil) {
        if (Object.keys(dataToSave).length > 0) {
          await supabaseAdmin.from("CorretorProfile").update(dataToSave).eq("userId", userId);
        }
      } else {
        const now = new Date().toISOString();
        await supabaseAdmin.from("CorretorProfile").insert({
          id: randomUUID(),
          userId,
          slug: finalSlug || `corretor-${userId.slice(0, 6)}`,
          plano: "GRATUITO",
          planoStatus: "INATIVO",
          createdAt: now,
          updatedAt: now,
          ...dataToSave,
        });
      }

      // ── Retorna perfil atualizado ──────────────────────────────────────────
      const { data: perfil } = await supabaseAdmin
        .from("CorretorProfile").select("*").eq("userId", userId).maybeSingle();

      const { data: u } = await supabaseAdmin
        .from("User").select("name, email").eq("id", userId).maybeSingle();

      return res.status(200).json({
        ...(perfil as any),
        name:  u?.name  ?? "",
        email: u?.email ?? "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Erro ao salvar perfil:", message);
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});