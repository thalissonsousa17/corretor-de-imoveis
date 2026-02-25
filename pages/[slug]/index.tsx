import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import LayoutCorretor from "@/components/LayoutCorretor";
import ImovelCard from "@/components/ImovelCard";
import type { ImovelCardData } from "@/components/ImovelCard";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin, FaQuoteLeft } from "react-icons/fa";
import { MdEmail, MdPlayCircleOutline } from "react-icons/md";
import { FiArrowRight, FiSearch, FiChevronRight } from "react-icons/fi";
import { GetBaseUrl } from "@/lib/getBaseUrl";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import HeroSlider from "@/components/HeroSlider";
import LeadModal from "@/components/LeadModal";
import { resolveFotoUrl } from "@/lib/imageUtils";

type Corretor = {
  id: string; // Adicionado id para o LeadModal
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
  slogan?: string | null;
  accentColor?: string | null;
  videoUrl?: string | null;
  bioTitle?: string | null;
};

interface PageProps {
  corretor: Corretor;
  imoveis: ImovelCardData[];
}

type Filtro = "VENDA" | "ALUGUEL";

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<PageProps>> => {
  const slug = ctx.params?.slug as string;
  const baseUrl = GetBaseUrl();

  const res = await fetch(`${baseUrl}/api/public/corretor/${slug}`);
  if (!res.ok) return { notFound: true };

  const data = await res.json();
  return { props: { corretor: data.corretor, imoveis: data.imoveis } };
};

