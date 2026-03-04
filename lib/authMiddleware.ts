import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import * as cookie from "cookie";
import { randomUUID } from "node:crypto";

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

      // Query 1: busca a sessão
      const { data: session } = await supabaseAdmin
        .from("Session")
        .select("id, userId, expiresAt")
        .eq("id", sessionId)
        .maybeSingle();

      if (!session) {
        return res.status(401).json({ error: "Sessão inválida." });
      }

      if (new Date(session.expiresAt) < new Date()) {
        await supabaseAdmin.from("Session").delete().eq("id", sessionId);
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("sessionId", "", { maxAge: 0, path: "/" })
        );
        return res.status(401).json({ error: "Sessão expirada." });
      }

      // Query 2: busca o usuário pelo userId da sessão
      const { data: u } = await supabaseAdmin
        .from("User")
        .select("id, email, name, role")
        .eq("id", session.userId)
        .maybeSingle();

      if (!u) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }

      req.user = {
        id: u.id,
        email: u.email,
        role: u.role as "CORRETOR" | "CLIENTE" | "ADMIN",
      };

      // ADMIN tem acesso total
      if (requiredRole && req.user.role !== requiredRole && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Acesso negado." });
      }

      // Garante que CORRETOR tenha um CorretorProfile
      if (req.user.role === "CORRETOR") {
        const { data: perfil } = await supabaseAdmin
          .from("CorretorProfile")
          .select("id")
          .eq("userId", req.user.id)
          .maybeSingle();

        if (!perfil) {
          const baseSlug = req.user.email
            .split("@")[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

          const { data: slugExists } = await supabaseAdmin
            .from("CorretorProfile")
            .select("id")
            .eq("slug", baseSlug)
            .maybeSingle();

          const slug = slugExists ? `${baseSlug}-${req.user.id.slice(0, 6)}` : baseSlug;

          await supabaseAdmin.from("CorretorProfile").insert({
            id: randomUUID(),
            userId: req.user.id,
            slug,
            plano: "GRATUITO",
            planoStatus: "INATIVO",
          });
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error("ERRO NO AUTHORIZE:", error);
      return res.status(500).json({ error: "Erro interno." });
    }
  };