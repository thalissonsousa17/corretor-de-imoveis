import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { authorize } from "../../../lib/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

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

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  // ================== GET ==================
  if (req.method === "GET") {
    try {
      const perfil = await prisma.corretorProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!perfil) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });
        return res.status(200).json({ perfil: { user } });
      }

      return res.status(200).json({ perfil });
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ error: "Erro interno ao buscar perfil." });
    }
  }

  // ================== POST ==================
  if (req.method === "POST") {
    await new Promise<void>((resolve, reject) => {
      upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "banner", maxCount: 1 },
      ])(
        req as unknown as Parameters<ReturnType<typeof upload.fields>>[0],
        res as unknown as Parameters<ReturnType<typeof upload.fields>>[1],
        (err: unknown) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // ✅ Garante que todos os valores do body sejam strings
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

      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;

      if (req.files?.avatar?.[0]) {
        avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      } else if (req.body.avatar) {
        avatarUrl = req.body.avatar;
      }

      if (req.files?.banner?.[0]) {
        bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      } else if (req.body.banner) {
        bannerUrl = req.body.banner;
      }

      // ✅ Atualiza nome e email no user principal
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });

      // ✅ Garante slug único
      let finalSlug = slug?.trim().toLowerCase();
      if (finalSlug) {
        let existing = await prisma.corretorProfile.findUnique({ where: { slug: finalSlug } });
        let suffix = 1;
        while (existing && existing.userId !== userId) {
          finalSlug = `${slug}-${String(suffix).padStart(2, "0")}`;
          existing = await prisma.corretorProfile.findUnique({ where: { slug: finalSlug } });
          suffix++;
        }
      }

      // ✅ Cria ou atualiza perfil
      const existingPerfil = await prisma.corretorProfile.findUnique({ where: { userId } });

      const perfil = existingPerfil
        ? await prisma.corretorProfile.update({
            where: { userId },
            data: {
              creci,
              slug: finalSlug,
              biografia,
              instagram,
              facebook,
              linkedin,
              whatsapp,
              metaTitle,
              metaDescription,
              ...(avatarUrl && { avatarUrl }),
              ...(bannerUrl && { bannerUrl }),
            },
            include: { user: true },
          })
        : await prisma.corretorProfile.create({
            data: {
              userId,
              creci,
              slug: finalSlug,
              biografia,
              instagram,
              facebook,
              linkedin,
              whatsapp,
              metaTitle,
              metaDescription,
              avatarUrl,
              bannerUrl,
            },
            include: { user: true },
          });

      return res.status(200).json({ perfil });
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      return res.status(500).json({ error: "Erro interno ao salvar perfil." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
