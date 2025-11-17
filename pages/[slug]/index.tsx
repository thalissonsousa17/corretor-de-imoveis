import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toWaLink } from "@/lib/phone";
import HeaderCorretor from "@/components/Header";
import DOMPurify from "isomorphic-dompurify";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import LayoutCorretor from "@/components/LayoutCorretor";

type Foto = { id: string; url: string };
type Imovel = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  cidade: string;
  estado: string;
  tipo: string;
  finalidade: "VENDA" | "ALUGUEL";
  status: "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";
  fotos: Foto[];
};

type Corretor = {
  name: string;
  creci?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  email: string;
  biografia?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
  slug: string;
};

interface PageProps {
  corretor: Corretor;
  imoveis: Imovel[];
  texto?: string;
}
type Filtro = "VENDA" | "ALUGUEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<PageProps>> => {
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;
  const res = await fetch(`${baseUrl}/api/public/corretor/${slug}`);

  if (!res.ok) return { notFound: true };

  const data = await res.json();

  return { props: { corretor: data.corretor, imoveis: data.imoveis } };
};

export default function CorretorHome({ corretor, imoveis, texto }: PageProps) {
  const [safeHtml, setSafeHtml] = useState("");

  const wa = toWaLink(corretor.whatsapp);
  const [filtro, setFiltro] = useState<Filtro>("VENDA");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && corretor.biografia) {
      setSafeHtml(DOMPurify.sanitize(corretor.biografia));
    }
  }, [corretor.biografia]);

  const imoveisFiltrados = imoveis.filter((i) => {
    const passaFiltro =
      filtro === "VENDA" || filtro === "ALUGUEL"
        ? i.finalidade === filtro && i.status === "DISPONIVEL"
        : filtro === "VENDIDO"
          ? i.status === "VENDIDO"
          : false;

    const termo = busca.toLowerCase();
    const passaBusca =
      i.titulo.toLowerCase().includes(termo) ||
      i.cidade.toLowerCase().includes(termo) ||
      i.estado.toLowerCase().includes(termo);

    return passaFiltro && passaBusca;
  });

  return (
    <LayoutCorretor corretor={corretor}>
      <div>
        <HeaderCorretor corretor={corretor} />
        <Head>
          <title>{`${corretor?.name ?? "Corretor"} • Imóveis`}</title>
          <meta
            name="description"
            content={`Conheça os imóveis disponíveis com ${corretor.name}.`}
          />
        </Head>

        {/* Banner  */}

        {corretor?.bannerUrl && (
          <section className="relative w-full h-[530px] sm:h-screen overflow-hidden">
            <img
              src={corretor.bannerUrl}
              alt="Banner do corretor"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white ">
              <div className="mt-10 bg-white/90 backdrop-blur-md rounded-full flex items-center px-4 py-2 w-[90%] max-w-xl shadow-lg">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar imóvel, cidade, bairro..."
                  className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
                />
                <button
                  onClick={() => {
                    const section = document.getElementById("imoveis");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#1A2A4F] text-white hover:text-[#D4AC3A] px-6 py-2 rounded-full hover:bg-gray-800 transition text-sm sm:text-base cursor-pointer"
                >
                  Buscar
                </button>
              </div>

              {corretor.avatarUrl && (
                <div className="absolute bottom-0 right-6 md:right-12">
                  <img
                    src={corretor.avatarUrl ?? ""}
                    alt={corretor.name}
                    className="w-[300px] sm:w-[400px] md:w-[480px]  h-auto "
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* SEÇÃO DE IMÓVEIS */}
        <div>
          <div>
            <section id="imoveis" className="bg-white py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="flex items-center justify-center  text-3xl font-semibold text-gray-900 mb-6">
                  Imóveis em destaque
                </h2>

                {/* Listagem de cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {imoveisFiltrados.slice(0, 9).map((imovel) => {
                    const capa = imovel.fotos?.[0]?.url;
                    return (
                      <article
                        key={imovel.id}
                        className="bg-white border rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                      >
                        {capa && (
                          <img
                            src={capa}
                            alt={imovel.titulo}
                            className="h-56 w-full object-cover"
                          />
                        )}
                        <div className="p-4">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${
                              imovel.status === "VENDIDO"
                                ? "bg-red-100 text-red-700"
                                : imovel.finalidade === "VENDA"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {imovel.status === "VENDIDO"
                              ? "VENDIDOS"
                              : imovel.finalidade === "VENDA"
                                ? "À VENDA"
                                : "PARA ALUGAR"}
                          </span>

                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {imovel.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {imovel.cidade} - {imovel.estado}
                          </p>
                          <p className="text-lg font-semibold mt-2 text-gray-900">
                            {Number(imovel.preco).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>

                          <Link
                            href={`/${corretor.slug}/imovel/${imovel.id}`}
                            className="mt-4 inline-block w-full text-center rounded-xl bg-[#1A2A4F] text-white hover:text-[#D4AC3A] py-2 text-sm font-medium hover:bg-gray-800"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Botão "Ver mais..." */}
                <div className="flex justify-center mt-10">
                  <Link
                    href={`/${corretor.slug}/${filtro === "VENDA" ? "vendas" : "aluguel"}`}
                    className="px-6 py-2 border border-[#1A2A4F] text-[#1A2A4F] rounded-full hover:bg-[#1A2A4F] hover:text-[#D4AC3A] transition"
                  >
                    Ver mais...
                  </Link>
                </div>
              </div>
            </section>
          </div>
          <div className="bg-white">
            {/* HERO CLEAN */}
            <section id="perfil" className="relative bg-gray-100 py-20">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6">
                {/* Coluna texto */}
                <div className="flex-1 text-gray-700">
                  <h1 className="text-4xl font-bold mb-2">{corretor.name}</h1>
                  {corretor.creci && (
                    <p className="text-sm font-medium text-gray-600 mb-6">CRECI {corretor.creci}</p>
                  )}
                  {corretor.biografia && (
                    <div
                      className="
      text-gray-800 
      leading-relaxed 
      whitespace-pre-wrap 
      transition-all 
      duration-300 
      text-[clamp(0.9rem,1.2vw,1.1rem)] 
      sm:text-[clamp(1rem,1.1vw,1.15rem)] 
      md:text-[clamp(1rem,1vw,1.2rem)] 
      lg:text-[1.125rem] 
      xl:text-[1.15rem]
    "
                    >
                      {corretor.biografia}
                    </div>
                  )}

                  {/* Contatos */}
                  <div className="space-y-2 text-sm">
                    {corretor.whatsapp && (
                      <p>
                        <span className="font-medium">WhatsApp:</span>
                        <a
                          href={wa || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {corretor.whatsapp}
                        </a>
                      </p>
                    )}
                    {corretor.linkedin && (
                      <p>
                        <span className="font-medium">LinkedIn:</span>
                        <a
                          href={`https://linkedin.com/in/${corretor.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          @{corretor.linkedin}
                        </a>
                      </p>
                    )}
                  </div>
                  <div>
                    {corretor.instagram && (
                      <p>
                        <span className="font-medium">Instagram: </span>
                        <a
                          href={`https://instagram.com/${corretor.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          @{corretor.instagram}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Coluna avatar */}
                <div className="flex-1 flex justify-center md:justify-end">
                  {corretor.avatarUrl ? (
                    <img
                      src={corretor.avatarUrl}
                      alt={corretor.name}
                      className="w-80 h-auto rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-80 h-96 bg-gray-300 rounded-xl" />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LayoutCorretor>
  );
}
