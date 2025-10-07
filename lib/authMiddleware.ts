import { NextApiRequest, NextApiResponse } from "next";
import prisma from "./prisma";
import cookie from "cookie";

export interface AuthPayload {
  id: string;
  email: string;
  role: "CORRETOR" | "CLIENTE";
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
    const cookies = cookie.parse(req.headers.cookie || "");
    const sessionId = cookies.sessionId;

    if (!sessionId) {
      return res
        .status(401)
        .json({ message: "Acesso negado. Sessão não iniciada." });
    }

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        if (session) await prisma.session.delete({ where: { id: sessionId } });
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("sessionId", "", { maxAge: 0, path: "/" })
        );
        return res
          .status(401)
          .json({ message: "Sessão inválida ou expirada." });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role as "CORRETOR" | "CLIENTE",
      };

      if (requiredRole && req.user.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: " Acesso negado, Permissão insulficiente" });
      }
      return handler(req, res);
    } catch (error) {
      console.error("Erro de autorização:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  };
