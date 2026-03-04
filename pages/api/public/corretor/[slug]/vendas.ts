import { supabaseAdmin } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido" });

  try {
    const { data: profile } = await supabaseAdmin
      .from("CorretorProfile")
      .select("*, user:User(name)")
      .eq("slug", slug)
      .maybeSingle();

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado" });

    const { data: imoveisRaw } = await supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("corretorId", profile.userId)
      .eq("finalidade", "VENDA")
      .eq("status", "DISPONIVEL")
      .order("createdAt", { ascending: false })
      .limit(20);

    const user = Array.isArray(profile.user) ? profile.user[0] : profile.user;

    res.json({
      corretor: {
        id: profile.userId,
        name: user?.name,
        creci: profile.creci,
        slug: profile.slug,
        avatarUrl: resolveFotoUrl(profile.avatarUrl),
        bannerUrl: resolveFotoUrl(profile.bannerUrl),
        whatsapp: profile.whatsapp,
        instagram: profile.instagram,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        logoUrl: resolveFotoUrl(profile.logoUrl),
      },
      imoveis: (imoveisRaw ?? []).map((im: any) => {
        const fotosOrdenadas = (im.fotos ?? []).sort(
          (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
        );
        return {
          ...im,
          fotos: fotosOrdenadas.map((f: any) => ({
            ...f,
            url: resolveFotoUrl(f.url),
          })),
        };
      }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erro interno" });
  }
}
