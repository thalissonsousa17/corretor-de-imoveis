import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import * as cookie from "cookie";

export interface AuthPayload {
  id: string;
  email: string;
  role: "CORRETOR" | "CLIENTE" | "ADMIN";
}

export interface AuthApiRequest extends NextApiRequest {
  user?: AuthPayload;
}

type AllowedRole = "CORRETOR" | "CLIENTE" | "ADMIN";

export const authorize =
  (
    handler: (req: AuthApiRequest, res: NextApiResponse) => Promise<void>,
    requiredRole?: AllowedRole
  ) =>
  async (req: AuthApiRequest, res: NextApiResponse) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || "");
      const sessionId = cookies.sessionId;

      if (!sessionId) {
        return res.status(401).json({ error: "Sessão não iniciada." });
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session) {
        return res.status(401).json({ error: "Sessão inválida." });
      }

      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: sessionId } });
        res.setHeader("Set-Cookie", cookie.serialize("sessionId", "", { maxAge: 0, path: "/" }));
        return res.status(401).json({ error: "Sessão expirada." });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role as "CORRETOR" | "CLIENTE" | "ADMIN",
      };

      // ADMIN tem acesso total — pode acessar rotas de CORRETOR também
      if (requiredRole && req.user.role !== requiredRole && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Acesso negado." });
      }

      // GARANTE QUE CORRETOR tenha um corretorProfile (ADMIN não precisa de perfil público)
      if (req.user.role === "CORRETOR") {
        const perfil = await prisma.corretorProfile.findUnique({
          where: { userId: req.user.id },
        });

        if (!perfil) {
          const baseSlug = req.user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
          const slugExists = await prisma.corretorProfile.findUnique({ where: { slug: baseSlug } });
          const slug = slugExists ? `${baseSlug}-${req.user.id.slice(0, 6)}` : baseSlug;

          await prisma.corretorProfile.create({
            data: {
              userId: req.user.id,
              slug,
              plano: "GRATUITO",
              planoStatus: "INATIVO",
            },
          });
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error("ERRO NO AUTHORIZE:", error);
      return res.status(500).json({ error: "Erro interno." });
    }
  };
