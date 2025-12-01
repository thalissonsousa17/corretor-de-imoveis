import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import type { Prisma } from "@prisma/client";

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

const uploadDir = path.join(process.cwd(), "public/uploads");
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

      // 1) Se NÃO existir perfil
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

      // 2) Detecta se É assinatura manual
      const assinaturaManual = perfil.plano !== "GRATUITO" && !perfil.stripeSubscriptionId;

      return res.status(200).json({
        plano: perfil.plano,
        planoStatus: assinaturaManual ? "ATIVO" : perfil.planoStatus,

        stripeCurrentPeriodEnd: assinaturaManual ? null : perfil.stripeCurrentPeriodEnd,

        assinaturaCriadaEm: assinaturaManual ? perfil.createdAt : perfil.assinaturaCriadaEm,

        ultimoPagamentoEm: assinaturaManual ? perfil.createdAt : perfil.ultimoPagamentoEm,

        stripeCustomerId: assinaturaManual ? null : (perfil.user.stripeCustomerId ?? null),

        // Dados gerais do perfil
        creci: perfil.creci,
        slug: perfil.slug,
        biografia: perfil.biografia,
        instagram: perfil.instagram,
        facebook: perfil.facebook,
        linkedin: perfil.linkedin,
        whatsapp: perfil.whatsapp,
        metaTitle: perfil.metaTitle,
        metaDescription: perfil.metaDescription,
        avatarUrl: perfil.avatarUrl,
        bannerUrl: perfil.bannerUrl,
        logoUrl: perfil.logoUrl,

        name: perfil.user.name,
        email: perfil.user.email,
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

    console.log("===== DEBUG UPLOAD =====");
    console.log("Body keys:", Object.keys(req.body || {}));
    console.log("Files keys:", Object.keys(req.files || {}));
    console.log("Avatar:", req.files?.avatar?.[0]?.filename);
    console.log("Banner:", req.files?.banner?.[0]?.filename);
    console.log("Logo:", req.files?.logo?.[0]?.filename);
    console.log("=========================");

    // 🔹 Normaliza body (garante strings)
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

      const dataToSave: Prisma.CorretorProfileUpdateInput = {
        creci,
        slug: finalSlug,
        biografia,
        instagram,
        facebook,
        linkedin,
        whatsapp,
        metaTitle,
        metaDescription,
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

      console.log("🧠 Dados que serão salvos:", dataToSave);

      const existingPerfil = await prisma.corretorProfile.findUnique({ where: { userId } });
      let perfil;

      if (existingPerfil) {
        perfil = await prisma.corretorProfile.update({
          where: { userId },
          data: dataToSave,
          include: { user: true },
        });
      } else {
        const createData: Prisma.CorretorProfileCreateInput = {
          creci: creci || undefined,
          slug: finalSlug || `corretor-${userId.slice(0, 6)}`,
          biografia: biografia || undefined,
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          whatsapp: whatsapp || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(bannerUrl !== undefined && { bannerUrl }),
          ...(logoUrl !== undefined && { logoUrl }),
          user: {
            connect: { id: userId },
          },
        };

        perfil = await prisma.corretorProfile.create({
          data: createData,
          include: { user: true },
        });
      }

      console.log("✅ Perfil salvo com sucesso!");
      return res.status(200).json(perfil);
    } catch (err) {
      console.error("❌ Erro ao salvar perfil:", err);
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
