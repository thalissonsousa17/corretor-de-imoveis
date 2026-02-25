import type { GetServerSideProps } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";
import { useEffect, useState, useCallback } from "react";
import { toWaLink } from "@/lib/phone";
import DOMPurify from "isomorphic-dompurify";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import dynamic from "next/dynamic";
import CompartilharBotao from "@/components/CompartilharBotao";
import Head from "next/head";
import { FiArrowLeft, FiMapPin, FiHome, FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiDollarSign } from "react-icons/fi";
import { FaWhatsapp, FaBed, FaBath, FaCar, FaRulerCombined } from "react-icons/fa";

const Mapa = dynamic(() => import("@/components/Mapa"), { ssr: false });



type Foto = { id: string; url: string };
type Imovel = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  cidade: string;
  estado: string;
  bairro?: string | null;
  rua?: string | null;
  numero: string;
  cep?: string | null;
  tipo: string;
  finalidade: "VENDA" | "ALUGUEL";
  status: "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";
  fotos: Foto[];
  quartos?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  areaTotal?: number | null;
  areaUtil?: number | null;
  condominio?: number | null;
  iptu?: number | null;
  anoConstrucao?: number | null;
  localizacao?: string | null;
};

type Props = {
  imovel: Imovel;
  corretor: CorretorProps;
  slug: string;
  imoveis: Imovel[];
  urlCompartilhamento: string;
};

const tipoLabel: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const id = ctx.params?.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  const [resImovel, resCorretor] = await Promise.all([
    fetch(`${baseUrl}/api/public/imovel/${id}`, { headers: { "cache-control": "no-cache" } }),
    fetch(`${baseUrl}/api/public/corretor/${slug}`, { headers: { "cache-control": "no-cache" } }),
  ]);

  if (!resImovel.ok || !resCorretor.ok) return { notFound: true };

  const dataImovel = await resImovel.json();
  const dataCorretor = await resCorretor.json();

  return {
    props: {
      imovel: dataImovel.imovel,
      corretor: dataCorretor.corretor,
      slug,
      imoveis: dataCorretor.imoveis,
      urlCompartilhamento: `${baseUrl}/${slug}/imovel/${id}`,
    },
  };
};

