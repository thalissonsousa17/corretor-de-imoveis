import { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { status } = req.body;

      const { data: lead, error } = await supabaseAdmin
        .from("Lead")
        .update({ status })
        .eq("id", String(id))
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(lead);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      return res.status(500).json({ message: "Erro ao atualizar lead." });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default authorize(handler);
