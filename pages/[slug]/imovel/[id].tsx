import type { GetServerSideProps } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";
import { getCorretorPublicData, getImoveisPublicData, getImovelPublicData } from "@/lib/publicData";
import { useEffect, useState, useCallback } from "react";
import { toWaLink } from "@/lib/phone";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import dynamic from "next/dynamic";
import CompartilharBotao from "@/components/CompartilharBotao";
import Head from "next/head";
import { FiArrowLeft, FiMapPin, FiHome, FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiDollarSign, FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaBed, FaBath, FaCar, FaRulerCombined } from "react-icons/fa";

const Mapa = dynamic(() => import("@/components/Mapa"), { ssr: false });

type Foto = { id: string; url: string };
type Imovel = {
  id: string; titulo: string; descricao: string; preco: number;
  cidade: string; estado: string; bairro?: string | null; rua?: string | null;
  numero: string; cep?: string | null; tipo: string;
  finalidade: "VENDA" | "ALUGUEL"; status: "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";
  fotos: Foto[]; quartos?: number | null; banheiros?: number | null;
  vagas?: number | null; areaTotal?: number | null; areaUtil?: number | null;
  condominio?: number | null; iptu?: number | null; anoConstrucao?: number | null;
  localizacao?: string | null;
};

type Props = {
  imovel: Imovel; corretor: CorretorProps; slug: string;
  imoveis: Imovel[]; urlCompartilhamento: string;
};

const tipoLabel: Record<string, string> = {
  APARTAMENTO: "Apartamento", CASA: "Casa", TERRENO: "Terreno", COMERCIAL: "Comercial",
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  try {
    const slug = ctx.params?.slug as string;
    const id = ctx.params?.id as string;
    const [imovel, corretor] = await Promise.all([
      getImovelPublicData(id),
      getCorretorPublicData(slug),
    ]);
    if (!imovel || !corretor) return { notFound: true };
    const imoveis = await getImoveisPublicData(corretor.id);
    const host = ctx.req.headers.host ?? "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`;
    return {
      props: { imovel, corretor, slug, imoveis, urlCompartilhamento: `${baseUrl}/${slug}/imovel/${id}` },
    };
  } catch (err) {
    console.error("[getServerSideProps /[slug]/imovel/[id]]", err);
    return { notFound: true };
  }
};