export default function ImovelDetalhe({ imovel, corretor, imoveis, urlCompartilhamento }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const router = useRouter();

  const fotos = imovel.fotos || [];
  const wa = toWaLink(corretor?.whatsapp || undefined);
  const vendido = imovel.status === "VENDIDO" || imovel.status === "ALUGADO";

  const prev = useCallback(() => setIdx((p) => (p - 1 + fotos.length) % fotos.length), [fotos.length]);
  const next = useCallback(() => setIdx((p) => (p + 1) % fotos.length), [fotos.length]);

  useEffect(() => {
    if (imovel?.id) {
      fetch(`/api/public/imovel/${imovel.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [imovel?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  const imagemOg = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/imovel?titulo=${encodeURIComponent(
    imovel.titulo
  )}&preco=${encodeURIComponent(
    Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  )}&cidade=${encodeURIComponent(`${imovel.cidade} - ${imovel.estado}`)}&imagem=${encodeURIComponent(
    resolveFotoUrl(imovel.fotos?.[0]?.url)
  )}`;

  const temEspecificacoes = imovel.quartos || imovel.banheiros || imovel.vagas || imovel.areaTotal || imovel.areaUtil;

  return (
    <>
      <Head>
        <title>{imovel.titulo}</title>
        <meta property="og:title" content={imovel.titulo} />
        <meta
          property="og:description"
          content={`${imovel.cidade} - ${imovel.estado} • ${Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
        />
        <meta property="og:url" content={urlCompartilhamento} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imagemOg} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <LayoutCorretor corretor={corretor}>
        <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen transition-colors duration-500">
          {/* HEADER / NAVIGATION */}
          <br />
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-accent transition-all font-medium text-sm group cursor-pointer"
              >
                <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-accent/10 group-hover:text-blue-600 dark:group-hover:text-accent transition-colors">
                  <FiArrowLeft size={16} />
                </div>
                Voltar
              </button>
              <CompartilharBotao titulo={imovel.titulo} url={urlCompartilhamento} />
            </div>
          </div>

          {/* GALERIA PREMIUM */}
          {fotos.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-white">
                <button
                  onClick={() => { setIdx(0); setOpen(true); }}
                  className="md:col-span-2 md:row-span-2 relative group overflow-hidden cursor-pointer"
                >
                  <img
                    src={resolveFotoUrl(fotos[0]?.url)}
                    alt="Foto principal"
                    className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {vendido && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg tracking-wide animate-pulse">
                      {imovel.status === "VENDIDO" ? "VENDIDO" : "ALUGADO"}
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 right-6 md:hidden">
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium">
                      1 / {fotos.length} fotos
                    </span>
                  </div>
                </button>

                {fotos.slice(1, 5).map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => { setIdx(i + 1); setOpen(true); }}
                    className="relative group overflow-hidden hidden md:block cursor-pointer"
                  >
                    <img
                      src={resolveFotoUrl(f.url)}
                      alt={`Foto ${i + 2}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {i === 3 && fotos.length > 5 && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-1 transition-all group-hover:bg-slate-900/40">
                        <span className="font-bold text-2xl">+{fotos.length - 5}</span>
                        <span className="text-xs uppercase tracking-widest font-semibold opacity-80">Ver mais</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* CONTEÚDO PRINCIPAL */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* COLUNA ESQUERDA - DETALHES */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* Título e Tags */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {imovel.finalidade === "VENDA" ? "VENDA" : "ALUGUEL"}
                    </span>
                    <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tipoLabel[imovel.tipo] || imovel.tipo}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                    {imovel.titulo}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-3 rounded-xl shadow-sm inline-flex">
                    <FiMapPin className="text-accent" size={18} />
                    <span className="text-sm font-medium">
                      {[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")} — {imovel.cidade}, {imovel.estado}
                    </span>
                  </div>
                </div>

                {/* Cards de Características (Ícones) */}
                {temEspecificacoes && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imovel.quartos != null && imovel.quartos > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md hover:border-accent/20 group">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <FaBed size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{imovel.quartos}</p>
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                            {imovel.quartos === 1 ? "Quarto" : "Quartos"}
                          </p>
                        </div>
                      </div>
                    )}
                    {imovel.banheiros != null && imovel.banheiros > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md hover:border-accent/20 group">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <FaBath size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{imovel.banheiros}</p>
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                            {imovel.banheiros === 1 ? "Banheiro" : "Banheiros"}
                          </p>
                        </div>
                      </div>
                    )}
                    {imovel.vagas != null && imovel.vagas > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md hover:border-accent/20 group">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <FaCar size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{imovel.vagas}</p>
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                            {imovel.vagas === 1 ? "Vaga" : "Vagas"}
                          </p>
                        </div>
                      </div>
                    )}
                    {imovel.areaTotal != null && imovel.areaTotal > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md hover:border-accent/20 group">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <FaRulerCombined size={18} />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{imovel.areaTotal}</p>
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                            m² total
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Descrição */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-accent rounded-full" />
                    Descrição do Imóvel
                  </h2>
                  <div
                    className="text-slate-600 dark:text-slate-400 leading-8 whitespace-pre-line text-[16px] font-light"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        (imovel.descricao || "").trim().replace(/\n{2,}/g, "<br><br>").replace(/\n/g, " ")
                      ),
                    }}
                  />
                </div>

                {/* Detalhes Adicionais (Grade) */}
                {(imovel.areaUtil || imovel.condominio || imovel.iptu || imovel.anoConstrucao) && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-accent rounded-full" />
                      Informações Detalhadas
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {imovel.areaUtil != null && imovel.areaUtil > 0 && (
                        <div className="space-y-1">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Área Útil</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5">
                             <FaRulerCombined className="text-slate-300" size={14} />
                             {imovel.areaUtil} m²
                          </p>
                        </div>
                      )}
                      {imovel.condominio != null && imovel.condominio > 0 && (
                        <div className="space-y-1">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Condomínio</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5">
                            <FiDollarSign className="text-emerald-500" size={16} />
                            {imovel.condominio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      )}
                      {imovel.iptu != null && imovel.iptu > 0 && (
                        <div className="space-y-1">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">IPTU (Anual)</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5">
                            <FiDollarSign className="text-amber-500" size={16} />
                            {imovel.iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      )}
                      {imovel.anoConstrucao != null && imovel.anoConstrucao > 0 && (
                        <div className="space-y-1">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ano Construção</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5">
                            <FiCalendar className="text-slate-300" size={16} />
                            {imovel.anoConstrucao}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Localização / Mapa */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <div className="w-1.5 h-6 bg-accent rounded-full" />
                       Onde Fica
                    </h2>
                    {imovel.localizacao && (
                      <a 
                        href={imovel.localizacao} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-accent font-bold hover:underline bg-accent/10 px-3 py-1.5 rounded-full"
                      >
                        Abrir no Google Maps
                      </a>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mb-6 flex items-start gap-2">
                    <FiMapPin className="text-slate-300 mt-0.5 shrink-0" size={16} />
                    <span>{[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")} — {imovel.cidade}/{imovel.estado}</span>
                  </p>
                  <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                    <Mapa
                      endereco={`${imovel.rua || ""} ${imovel.numero || ""}, ${imovel.bairro || ""}, ${imovel.cidade || ""} - ${imovel.estado || ""}, Brasil`}
                    />
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA - SIDEBAR CONVERSÃO */}
              <div className="space-y-6 lg:sticky lg:top-28 lg:self-start z-20">
                
                {/* Card de Preço e Contato */}
                <div className="bg-slate-950 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/40 transition-colors duration-700" />
                  
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                        {imovel.finalidade === "VENDA" ? "Valor de Investimento" : "Valor de Locatário"}
                      </p>
                      <p className={`text-4xl font-extrabold tracking-tight ${vendido ? "text-slate-500" : "text-[#D4AC3A]"}`}>
                        {vendido
                          ? (imovel.status === "VENDIDO" ? "VENDIDO" : "ALUGADO")
                          : Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      {imovel.condominio != null && imovel.condominio > 0 && !vendido && (
                        <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
                          <FiDollarSign size={14} />
                          + {imovel.condominio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de condomínio
                        </p>
                      )}
                    </div>

                    {!vendido && wa && (
                      <div className="pt-2">
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-emerald-500 text-white py-4 font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 text-base"
                        >
                          <FaWhatsapp size={22} className="animate-bounce" />
                          Agendar uma Visita
                        </a>
                        <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest leading-relaxed">
                          Fale agora mesmo com o corretor responsável e tire suas dúvidas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card do Corretor */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {corretor.avatarUrl ? (
                        <img
                          src={resolveFotoUrl(corretor.avatarUrl)}
                          alt={corretor.name}
                          className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-slate-50 dark:bg-slate-800"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                          {corretor.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">{corretor.name}</p>
                      <p className="text-accent text-[10px] font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                        <FiHome size={10} />
                        Corretor Especialista
                      </p>
                      {corretor.creci && (
                        <p className="text-slate-400 text-[10px] mt-0.5">CRECI {corretor.creci}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* LIGHTBOX MODAL */}
          {open && (
            <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
              <button 
                onClick={() => setOpen(false)} 
                className="absolute top-6 right-6 text-white/50 hover:text-white p-3 cursor-pointer z-10 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <FiX size={24} />
              </button>

              <button 
                onClick={prev} 
                className="absolute left-4 md:left-10 text-white/50 hover:text-white p-4 cursor-pointer bg-white/5 hover:bg-white/10 rounded-full transition-all group"
              >
                <FiChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="flex flex-col items-center gap-6 max-h-[90vh] max-w-[90vw]">
                <img
                  src={resolveFotoUrl(fotos[idx]?.url)}
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl ring-4 ring-white/10"
                  alt="Foto ampliada"
                />
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <p className="text-white text-sm font-medium tracking-widest">{idx + 1} / {fotos.length}</p>
                </div>
              </div>

              <button 
                onClick={next} 
                className="absolute right-4 md:right-10 text-white/50 hover:text-white p-4 cursor-pointer bg-white/5 hover:bg-white/10 rounded-full transition-all group"
              >
                <FiChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
          {/* Destaques Similares */}
          <div className="container mx-auto max-w-7xl pt-10 pb-20">
            <div className="px-4 sm:px-6">
              <div className="flex items-center gap-4 mb-4">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Imóveis Similares</h2>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
              </div>
              <CarrosselDestaques imoveis={imoveis} />
            </div>
          </div>
        </div>
      </LayoutCorretor>
    </>
  );
}
