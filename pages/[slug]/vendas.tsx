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

      <div className="bg-[#fafaf8] dark:bg-[#1a1814] min-h-screen transition-colors duration-500">

        {/* Page Hero */}
        <div className="bg-[#1a1814] pt-32 pb-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/40 hover:text-white transition text-xs font-bold uppercase tracking-widest mb-8 cursor-pointer"
            >
              <FiArrowLeft size={14} />
              Voltar
            </button>
            <span className="text-[#b8912a] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
              Curadoria Exclusiva
            </span>
            <h1
              className="text-white leading-[1.0] mb-4"
              style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 400 }}
            >
              Imóveis à{" "}
              <span className="text-[#9c9890]">Venda.</span>
            </h1>
            <p className="text-white/40 text-sm font-medium">
              {imoveis.length} {imoveis.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-16">
          {/* Search bar */}
          <div className="flex items-center bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 px-4 py-3 gap-3 mb-12 max-w-md">
            <FiSearch size={16} className="text-[#9c9890]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por localização ou título..."
              className="flex-1 bg-transparent text-sm text-[#1a1814] dark:text-white placeholder-[#9c9890] focus:outline-none"
            />
          </div>

          {/* Grid */}
          {filtrados.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#e8e4dc] dark:border-white/5">
              <FiSearch size={48} className="mx-auto mb-4 text-[#e8e4dc] dark:text-white/10" />
              <p className="text-[#1a1814] dark:text-white font-bold">Nenhum imóvel encontrado</p>
              <p className="text-[#9c9890] text-sm mt-1">Tente buscar com outros termos</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((i) => (
                <ImovelCard key={i.id} imovel={i} slug={slug} />
              ))}
            </div>
          )}
        </main>

        <CarrosselDestaques imoveis={todos} />
      </div>
    </LayoutCorretor>
  );
}
