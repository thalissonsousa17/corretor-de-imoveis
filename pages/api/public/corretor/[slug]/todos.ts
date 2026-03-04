import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  try {
    const { data: profile } = await supabaseAdmin
      .from("CorretorProfile")
      .select("*, user:User(name)")
      .eq("slug", String(slug))
      .maybeSingle();

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    const { data: imoveisRaw } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("corretorId", profile.userId)
      .limit(24);

    const imoveis = (imoveisRaw ?? []).map((imovel: any) => {
      const fotosOrdenadas = (imovel.fotos ?? []).sort(
        (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
      );
      const primeiraFotoUrl = fotosOrdenadas[0]?.url ?? null;

      console.log(`[LOG] Imóvel: ${imovel.titulo} | Foto Original: ${primeiraFotoUrl}`);

      return {
        ...imovel,
        fotoPrincipal: resolveFotoUrl(primeiraFotoUrl),
        fotos: undefined,
      };
    });

    const user = Array.isArray(profile.user) ? profile.user[0] : profile.user;

    return res.status(200).json({
      corretor: {
        name: user?.name || profile.slug,
        avatarUrl: resolveFotoUrl(profile.avatarUrl),
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).end();
  }
}
