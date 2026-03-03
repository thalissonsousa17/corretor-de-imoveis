import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/authMiddleware";
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
const uploadDir = getUploadDir();

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
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
      const perfil = await prisma.corretorProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              stripeCustomerId: true,
            },
          },
        },
      });

      if (!perfil) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });

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

      // PostgREST pode retornar user como objeto (many-to-one) ou array — tratar ambos
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

    if (typeof req.body === "object" && req.body !== null) {
      for (const key of Object.keys(req.body)) {
        const value = req.body[key as keyof typeof req.body];
        if (typeof value === "object" && value !== null) {
          (req.body as Record<string, string>)[key] = String(value);
        }
      }
    }

    try {
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
      } = (req.body || {}) as Record<string, string>;

      let avatarUrl: string | null | undefined = req.body.avatar || undefined;
      let bannerUrl: string | null | undefined = req.body.banner || undefined;
      let logoUrl: string | null | undefined = req.body.logo || undefined;

      if (req.files?.avatar?.[0]) avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      if (req.files?.banner?.[0]) bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      if (req.files?.logo?.[0]) logoUrl = `/uploads/${req.files.logo[0].filename}`;

      if (logoUrl === "null" || logoUrl === "undefined") logoUrl = null;

      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });

      let finalSlug = slug ? normalizeSlug(slug) : undefined;

      if (finalSlug) {
        let existing = await prisma.corretorProfile.findUnique({ where: { slug: finalSlug } });
        let suffix = 1;

        while (existing && existing.userId !== userId) {
          finalSlug = normalizeSlug(slug + suffix.toString());
          existing = await prisma.corretorProfile.findUnique({ where: { slug: finalSlug } });
          suffix++;
        }
      }

      const dataToSave: any = {
        creci,
        slug: finalSlug,
        biografia,
        instagram,
        facebook,
        linkedin,
        whatsapp,
        metaTitle,
        metaDescription,
        slogan: req.body.slogan,
        accentColor: req.body.accentColor,
        videoUrl: req.body.videoUrl,
        bioTitle: req.body.bioTitle,
      };

      if (avatarUrl !== undefined) dataToSave.avatarUrl = avatarUrl;
      if (bannerUrl !== undefined) dataToSave.bannerUrl = bannerUrl;
      if (logoUrl !== undefined) dataToSave.logoUrl = logoUrl;
      if (finalSlug !== undefined) dataToSave.slug = finalSlug;
      if (creci !== undefined) dataToSave.creci = creci;
      if (biografia !== undefined) dataToSave.biografia = biografia;
      if (instagram !== undefined) dataToSave.instagram = instagram;
      if (facebook !== undefined) dataToSave.facebook = facebook;
      if (linkedin !== undefined) dataToSave.linkedin = linkedin;
      if (whatsapp !== undefined) dataToSave.whatsapp = whatsapp;
      if (metaTitle !== undefined) dataToSave.metaTitle = metaTitle;
      if (metaDescription !== undefined) dataToSave.metaDescription = metaDescription;

      const existingPerfil = await prisma.corretorProfile.findUnique({ where: { userId } });
      let perfil;

      if (existingPerfil) {
        // Supabase REST não suporta include em UPDATE — fazer em 2 passos
        await prisma.corretorProfile.update({
          where: { userId },
          data: dataToSave,
        });
      } else {
        const createData: any = {
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
        };

        await prisma.corretorProfile.create({ data: createData });
      }

      // Buscar o perfil atualizado com o user separadamente
      perfil = await prisma.corretorProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

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
      console.error("❌ Erro ao salvar perfil:", err);
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
