import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido." });

  try {
    const { data: profile } = await supabaseAdmin
      .from("CorretorProfile")
      .select("*, user:User(name,email)")
      .eq("slug", slug)
      .maybeSingle();

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    let query = supabaseAdmin
      .from("Imovel")
      .select("*, fotos:Foto(*)")
      .eq("corretorId", profile.userId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (typeof filtro === "string") {
      switch (filtro.toUpperCase()) {
        case "VENDA":
          query = query.eq("finalidade", "VENDA").eq("status", "DISPONIVEL");
          break;
        case "ALUGUEL":
          query = query.eq("finalidade", "ALUGUEL").eq("status", "DISPONIVEL");
          break;
        case "VENDIDO":
          query = query.eq("status", "VENDIDO");
          break;
        case "ALUGADO":
          query = query.eq("status", "ALUGADO");
          break;
        case "INATIVO":
          query = query.eq("status", "INATIVO");
          break;
      }
    }

    const { data: imoveisRaw } = await query;

    const imoveis = (imoveisRaw ?? []).map((imovel: any) => {
      const fotosOrdenadas: any[] = (imovel.fotos ?? []).sort(
        (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
      );
      const capaRaw = fotosOrdenadas[0]?.url ?? null;

      return {
        ...imovel,
        fotoPrincipal: resolveFotoUrl(capaRaw),
        fotos: fotosOrdenadas.map((f: any) => ({ ...f, url: resolveFotoUrl(f.url) })),
      };
    });

    const user = Array.isArray(profile.user) ? profile.user[0] : profile.user;

    res.json({
      corretor: {
        id: profile.userId,
        name: user?.name,
        email: user?.email,
        creci: profile.creci,
        avatarUrl: resolveFotoUrl(profile.avatarUrl),
        bannerUrl: resolveFotoUrl(profile.bannerUrl),
        logoUrl: resolveFotoUrl(profile.logoUrl),
        biografia: profile.biografia,
        instagram: profile.instagram,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        whatsapp: profile.whatsapp,
        slug: profile.slug,
        slogan: profile.slogan,
        accentColor: profile.accentColor,
        videoUrl: profile.videoUrl,
        bioTitle: profile.bioTitle,
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
}
