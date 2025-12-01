import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toWaLink } from "@/lib/phone";
import HeaderCorretor from "@/components/Header";
import DOMPurify from "isomorphic-dompurify";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import LayoutCorretor from "@/components/LayoutCorretor";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import { FaWhatsapp, FaInstagram, FaFacebook, FaGlobeAmericas } from "react-icons/fa";

import { MdEmail } from "react-icons/md";

import "swiper/css";
import "swiper/css/navigation";

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

  // normalize whatsapp link to string | undefined to satisfy href typing
  const wa = toWaLink(corretor.whatsapp) ?? undefined;
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
                    className="w-[300px] sm:w-[400px] md:w-[280px]  h-auto "
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
                {/* <h2 className="flex items-center justify-center  text-3xl font-semibold text-gray-900 mb-6">
                  Imóveis em destaque
                </h2> */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A4F]">
                    Imóveis em Destaque
                    {/* <span className="text-[#D4AC3A]">Destaque</span> */}
                  </h2>
                  <div className="w-20 h-1 bg-[#1A2A4F] mx-auto mt-3 rounded-full"></div>
                </div>
                {/* <h2 className="text-center text-3xl md:text-4xl font-bold text-[#1A2A4F] mb-10 tracking-tight">
                  Imóveis <span className="text-[#D4AC3A]">em Destaque</span>
                </h2> */}

                {/* Listagem de cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {imoveisFiltrados.slice(0, 9).map((imovel) => {
                    const capa = imovel.fotos?.[0]?.url;
                    return (
                      // card do imóvel
                      <article
                        key={imovel.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                      >
                        {/* Imagem */}
                        <div className="relative h-56 w-full overflow-hidden">
                          <img
                            src={capa}
                            alt={imovel.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Badge */}
                          <span
                            className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow
        ${
          imovel.status === "VENDIDO"
            ? "bg-red-600 text-white"
            : imovel.finalidade === "VENDA"
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white"
        }
      `}
                          >
                            {imovel.status === "VENDIDO"
                              ? "VENDIDO"
                              : imovel.finalidade === "VENDA"
                                ? "À VENDA"
                                : "ALUGUEL"}
                          </span>
                        </div>

                        {/* CONTEÚDO */}
                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                            {imovel.titulo}
                          </h3>

                          {/* Rodapé estilo "Winter Garden" */}
                          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div>
                              <p className="font-semibold text-gray-700">Tipo</p>
                              <p className="text-gray-600">
                                {imovel.finalidade === "VENDA" ? "Venda" : "Aluguel"}
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold text-gray-700">Status</p>
                              <p className="text-gray-600">{imovel.status}</p>
                            </div>

                            <div>
                              <p className="font-semibold text-gray-700">Cidade</p>
                              <p className="text-gray-600">{imovel.cidade}</p>
                            </div>

                            <div>
                              <p className="font-semibold text-gray-700">Preço</p>
                              <p className="text-gray-600">
                                {Number(imovel.preco).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Botão */}
                          <Link
                            href={`/${corretor.slug}/imovel/${imovel.id}`}
                            className="mt-4 inline-block w-full text-center rounded-xl bg-[#1A2A4F] text-white hover:text-[#D4AC3A] py-2 font-medium transition"
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
          {/* BIOGRAFIA  */}
          <div className="bg-white">
            {/* HERO CLEAN */}
            <section id="perfil" className="relative bg-gray-100 py-20">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6">
                {/* Coluna texto */}
                <div className="flex-1 text-gray-700">
                  {/* NOME + CRECI */}
                  <h1 className="text-4xl font-bold text-[#1A2A4F] mb-1">{corretor.name}</h1>

                  {corretor.creci && (
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mb-6">
                      CRECI {corretor.creci}
                    </p>
                  )}

                  {/* BIOGRAFIA FORMATADA */}
                  {corretor.biografia && (
                    <div
                      className="
    text-gray-800 
    leading-relaxed 
    whitespace-pre-wrap   /* ← mantém exatamente como o usuário escreveu */
    text-[clamp(1rem,1vw,1.15rem)]
  "
                    >
                      {corretor.biografia}
                    </div>
                  )}

                  {/* REDES SOCIAIS / CONTATOS */}
                  <div className="mt-10">
                    {/* <h3 className="text-lg font-semibold text-[#1A2A4F] flex items-center gap-2 mb-4">
                      <FaGlobeAmericas className="text-blue-500 text-xl" />
                      Contatos
                    </h3> */}

                    <div className="flex items-center gap-4">
                      {/* EMAIL */}
                      {corretor.email && (
                        <a
                          href={`mailto:${corretor.email}`}
                          className="p-3 rounded-full bg-white  hover:bg-gray-100 shadow-sm 
        transition flex items-center justify-center"
                          title="Enviar e-mail"
                        >
                          <MdEmail className="text-red-500 text-2xl" />
                        </a>
                      )}

                      {/* INSTAGRAM */}
                      {corretor.instagram && (
                        <a
                          href={`https://instagram.com/${corretor.instagram}`}
                          target="_blank"
                          className="p-3 rounded-full bg-white  hover:bg-gray-100 shadow-sm 
        transition flex items-center justify-center"
                          title="Instagram"
                        >
                          <FaInstagram className="text-pink-600 text-2xl" />
                        </a>
                      )}

                      {/* FACEBOOK */}
                      {corretor.facebook && (
                        <a
                          href={`https://facebook.com/${corretor.facebook}`}
                          target="_blank"
                          className="p-3 rounded-full bg-white  hover:bg-gray-100 shadow-sm 
        transition flex items-center justify-center"
                          title="Facebook"
                        >
                          <FaFacebook className="text-blue-600 text-2xl" />
                        </a>
                      )}

                      {/* WHATSAPP */}
                      {corretor.whatsapp && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-white  hover:bg-gray-100 shadow-sm 
        transition flex items-center justify-center"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="text-green-600 text-2xl" />
                        </a>
                      )}
                    </div>
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
            {/* CARROSSEL DE IMÓVEIS – DESTAQUES */}
            <section className="bg-white py-14">
              <h2 className="text-center text-3xl font-bold text-white mb-8">
                Destaques para você
              </h2>

              <div className="max-w-7xl mx-auto px-4 relative">
                {/* BOTÃO ESQUERDA */}
                <button
                  className="
        absolute left-0 top-1/2 -translate-y-1/2 z-10
        p-3 rounded-full bg-black/40 hover:bg-black/60
        text-white shadow-lg cursor-pointer hidden md:block
      "
                  id="btn-prev"
                >
                  ‹
                </button>

                {/* BOTÃO DIREITA */}
                <button
                  className="
        absolute right-0 top-1/2 -translate-y-1/2 z-10
        p-3 rounded-full bg-black/40 hover:bg-black/60
        text-white shadow-lg cursor-pointer hidden md:block
      "
                  id="btn-next"
                >
                  ›
                </button>

                <Swiper
                  modules={[Autoplay, Navigation]}
                  navigation={{
                    prevEl: "#btn-prev",
                    nextEl: "#btn-next",
                  }}
                  autoplay={{ delay: 2200, disableOnInteraction: false }}
                  loop={true}
                  grabCursor={true}
                  spaceBetween={20}
                  breakpoints={{
                    0: { slidesPerView: 1.2 },
                    640: { slidesPerView: 1.6 },
                    768: { slidesPerView: 2.2 },
                    1024: { slidesPerView: 3.1 },
                  }}
                  className="pb-8"
                >
                  {imoveis.slice(0, 12).map((imovel) => {
                    const capa = imovel.fotos?.[0]?.url;

                    return (
                      <SwiperSlide key={imovel.id} className="group">
                        <div
                          className="
                relative rounded-2xl overflow-hidden shadow-xl
                transition-all duration-300 group-hover:scale-105
              "
                        >
                          {capa && (
                            <img
                              src={capa}
                              alt={imovel.titulo}
                              className="w-full h-60 object-cover"
                            />
                          )}

                          {/* GRADIENTE */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                          {/* TEXTO SOBREPOSTO */}
                          <div className="absolute bottom-3 left-3 text-white">
                            <h3 className="font-bold text-lg drop-shadow-sm line-clamp-1">
                              {imovel.titulo}
                            </h3>
                            <p className="text-sm opacity-90 line-clamp-1">
                              {imovel.cidade} - {imovel.estado}
                            </p>
                            <p className="text-yellow-400 font-bold mt-1 text-[15px]">
                              {Number(imovel.preco).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>

                          {/* LABEL */}
                          <span
                            className={`
                  absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full
                  ${
                    imovel.status === "VENDIDO"
                      ? "bg-red-500 text-white"
                      : imovel.finalidade === "VENDA"
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white"
                  }
                `}
                          >
                            {imovel.status === "VENDIDO"
                              ? "VENDIDO"
                              : imovel.finalidade === "VENDA"
                                ? "À VENDA"
                                : "ALUGUEL"}
                          </span>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LayoutCorretor>
  );
}
