/**
 * Funções de leitura pública de dados do Supabase para uso em getServerSideProps.
 * Elimina o padrão de self-fetch HTTP que causava erros 500 em produção.
 */
import { supabaseAdmin } from "@/lib/supabase";
import { resolveFotoUrl } from "@/lib/imageUtils";

export async function getCorretorPublicData(slug: string) {
  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) return null;

  const { data: user } = await supabaseAdmin
    .from("User")
    .select("name, email")
    .eq("id", profile.userId)
    .maybeSingle();

  return {
    id: profile.userId as string,
    name: (user?.name ?? "") as string,
    email: (user?.email ?? "") as string,
    creci: (profile.creci ?? null) as string | null,
    avatarUrl: resolveFotoUrl(profile.avatarUrl),
    bannerUrl: resolveFotoUrl(profile.bannerUrl),
    logoUrl: resolveFotoUrl(profile.logoUrl),
    biografia: (profile.biografia ?? null) as string | null,
    instagram: (profile.instagram ?? null) as string | null,
    facebook: (profile.facebook ?? null) as string | null,
    linkedin: (profile.linkedin ?? null) as string | null,
    whatsapp: (profile.whatsapp ?? null) as string | null,
    slug: profile.slug as string,
    slogan: (profile.slogan ?? null) as string | null,
    accentColor: (profile.accentColor ?? null) as string | null,
    videoUrl: (profile.videoUrl ?? null) as string | null,
    bioTitle: (profile.bioTitle ?? null) as string | null,
  };
}

export type PublicCorretor = NonNullable<Awaited<ReturnType<typeof getCorretorPublicData>>>;

export async function getImoveisPublicData(
  corretorId: string,
  options?: { finalidade?: string; status?: string; limit?: number }
) {
  let query = supabaseAdmin
    .from("Imovel")
    .select("*, fotos:Foto(*)")
    .eq("corretorId", corretorId)
    .order("createdAt", { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.finalidade) query = query.eq("finalidade", options.finalidade);
  if (options?.status) query = query.eq("status", options.status);

  const { data: raw } = await query;

  return (raw ?? []).map((imovel: any) => {
    const fotosOrdenadas = (imovel.fotos ?? []).sort(
      (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
    );
    return {
      ...imovel,
      fotoPrincipal: resolveFotoUrl(fotosOrdenadas[0]?.url ?? null),
      fotos: fotosOrdenadas.map((f: any) => ({ ...f, url: resolveFotoUrl(f.url) })),
    };
  });
}

export async function getImovelPublicData(id: string) {
  const { data: imovel } = await supabaseAdmin
    .from("Imovel")
    .select("*, fotos:Foto(*)")
    .eq("id", id)
    .maybeSingle();

  if (!imovel) return null;

  const fotosOrdenadas = (imovel.fotos ?? []).sort(
    (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
  );

  return {
    ...imovel,
    fotos: fotosOrdenadas.map((f: any) => ({ ...f, url: resolveFotoUrl(f.url) })),
  };
}
