import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import * as cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Public endpoint for Sales Page
    try {
      const { nome, email, whatsapp, mensagem } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ message: "Nome e Email são obrigatórios." });
      }

      const { data: lead, error } = await supabaseAdmin
        .from("Lead")
        .insert({ id: randomUUID(), nome, email, whatsapp, mensagem })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return res.status(201).json(lead);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      return res.status(500).json({ message: "Erro interno ao salvar lead." });
    }
  }

  if (req.method === "GET") {
    // Admin only endpoint - Manual Auth Check because authorize middleware wraps the whole handler
    try {
      const cookies = cookie.parse(req.headers.cookie || "");
      const sessionId = cookies.sessionId;

      if (!sessionId) {
        return res.status(401).json({ message: "Não autorizado." });
      }

      const { data: session } = await supabaseAdmin
        .from("Session")
        .select("*, user:User(id,email,role)")
        .eq("id", sessionId)
        .maybeSingle();

      if (!session || new Date(session.expiresAt) < new Date()) {
        return res.status(401).json({ message: "Sessão inválida ou expirada." });
      }

      const { data: leads } = await supabaseAdmin
        .from("Lead")
        .select("*")
        .order("createdAt", { ascending: false });

      return res.status(200).json(leads ?? []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      return res.status(500).json({ message: "Erro ao buscar leads.", error: String(error) });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
