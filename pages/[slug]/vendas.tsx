import type { GetServerSideProps } from "next";
import Head from "next/head";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import ImovelCard from "@/components/ImovelCard";
import type { ImovelCardData } from "@/components/ImovelCard";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { getCorretorPublicData, getImoveisPublicData } from "@/lib/publicData";

type Props = {
  slug: string;
  imoveis: ImovelCardData[];
  corretor: CorretorProps | null;
  todos: ImovelCardData[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  try {
    const slug = ctx.params?.slug as string;
    const corretor = await getCorretorPublicData(slug);
    if (!corretor) return { notFound: true };

    const [imoveis, todos] = await Promise.all([
      getImoveisPublicData(corretor.id, { finalidade: "VENDA", status: "DISPONIVEL" }),
      getImoveisPublicData(corretor.id),
    ]);

    return { props: { slug, imoveis, corretor, todos } };
  } catch (err) {
    console.error("[getServerSideProps /[slug]/vendas]", err);
    return { notFound: true };
  }
};

export default function Vendas({ slug, imoveis, corretor, todos }: Props) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const filtrados = imoveis.filter((i) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      i.titulo.toLowerCase().includes(termo) ||
      i.cidade.toLowerCase().includes(termo) ||
      i.estado.toLowerCase().includes(termo)
    );
  });

  return (
    <LayoutCorretor corretor={corretor}>
      <Head>
        <title>{`${corretor?.name ?? "Corretor"} • Imóveis à Venda`}</title>
      </Head>

      <div className="bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-accent transition text-sm font-medium cursor-pointer"
            >
              <FiArrowLeft size={18} />
              Voltar
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Titulo + busca */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent">Imóveis à Venda</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{imoveis.length} {imoveis.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</p>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 gap-2 w-full sm:w-72">
              <FiSearch size={16} className="text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar imóvel..."
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid */}
          {filtrados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiSearch size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum imóvel encontrado</p>
              <p className="text-sm mt-1">Tente buscar com outros termos</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtrados.map((i) => (
                <ImovelCard key={i.id} imovel={i} slug={slug} />
              ))}
            </div>
          )}
        </main>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CarrosselDestaques imoveis={todos} />
        </div>
      </div>
    </LayoutCorretor>
  );
}
