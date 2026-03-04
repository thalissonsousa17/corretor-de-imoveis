import { NextApiResponse } from "next";
import { resolveFotoUrl } from "../../../../lib/imageUtils";
import { supabaseAdmin } from "../../../../lib/supabase";
import { AuthApiRequest, authorize } from "../../../../lib/authMiddleware";

const handleGetCorretorImoveis = async (req: AuthApiRequest, res: NextApiResponse) => {
  const corretorId = req.user!.id;

  try {
    const { data: imoveis } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("corretorId", corretorId)
      .order("createdAt", { ascending: false });

    return res.status(200).json(
      (imoveis ?? []).map((im: any) => ({
        ...im,
        fotos: (im.fotos ?? []).map((f: any) => ({
          ...f,
          url: resolveFotoUrl(f.url),
        })),
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar imóveis do corretor:", error);
    return res.status(500).json({ message: "Erro interno ao buscar seus imóveis." });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return authorize(handleGetCorretorImoveis, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido." });
}
