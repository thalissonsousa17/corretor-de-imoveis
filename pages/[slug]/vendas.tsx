import type { GetServerSideProps } from "next";
import Link from "next/link";

type Foto = { id: string; url: string };
type Imovel = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  cidade: string;
  estado: string;
  fotos: Foto[];
};
type Props = {
  slug: string;
  imoveis: Imovel[];
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;
  // reaproveita a primeira rota pra pegar topo + outra pra pegar os 20
  const [topoRes, vendasRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`),
    fetch(`${baseUrl}/api/public/corretor/${slug}/vendas`),
  ]);
  if (!topoRes.ok || !vendasRes.ok) return { notFound: true };
  const topo = await topoRes.json();
  const vendas = await vendasRes.json();
  return {
    props: {
      slug,
      imoveis: vendas.imoveis,
      bannerUrl: topo?.corretor?.bannerUrl ?? null,
      avatarUrl: topo?.corretor?.avatarUrl ?? null,
      name: topo?.corretor?.name ?? null,
    },
  };
};

export default function Vendas({ slug, imoveis, bannerUrl, avatarUrl, name }: Props) {
  return (
    <div className="bg-gray-100">
      <div>
        <section className="relative">
          {bannerUrl && (
            <div className="absolute inset-0">
              <img src={bannerUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0" />
            </div>
          )}
          <div className="relative mx-auto max-w-6xl px-4 py-12  text-white flex items-center gap-4">
            {avatarUrl && (
              <img
                src={avatarUrl}
                className="w-16 h-16 rounded-full ring-2 ring-white/40 object-cover"
              />
            )}
            <h1 className="text-2xl font-semibold">{name ?? "Corretor"} • Imóveis à Venda</h1>
          </div>
        </section>
      </div>
      <div>
        <>
          <section className="mx-auto max-w-6xl px-4 py-10">
            {imoveis.length === 0 ? (
              <p>Nenhum imóvel encontrado.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {imoveis.map((i) => {
                  const capa = i.fotos?.[0]?.url;
                  return (
                    <article
                      key={i.id}
                      className="rounded-2xl overflow-hidden border bg-white tex-gray-700 shadow-sm"
                    >
                      {capa && (
                        <img src={capa} alt={i.titulo} className="h-48 w-full object-cover" />
                      )}
                      <div className="p-4 text-gray-700">
                        <h3 className="font-medium line-clamp-1">{i.titulo}</h3>
                        <p className="text-sm text-zinc-600 line-clamp-2 mt-1">{i.descricao}</p>
                        <p className="mt-2 font-semibold ">
                          {Number(i.preco).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p className="text-sm text-zinc-700">
                          {i.cidade} - {i.estado}
                        </p>
                        <Link
                          href={`/${slug}/imovel/${i.id}`}
                          className="mt-4 inline-block w-full text-center rounded-xl bg-black text-white py-2"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      </div>
    </div>
  );
}