export default function CorretorHome({ corretor, imoveis }: PageProps) {
  const [safeHtml, setSafeHtml] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("VENDA");
  const [busca, setBusca] = useState("");
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);



  useEffect(() => {
    if (typeof window !== "undefined" && corretor.biografia) {
      setSafeHtml(DOMPurify.sanitize(corretor.biografia));
    } else {
      setSafeHtml("");
    }
  }, [corretor.biografia]);

  const handleSearch = () => {
    const section = document.getElementById("vitrine");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const imoveisFiltrados = imoveis.filter((i) => {
    const passaFiltro = i.finalidade === filtro && i.status === "DISPONIVEL";
    const termo = busca.toLowerCase();
    const passaBusca =
      i.titulo.toLowerCase().includes(termo) ||
      i.cidade.toLowerCase().includes(termo) ||
      i.estado.toLowerCase().includes(termo);
    return passaFiltro && passaBusca;
  });

  const totalVenda = imoveis.filter((i) => i.finalidade === "VENDA" && i.status === "DISPONIVEL").length;
  const totalAluguel = imoveis.filter((i) => i.finalidade === "ALUGUEL" && i.status === "DISPONIVEL").length;

  return (
    <LayoutCorretor corretor={corretor}>
      <Head>
        <title>{`${corretor?.name ?? "Corretor"} • Consultoria Imobiliária Premium`}</title>
        <meta name="description" content={corretor.biografia?.substring(0, 160)} />
      </Head>

      <div className="bg-white dark:bg-slate-950 transition-colors duration-500">
        {/* ══════ HERO CINEMÁTICO ══════ */}
        <HeroSlider 
          imoveis={imoveis.filter(i => i.status === "DISPONIVEL")}
          slogan={corretor.slogan}
          corretorName={corretor.name}
          accentColor={corretor.accentColor}
          slug={corretor.slug}
          onSearch={handleSearch}
          busca={busca}
          setBusca={setBusca}
        />

        {/* ══════ VITRINE DE IMÓVEIS ══════ */}
        <section id="vitrine" className="py-24 bg-white dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-xl">
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border"
                  style={{ 
                    backgroundColor: `${corretor.accentColor || "#1A2A4F"}15`, 
                    borderColor: `${corretor.accentColor || "#1A2A4F"}30`, 
                    color: "var(--accent-color)" 
                  }}
                >
                  Curadoria Exclusiva
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight">
                  Imóveis Selecionados <span className="text-slate-400 dark:text-slate-500">para o seu estilo de vida.</span>
                </h2>
              </div>
              
              {/* Filtros Pill-Style */}
              <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                <button
                  onClick={() => setFiltro("VENDA")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filtro === "VENDA" ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white shadow-xl shadow-slate-900/20" : "text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  Comprar ({totalVenda})
                </button>
                <button
                  onClick={() => setFiltro("ALUGUEL")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filtro === "ALUGUEL" ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white shadow-xl shadow-slate-900/20" : "text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  Alugar ({totalAluguel})
                </button>
              </div>
            </div>

            {/* Grid de Imóveis Premium */}
            {imoveisFiltrados.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5">
                  <FiSearch className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem resultados no momento</h3>
                  <p className="text-slate-400 text-sm">Tente ajustar seus filtros para encontrar o que busca.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {imoveisFiltrados.slice(0, 9).map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} slug={corretor.slug} />
                ))}
              </div>
            )}

            {imoveisFiltrados.length > 9 && (
              <div className="mt-16 text-center">
                 <Link
                    href={`/${corretor.slug}/${filtro === "VENDA" ? "vendas" : "aluguel"}`}
                    className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-2xl shadow-slate-900/20 hover:shadow-accent/30 group"
                 >
                    Ver coleção completa
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                 </Link>
              </div>
            )}
          </div>
        </section>

        {/* ══════ SEÇÃO DESEJA VENDER (CTA) ══════ */}
        <section className="py-24 bg-white dark:bg-slate-950">
           <div className="max-w-7xl mx-auto px-6">
              <div className="bg-slate-950 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/5">
                 {/* Decorative background */}
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/4 pointer-events-none" />
                 
                 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                       <span className="text-blue-200 text-accent dark:text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
                          Venda com Exclusividade
                       </span>
                       <h2 className="text-white text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                        Sua Propriedade merece uma <span className="text-accent dark:text-blue-200">Exposição de Classe Mundial.</span>
                      </h2>
                       <p className="text-white/70 dark:text-white/60 text-lg leading-relaxed max-w-md">
                          Utilizamos as ferramentas de marketing mais avançadas do setor para garantir que seu imóvel seja visto pelos compradores certos.
                       </p>
                    </div>
                    <div className="flex lg:justify-end">
                       <button 
                          onClick={() => setIsLeadModalOpen(true)}
                          className="group relative inline-flex items-center gap-6 px-12 py-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-accent hover:text-white dark:hover:shadow-[0_0_30px_rgba(var(--accent-color-rgb),0.3)] cursor-pointer transition-all shadow-2xl active:scale-95"
                       >
                          Desejo Vender meu Imóvel
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                            <FiChevronRight size={20} />
                          </div>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ══════ SEÇÃO SOBRE (EDITORIAL) ══════ */}
        <section className="py-32 relative overflow-hidden bg-white dark:bg-slate-950">
           <div className="absolute top-0 right-0 w-1/3 h-full bg-white dark:bg-slate-900/50 -z-10" />
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                 
                 {/* Lado da Imagem Editorial */}
                 <div className="lg:col-span-5 relative">
                    <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_48px_80px_rgba(0,0,0,0.15)] aspect-[4/5]">
                       <img 
                          src={resolveFotoUrl(corretor.avatarUrl)} 
                          alt={corretor.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                       />
                       {corretor.videoUrl && (
                         <a 
                           href={corretor.videoUrl} 
                           target="_blank" 
                           className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                         >
                            <MdPlayCircleOutline className="text-white/80 group-hover:scale-110 transition-transform" size={100} />
                         </a>
                       )}
                    </div>
                    {/* Badge de Autoridade */}
                    <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-[2rem] shadow-2xl hidden md:block z-20 border border-white/5">
                       <p className="text-slate-900 dark:text-white font-black text-3xl tracking-tighter italic">
                          {corretor.creci ? `CRECI ${corretor.creci}` : "Autoridade"}
                       </p>
                       <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Negócios de Valor</p>
                    </div>
                 </div>

                 {/* Lado do Conteúdo Editorial */}
                 <div className="lg:col-span-7">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                       Storytelling
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight mb-8">
                       {corretor.bioTitle ?? "Excelência em cada detalhe."}
                    </h2>
                    <div className="relative">
                       <FaQuoteLeft className="absolute -top-10 -left-10 text-slate-100 dark:text-slate-900/40 font-light" size={120} />
                       <div 
                          className="relative z-10 text-slate-600 text-lg leading-relaxed space-y-4 prose prose-slate"
                          dangerouslySetInnerHTML={{ __html: safeHtml }}
                       />
                    </div>

                    {/* Social Connect ghost buttons */}
                    <div className="mt-12 flex flex-wrap gap-4">
                       {corretor.instagram && (
                         <a href={`https://instagram.com/${corretor.instagram}`} target="_blank" className="flex items-center gap-3 px-6 py-4 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 hover:border-slate-900 dark:hover:border-white transition-all font-bold text-xs uppercase tracking-widest">
                            <FaInstagram size={18} /> Instagram
                         </a>
                       )}
                       {corretor.whatsapp && (
                         <a href={`https://wa.me/${corretor.whatsapp.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-3 px-6 py-4 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all font-bold text-xs uppercase tracking-widest">
                            <FaWhatsapp size={18} /> WhatsApp
                         </a>
                       )}
                       {corretor.facebook && (
                         <a href={`https://facebook.com/${corretor.facebook}`} target="_blank" className="flex items-center gap-3 px-6 py-4 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold text-xs uppercase tracking-widest">
                            <FaFacebook size={18} /> Facebook
                         </a>
                       )}
                       {corretor.linkedin && (
                         <a href={`https://linkedin.com/in/${corretor.linkedin}`} target="_blank" className="flex items-center gap-3 px-6 py-4 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 hover:border-slate-800 dark:hover:border-white transition-all font-bold text-xs uppercase tracking-widest">
                            <FaLinkedin size={18} /> LinkedIn
                         </a>
                       )}
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ══════ CARROSSEL DE DESTAQUES (REFINADO) ══════ */}
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
          <CarrosselDestaques imoveis={imoveis} />
        </div>
      </div>

      {/* ══════ MODAL DE CAPTAÇÃO ══════ */}
      <LeadModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        corretorId={corretor.id}
        corretorName={corretor.name}
      />
    </LayoutCorretor>
  );
}