export default function ImovelDetalhe({ imovel, corretor, imoveis, urlCompartilhamento }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [descricaoHtml, setDescricaoHtml] = useState("");
  const router = useRouter();

  const fotos = imovel.fotos || [];
  const wa = toWaLink(corretor?.whatsapp || undefined);
  const vendido = imovel.status === "VENDIDO" || imovel.status === "ALUGADO";

  const prev = useCallback(() => setIdx((p) => (p - 1 + fotos.length) % fotos.length), [fotos.length]);
  const next = useCallback(() => setIdx((p) => (p + 1) % fotos.length), [fotos.length]);

  useEffect(() => {
    if (imovel.descricao) {
      import("dompurify").then((mod) => {
        const raw = imovel.descricao.trim().replace(/\n{2,}/g, "<br><br>").replace(/\n/g, " ");
        setDescricaoHtml(mod.default.sanitize(raw));
      });
    }
  }, [imovel.descricao]);

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

  const imagemOg = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/imovel?titulo=${encodeURIComponent(imovel.titulo)}&preco=${encodeURIComponent(Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))}&cidade=${encodeURIComponent(`${imovel.cidade} - ${imovel.estado}`)}&imagem=${encodeURIComponent(resolveFotoUrl(imovel.fotos?.[0]?.url))}`;
  const temEspecificacoes = imovel.quartos || imovel.banheiros || imovel.vagas || imovel.areaTotal || imovel.areaUtil;

  const specs = [
    { icon: <FaBed size={16} />, value: imovel.quartos, label: imovel.quartos === 1 ? "Quarto" : "Quartos" },
    { icon: <FaBath size={16} />, value: imovel.banheiros, label: imovel.banheiros === 1 ? "Banheiro" : "Banheiros" },
    { icon: <FaCar size={16} />, value: imovel.vagas, label: imovel.vagas === 1 ? "Vaga" : "Vagas" },
    { icon: <FaRulerCombined size={16} />, value: imovel.areaTotal, label: "m² total" },
  ].filter((s) => s.value != null && Number(s.value) > 0);

  return (
    <>
      <Head>
        <title>{imovel.titulo}</title>
        <meta property="og:title" content={imovel.titulo} />
        <meta property="og:description" content={`${imovel.cidade} - ${imovel.estado}`} />
        <meta property="og:url" content={urlCompartilhamento} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imagemOg} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <LayoutCorretor corretor={corretor}>
        <div className="bg-[#fafaf8] dark:bg-[#1a1814] min-h-screen transition-colors duration-500">

          {/* Sticky nav */}
          <div className="bg-[#fafaf8]/90 dark:bg-[#1a1814]/90 backdrop-blur-xl sticky top-0 z-30 border-b border-[#e8e4dc] dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#9c9890] hover:text-[#1a1814] dark:hover:text-white transition text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <FiArrowLeft size={14} />
                Voltar
              </button>
              <CompartilharBotao titulo={imovel.titulo} url={urlCompartilhamento} />
            </div>
          </div>

          {/* Gallery */}
          {fotos.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:h-[520px] overflow-hidden">
                <button
                  onClick={() => { setIdx(0); setOpen(true); }}
                  className="md:col-span-2 md:row-span-2 relative group overflow-hidden cursor-pointer"
                >
                  <img
                    src={resolveFotoUrl(fotos[0]?.url)}
                    alt="Foto principal"
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {vendido && (
                    <div className="absolute top-0 left-0 bg-rose-600 text-white px-5 py-2 font-black text-xs uppercase tracking-[0.2em]">
                      {imovel.status === "VENDIDO" ? "Vendido" : "Alugado"}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 md:hidden">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 text-white text-xs font-bold">
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    {i === 3 && fotos.length > 5 && (
                      <div className="absolute inset-0 bg-[#1a1814]/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-1">
                        <span
                          className="leading-none"
                          style={{ fontFamily: "var(--font-serif)", fontSize: "36px", fontWeight: 400 }}
                        >
                          +{fotos.length - 5}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Ver mais</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* Left column */}
              <div className="lg:col-span-2 space-y-10">

                {/* Título e badges */}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#b8912a] text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.28em]">
                      {imovel.finalidade === "VENDA" ? "Venda" : "Aluguel"}
                    </span>
                    <span className="bg-[#e8e4dc] dark:bg-white/5 text-[#9c9890] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.28em]">
                      {tipoLabel[imovel.tipo] || imovel.tipo}
                    </span>
                  </div>
                  <h1
                    className="text-[#1a1814] dark:text-white leading-tight"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400 }}
                  >
                    {imovel.titulo}
                  </h1>
                  <div className="flex items-center gap-2 text-[#9c9890] text-sm">
                    <FiMapPin size={14} className="text-[#b8912a] shrink-0" />
                    <span>
                      {[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")} — {imovel.cidade}, {imovel.estado}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                {temEspecificacoes && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {specs.map((s, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 p-5 flex flex-col items-center justify-center gap-3 hover:border-[#b8912a]/40 transition-all group"
                      >
                        <div className="text-[#b8912a]">{s.icon}</div>
                        <div className="text-center">
                          <p
                            className="text-[#1a1814] dark:text-white leading-none"
                            style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 400 }}
                          >
                            {s.value}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#9c9890] mt-1">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Descrição */}
                <div className="bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 p-8">
                  <h2 className="text-[#1a1814] dark:text-white font-bold text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-px bg-[#b8912a]" /> Descrição do Imóvel
                  </h2>
                  <div
                    className="text-[#6b6660] dark:text-white/60 leading-8 text-[15px]"
                    dangerouslySetInnerHTML={{ __html: descricaoHtml }}
                  />
                </div>

                {/* Informações adicionais */}
                {(imovel.areaUtil || imovel.condominio || imovel.iptu || imovel.anoConstrucao) && (
                  <div className="bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 p-8">
                    <h2 className="text-[#1a1814] dark:text-white font-bold text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-6 h-px bg-[#b8912a]" /> Informações Detalhadas
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {imovel.areaUtil != null && imovel.areaUtil > 0 && (
                        <div>
                          <p className="text-[#9c9890] text-[10px] font-bold uppercase tracking-wider mb-1">Área Útil</p>
                          <p className="text-[#1a1814] dark:text-white font-bold text-lg">{imovel.areaUtil} m²</p>
                        </div>
                      )}
                      {imovel.condominio != null && imovel.condominio > 0 && (
                        <div>
                          <p className="text-[#9c9890] text-[10px] font-bold uppercase tracking-wider mb-1">Condomínio</p>
                          <p className="text-[#1a1814] dark:text-white font-bold text-lg">
                            {imovel.condominio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      )}
                      {imovel.iptu != null && imovel.iptu > 0 && (
                        <div>
                          <p className="text-[#9c9890] text-[10px] font-bold uppercase tracking-wider mb-1">IPTU Anual</p>
                          <p className="text-[#1a1814] dark:text-white font-bold text-lg">
                            {imovel.iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      )}
                      {imovel.anoConstrucao != null && imovel.anoConstrucao > 0 && (
                        <div>
                          <p className="text-[#9c9890] text-[10px] font-bold uppercase tracking-wider mb-1">Ano de Construção</p>
                          <p className="text-[#1a1814] dark:text-white font-bold text-lg">{imovel.anoConstrucao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mapa */}
                <div className="bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#1a1814] dark:text-white font-bold text-sm uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-6 h-px bg-[#b8912a]" /> Localização
                    </h2>
                    {imovel.localizacao && (
                      <a
                        href={imovel.localizacao}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#b8912a] font-black uppercase tracking-widest hover:underline"
                      >
                        Abrir no Maps →
                      </a>
                    )}
                  </div>
                  <p className="text-[#9c9890] text-sm mb-6 flex items-start gap-2">
                    <FiMapPin size={14} className="shrink-0 mt-0.5" />
                    {[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")} — {imovel.cidade}/{imovel.estado}
                  </p>
                  <div className="w-full h-[400px] overflow-hidden border border-[#e8e4dc] dark:border-white/5">
                    <Mapa endereco={`${imovel.rua || ""} ${imovel.numero || ""}, ${imovel.bairro || ""}, ${imovel.cidade || ""} - ${imovel.estado || ""}, Brasil`} />
                  </div>
                </div>
              </div>

              {/* Right column — sticky */}
              <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">

                {/* Price card */}
                <div className="bg-[#1a1814] p-8 text-white border border-white/5">
                  <p className="text-[#9c9890] text-[10px] font-bold uppercase tracking-widest mb-2">
                    {imovel.finalidade === "VENDA" ? "Valor de Venda" : "Valor por Mês"}
                  </p>
                  <p
                    className={`leading-none mb-1 ${vendido ? "text-white/30" : "text-[#b8912a]"}`}
                    style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400 }}
                  >
                    {vendido
                      ? (imovel.status === "VENDIDO" ? "Vendido" : "Alugado")
                      : Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })
                    }
                  </p>
                  {imovel.condominio != null && imovel.condominio > 0 && !vendido && (
                    <p className="text-white/30 text-xs mt-2">
                      + {imovel.condominio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} condomínio
                    </p>
                  )}

                  {!vendido && wa && (
                    <div className="mt-8 space-y-3">
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-[#b8912a] text-white py-4 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#1a1814] transition-all"
                      >
                        <FaWhatsapp size={18} /> Agendar Visita
                      </a>
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full border border-white/10 text-white/60 py-3 font-bold text-xs uppercase tracking-widest hover:border-white/30 hover:text-white transition-all"
                      >
                        <FiPhone size={14} /> Falar com Corretor
                      </a>
                    </div>
                  )}
                </div>

                {/* Corretor card */}
                <div className="bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {corretor.avatarUrl ? (
                        <img
                          src={resolveFotoUrl(corretor.avatarUrl)}
                          alt={corretor.name}
                          className="w-14 h-14 object-cover border border-[#e8e4dc] dark:border-white/5"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#1a1814] dark:bg-white/5 flex items-center justify-center text-white font-black text-xl">
                          {corretor.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#231f18]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1814] dark:text-white text-sm leading-tight">{corretor.name}</p>
                      <p className="text-[#b8912a] text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <FiHome size={9} /> Corretor Especialista
                      </p>
                      {corretor.creci && (
                        <p className="text-[#9c9890] text-[10px] mt-0.5">CRECI {corretor.creci}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Lightbox */}
          {open && (
            <div className="fixed inset-0 z-50 bg-[#1a1814]/98 flex items-center justify-center backdrop-blur-md">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white p-3 cursor-pointer z-10 bg-white/5 hover:bg-white/10 transition-all"
              >
                <FiX size={22} />
              </button>
              <button
                onClick={prev}
                className="absolute left-4 md:left-10 text-white/40 hover:text-white p-4 cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
              >
                <FiChevronLeft size={36} />
              </button>
              <div className="flex flex-col items-center gap-6 max-h-[90vh] max-w-[90vw]">
                <img
                  src={resolveFotoUrl(fotos[idx]?.url)}
                  className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
                  alt="Foto ampliada"
                />
                <div className="bg-white/5 px-4 py-2 border border-white/10">
                  <p className="text-white text-xs font-bold tracking-widest">{idx + 1} / {fotos.length}</p>
                </div>
              </div>
              <button
                onClick={next}
                className="absolute right-4 md:right-10 text-white/40 hover:text-white p-4 cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
              >
                <FiChevronRight size={36} />
              </button>
            </div>
          )}

          {/* Imóveis similares */}
          <CarrosselDestaques imoveis={imoveis} />
        </div>
      </LayoutCorretor>
    </>
  );
}
