import type { GetServerSideProps } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";

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
  corretor: CorretorProps | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  // Pegamos os dados do corretor e os imóveis
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
      corretor: topo?.corretor ?? null,
    },
  };
};

export default function Vendas({ slug, imoveis, corretor }: Props) {
  return (
    <LayoutCorretor corretor={corretor}>
      {/* Banner */}
      <section className="relative">
        {corretor?.bannerUrl && (
          <div className="absolute inset-0">
            <img src={corretor.bannerUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        <div className="relative mx-auto max-w-6xl px-6 py-16 text-white flex items-center gap-4">
          {corretor?.avatarUrl && (
            <img
              src={corretor.avatarUrl}
              className="w-16 h-16 rounded-full ring-2 ring-white/40 object-cover"
            />
          )}
          <h1 className="text-2xl font-semibold">
            {corretor?.name ?? "Corretor"} • Imóveis à Venda
          </h1>
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
    </LayoutCorretor>
  );
}
