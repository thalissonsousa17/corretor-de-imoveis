import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabase";
import { authorize } from "../../../lib/authMiddleware";
import { randomUUID } from "node:crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface AuthApiRequest extends NextApiRequest {
  user?: { id: string; email: string; role: string };
  files?: {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
    logo?: Express.Multer.File[];
  };
}

const getUploadDir = () => process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadDir();
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Vercel read-only filesystem – files will be stored via Supabase Storage
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });

  if (req.method === "GET") {
    try {
      const { data: perfil } = await supabaseAdmin
        .from("CorretorProfile")
        .select("*, user:User(name,email,stripeCustomerId)")
        .eq("userId", userId)
        .maybeSingle();

      if (!perfil) {
        const { data: user } = await supabaseAdmin
          .from("User")
          .select("name,email")
          .eq("id", userId)
          .maybeSingle();

        return res.status(200).json({
          plano: "GRATUITO",
          planoStatus: "INATIVO",
          stripeCurrentPeriodEnd: null,
          assinaturaCriadaEm: null,
          ultimoPagamentoEm: null,
          stripeCustomerId: null,
          user,
        });
      }

      const perfilAny = perfil as any;
      const u = Array.isArray(perfilAny.user) ? perfilAny.user[0] : perfilAny.user;
      const assinaturaManual = perfilAny.plano !== "GRATUITO" && !perfilAny.stripeSubscriptionId;

      return res.status(200).json({
        plano: perfilAny.plano,
        planoStatus: assinaturaManual ? "ATIVO" : perfilAny.planoStatus,
        stripeCurrentPeriodEnd: assinaturaManual ? null : perfilAny.stripeCurrentPeriodEnd,
        assinaturaCriadaEm: assinaturaManual ? perfilAny.createdAt : perfilAny.assinaturaCriadaEm,
        ultimoPagamentoEm: assinaturaManual ? perfilAny.createdAt : perfilAny.ultimoPagamentoEm,
        stripeCustomerId: assinaturaManual ? null : (u?.stripeCustomerId ?? null),
        creci: perfilAny.creci,
        slug: perfilAny.slug,
        biografia: perfilAny.biografia,
        instagram: perfilAny.instagram,
        facebook: perfilAny.facebook,
        linkedin: perfilAny.linkedin,
        whatsapp: perfilAny.whatsapp,
        metaTitle: perfilAny.metaTitle,
        metaDescription: perfilAny.metaDescription,
        avatarUrl: perfilAny.avatarUrl,
        bannerUrl: perfilAny.bannerUrl,
        logoUrl: perfilAny.logoUrl,
        slogan: perfilAny.slogan,
        accentColor: perfilAny.accentColor,
        videoUrl: perfilAny.videoUrl,
        bioTitle: perfilAny.bioTitle,
        name: u?.name ?? "",
        email: u?.email ?? "",
      });
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
      return res.status(500).json({ error: "Erro interno ao buscar perfil." });
    }
  }

  if (req.method === "POST") {
    try {
      // ── Parse multipart form (multer) ──────────────────────────────────────
      await new Promise<void>((resolve, reject) => {
        upload.fields([
          { name: "avatar", maxCount: 1 },
          { name: "banner", maxCount: 1 },
          { name: "logo", maxCount: 1 },
        ])(
          req as unknown as Parameters<ReturnType<typeof upload.fields>>[0],
          res as unknown as Parameters<ReturnType<typeof upload.fields>>[1],
          (err: unknown) => (err ? reject(err) : resolve())
        );
      });

      // Normalise multer body – v2 may return arrays for text fields
      if (typeof req.body === "object" && req.body !== null) {
        for (const key of Object.keys(req.body)) {
          const value = req.body[key as keyof typeof req.body];
          if (typeof value === "object" && value !== null) {
            (req.body as Record<string, string>)[key] = String(value);
          }
        }
      }

      const body = (req.body || {}) as Record<string, string>;

      const {
        name,
        email,
        creci,
        slug,
        biografia,
        instagram,
        facebook,
        linkedin,
        whatsapp,
        metaTitle,
        metaDescription,
      } = body;

      let avatarUrl: string | null | undefined = body.avatar || undefined;
      let bannerUrl: string | null | undefined = body.banner || undefined;
      let logoUrl: string | null | undefined = body.logo || undefined;

      if (req.files?.avatar?.[0]) avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      if (req.files?.banner?.[0]) bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      if (req.files?.logo?.[0]) logoUrl = `/uploads/${req.files.logo[0].filename}`;

      if (logoUrl === "null" || logoUrl === "undefined") logoUrl = null;

      // ── Update user name/email only if provided ────────────────────────────
      const userUpdateData: Record<string, string> = {};
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email;

      if (Object.keys(userUpdateData).length > 0) {
        await supabaseAdmin.from("User").update(userUpdateData).eq("id", userId);
      }

      // ── Slug deduplication ────────────────────────────────────────────────
      let finalSlug = slug ? normalizeSlug(slug) : undefined;

      if (finalSlug) {
        const { data: existing } = await supabaseAdmin
          .from("CorretorProfile")
          .select("userId")
          .eq("slug", finalSlug)
          .maybeSingle();

        let suffix = 1;
        let currentExisting = existing;
        let currentSlug = finalSlug;

        while (currentExisting && (currentExisting as any).userId !== userId) {
          currentSlug = normalizeSlug(slug + suffix.toString());
          const { data: next } = await supabaseAdmin
            .from("CorretorProfile")
            .select("userId")
            .eq("slug", currentSlug)
            .maybeSingle();
          currentExisting = next;
          suffix++;
        }
        finalSlug = currentSlug;
      }

      // ── Build update payload – strip undefined so Supabase ignores them ───
      const rawData: Record<string, unknown> = {
        creci,
        slug: finalSlug,
        biografia,
        instagram,
        facebook,
        linkedin,
        whatsapp,
        metaTitle,
        metaDescription,
        slogan: body.slogan,
        accentColor: body.accentColor,
        videoUrl: body.videoUrl,
        bioTitle: body.bioTitle,
      };

      if (avatarUrl !== undefined) rawData.avatarUrl = avatarUrl;
      if (bannerUrl !== undefined) rawData.bannerUrl = bannerUrl;
      if (logoUrl !== undefined) rawData.logoUrl = logoUrl;

      const dataToSave = Object.fromEntries(
        Object.entries(rawData).filter(([, v]) => v !== undefined)
      );

      // ── Upsert profile ────────────────────────────────────────────────────
      const { data: existingPerfil } = await supabaseAdmin
        .from("CorretorProfile")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();

      if (existingPerfil) {
        if (Object.keys(dataToSave).length > 0) {
          await supabaseAdmin.from("CorretorProfile").update(dataToSave).eq("userId", userId);
        }
      } else {
        await supabaseAdmin.from("CorretorProfile").insert({
          id: randomUUID(),
          userId,
          creci: creci || undefined,
          slug: finalSlug || `corretor-${userId.slice(0, 6)}`,
          biografia: biografia || undefined,
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          whatsapp: whatsapp || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          plano: "GRATUITO",
          planoStatus: "INATIVO",
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(bannerUrl !== undefined && { bannerUrl }),
          ...(logoUrl !== undefined && { logoUrl }),
        });
      }

      // ── Fetch updated profile with user ───────────────────────────────────
      const { data: perfil } = await supabaseAdmin
        .from("CorretorProfile")
        .select("*, user:User(name,email)")
        .eq("userId", userId)
        .maybeSingle();

      const perfilUser = Array.isArray((perfil as any)?.user)
        ? (perfil as any).user[0]
        : (perfil as any)?.user;

      return res.status(200).json({
        ...(perfil as any),
        user: perfilUser,
        name: perfilUser?.name ?? "",
        email: perfilUser?.email ?? "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Erro ao salvar perfil:", message);
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
