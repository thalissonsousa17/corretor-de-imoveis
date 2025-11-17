import type { GetServerSideProps } from "next";
import Link from "next/link";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";

type Foto = { id: string; url: string };
type Imovel = {
  id: string;
  titulo: string;
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

  const [topoRes, aluguelRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`),
    fetch(`${baseUrl}/api/public/corretor/${slug}?filtro=aluguel`),
  ]);

  if (!topoRes.ok || !aluguelRes.ok) return { notFound: true };

  const topo = await topoRes.json();
  const aluguel = await aluguelRes.json();

  return {
    props: {
      slug,
      imoveis: aluguel.imoveis,
      corretor: topo.corretor ?? null,
    },
  };
};

export default function Aluguel({ slug, imoveis, corretor }: Props) {
  const router = useRouter();

  return (
    <LayoutCorretor corretor={corretor}>
      <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
        <div className="flex items-center justify-end mb-6 mt-4 gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1A2A4F] text-white hover:text-[#D4AC3A] hover:bg-[#1A2A4F] rounded-lg transition font-medium"
          >
            ← Voltar
          </button>
        </div>

        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <p>Nenhum imóvel para aluguel encontrado.</p>
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
                      className="mt-4 inline-block w-full text-center rounded-xl bg-[#1A2A4F] text-white hover:text-[#D4AC3A] py-2 transition"
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
