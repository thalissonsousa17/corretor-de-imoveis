import LayoutCorretor from "@/components/LayoutCorretor";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getCorretorPublicData, getImoveisPublicData } from "@/lib/publicData";
import { resolveFotoUrl } from "@/lib/imageUtils";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import { FiMail, FiAward, FiPhone } from "react-icons/fi";
import { FaInstagram, FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";

type Corretor = {
  name: string;
  email?: string;
  creci?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  biografia?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
  slug: string;
};

type Foto = { id: string; url: string };

type ImovelCompleto = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  finalidade: string;
  cidade: string;
  estado: string;
  status: string;
  fotos: Foto[];
};

interface Props {
  corretor: Corretor;
  todos: ImovelCompleto[];
}

function buildSocialUrl(
  username?: string | null,
  type?: "instagram" | "linkedin" | "facebook" | "whatsapp"
): string | null {
  if (!username) return null;
  switch (type) {
    case "instagram": return `https://instagram.com/${username}`;
    case "linkedin": return `https://linkedin.com/in/${username}`;
    case "facebook": return username.startsWith("http") ? username : `https://facebook.com/${username}`;
    case "whatsapp": return `https://wa.me/55${username.replace(/\D/g, "")}`;
    default: return null;
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  try {
    const slug = ctx.params?.slug as string;
    const corretor = await getCorretorPublicData(slug);
    if (!corretor) return { notFound: true };
    const todos = await getImoveisPublicData(corretor.id);
    return { props: { corretor, todos } };
  } catch (err) {
    console.error("[getServerSideProps /[slug]/perfil]", err);
    return { notFound: true };
  }
};

export default function PerfilProfissional({ corretor, todos }: Props) {
  const instagramUrl = buildSocialUrl(corretor.instagram, "instagram");
  const facebookUrl = buildSocialUrl(corretor.facebook, "facebook");
  const linkedinUrl = buildSocialUrl(corretor.linkedin, "linkedin");
  const whatsappUrl = buildSocialUrl(corretor.whatsapp, "whatsapp");

  const totalImoveis = todos.length;
  const totalVendidos = todos.filter((i) => i.status === "VENDIDO").length;
  const totalDisponiveis = todos.filter((i) => i.status === "DISPONIVEL").length;

  return (
    <LayoutCorretor corretor={corretor}>
      <Head>
        <title>{`${corretor.name} • Perfil Profissional`}</title>
        <meta name="description" content={`Conheça a trajetória profissional de ${corretor.name}.`} />
      </Head>

      <div className="bg-[#fafaf8] dark:bg-[#1a1814] min-h-screen transition-colors duration-500">

        {/* Hero escuro */}
        <section className="bg-[#1a1814] pt-32 pb-0 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-end">

              {/* Foto — sobe do fundo */}
              <div className="lg:col-span-4 flex justify-center lg:justify-start">
                <div className="w-full max-w-[320px] overflow-hidden shadow-[0_-24px_80px_rgba(0,0,0,0.4)] aspect-[3/4]">
                  <img
                    src={resolveFotoUrl(corretor.avatarUrl)}
                    alt={corretor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-8 pb-16 lg:pl-16">
                <span className="text-[#b8912a] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                  Corretor de Imóveis
                </span>
                <h1
                  className="text-white leading-[1.0] mb-6"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 400 }}
                >
                  {corretor.name}
                </h1>

                {corretor.creci && (
                  <div className="flex items-center gap-2 mb-3 text-white/40">
                    <FiAward size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">CRECI {corretor.creci}</span>
                  </div>
                )}
                {corretor.email && (
                  <div className="flex items-center gap-2 mb-6 text-white/40">
                    <FiMail size={14} />
                    <span className="text-xs">{corretor.email}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-8 mb-8 border-t border-white/5 pt-8">
                  {[
                    { num: totalImoveis, label: "Total de Imóveis" },
                    { num: totalDisponiveis, label: "Disponíveis" },
                    { num: totalVendidos, label: "Vendidos" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p
                        className="text-white leading-none"
                        style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400 }}
                      >
                        {stat.num}
                      </p>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Redes sociais */}
                <div className="flex items-center gap-3">
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/40 hover:bg-[#b8912a] hover:border-[#b8912a] hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                      <FaInstagram size={14} /> Instagram
                    </a>
                  )}
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/40 hover:bg-[#b8912a] hover:border-[#b8912a] hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                      <FaFacebook size={14} /> Facebook
                    </a>
                  )}
                  {linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/40 hover:bg-[#b8912a] hover:border-[#b8912a] hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                      <FaLinkedin size={14} /> LinkedIn
                    </a>
                  )}
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#b8912a] border border-[#b8912a] text-white transition-all text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1814]">
                      <FaWhatsapp size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biografia */}
        {corretor.biografia && (
          <section className="py-24 bg-[#fafaf8] dark:bg-[#1a1814]">
            <div className="max-w-3xl mx-auto px-6">
              <span className="text-[#b8912a] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                Sobre
              </span>
              <h2
                className="text-[#1a1814] dark:text-white leading-[1.05] mb-8"
                style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400 }}
              >
                Trajetória Profissional
              </h2>
              <div className="w-12 h-px bg-[#b8912a] mb-8" />
              <p className="text-[#6b6660] dark:text-white/60 text-lg leading-relaxed whitespace-pre-line">
                {corretor.biografia}
              </p>

              {/* Contato CTA */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 mt-12 px-8 py-4 bg-[#1a1814] text-white text-xs font-black uppercase tracking-widest hover:bg-[#b8912a] transition-all"
                >
                  <FiPhone size={14} />
                  Entrar em Contato
                </a>
              )}
            </div>
          </section>
        )}

        {/* Carrossel */}
        <CarrosselDestaques imoveis={todos} />
      </div>
    </LayoutCorretor>
  );
}
