import { supabaseAdmin } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido" });

  try {
    // Query 1: busca o imóvel com fotos
    const { data: imovel } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("id", id)
      .maybeSingle();

    if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado" });

    // Query 2: busca o usuário (corretor) pelo corretorId
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id, name")
      .eq("id", imovel.corretorId)
      .maybeSingle();

    // Query 3: busca o perfil do corretor
    const { data: profile } = user
      ? await supabaseAdmin
          .from("CorretorProfile")
          .select("*")
          .eq("userId", user.id)
          .maybeSingle()
      : { data: null };

    const fotosOrdenadas = (imovel.fotos ?? []).sort(
      (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
    );

    return res.json({
      imovel: {
        ...imovel,
        fotos: fotosOrdenadas.map((f: any) => ({
          ...f,
          url: resolveFotoUrl(f.url),
        })),
      },
      corretor: profile
        ? {
            name: user?.name ?? "",
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
    return res.status(500).json({ message: "Erro interno" });
  }
}