import { supabaseAdmin } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido" });

  try {
    const { data: imovel } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*), corretor:User(name, profile:CorretorProfile(*))")
      .eq("id", id)
      .maybeSingle();

    if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado" });

    const fotosOrdenadas = (imovel.fotos ?? []).sort(
      (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
    );

    const corretor = Array.isArray(imovel.corretor) ? imovel.corretor[0] : imovel.corretor;
    const profile = corretor
      ? Array.isArray(corretor.profile)
        ? corretor.profile[0]
        : corretor.profile
      : null;

    res.json({
      imovel: {
        ...imovel,
        fotos: fotosOrdenadas.map((f: any) => ({
          ...f,
          url: resolveFotoUrl(f.url),
        })),
      },
      corretor: profile
        ? {
            name: corretor?.name,
            creci: profile.creci,
            slug: profile.slug,
            avatarUrl: resolveFotoUrl(profile.avatarUrl),
            logoUrl: resolveFotoUrl(profile.logoUrl),
            bannerUrl: resolveFotoUrl(profile.bannerUrl),
            whatsapp: profile.whatsapp,
            instagram: profile.instagram,
            facebook: profile.facebook,
            linkedin: profile.linkedin,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erro interno" });
  }
}
