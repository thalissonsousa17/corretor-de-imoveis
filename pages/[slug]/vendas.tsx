import type { GetServerSideProps } from "next";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Banner */}
      <section className="relative">
        {bannerUrl && (
          <div className="absolute inset-0">
            <img src={bannerUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        <div className="relative mx-auto max-w-6xl px-6 py-16 text-white flex items-center gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              className="w-16 h-16 rounded-full ring-2 ring-white/40 object-cover"
            />
          )}
          <h1 className="text-2xl font-semibold">{name ?? "Corretor"} • Imóveis à Venda</h1>
        </div>
      </section>

      {/* Listagem de imóveis */}
      <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <p>Nenhum imóvel encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {imoveis.map((i) => {
              const capa = i.fotos?.[0]?.url;
              return (
                <article
                  key={i.id}
                  className="rounded-2xl overflow-hidden border-gray-200 bg-white text-gray-700 shadow-sm hover:shadow-md transition"
                >
                  {capa && <img src={capa} alt={i.titulo} className="h-48 w-full object-cover" />}
                  <div className="p-4 text-gray-700">
                    <h3 className="font-medium line-clamp-1">{i.titulo}</h3>
                    {/* <div
                      className="text-sm text-zinc-600 mt-1 overflow-hidden max-h-[3.2rem] leading-snug whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          (i.descricao || "")
                            .trim()
                            .replace(/\n{2,}/g, "<br>")
                            .replace(/\n/g, " ")
                        ),
                      }}
                    /> */}
                    <p className="mt-2 font-semibold">
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
                      className="mt-4 inline-block w-full text-center rounded-xl bg-black text-white py-2 hover:bg-zinc-800 transition"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
