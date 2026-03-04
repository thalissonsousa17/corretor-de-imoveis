import LayoutCorretor from "@/components/LayoutCorretor";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getCorretorPublicData, getImoveisPublicData } from "@/lib/publicData";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import { FiMail, FiAward } from "react-icons/fi";
import {
  RiInstagramLine,
  RiFacebookCircleLine,
  RiLinkedinLine,
  RiWhatsappLine,
} from "react-icons/ri";



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
    case "instagram":
      return `https://instagram.com/${username}`;
    case "linkedin":
      return `https://linkedin.com/in/${username}`;
    case "facebook":
      return username.startsWith("http") ? username : `https://facebook.com/${username}`;
    case "whatsapp":
      return `https://wa.me/55${username.replace(/\D/g, "")}`;
    default:
      return null;
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

  const hasSocial = instagramUrl || facebookUrl || linkedinUrl || whatsappUrl;
  const totalImoveis = todos.length;
  const totalVendidos = todos.filter((i) => i.status === "VENDIDO").length;

  return (
    <LayoutCorretor corretor={corretor}>
      <Head>
        <title>{`${corretor.name} • Perfil Profissional`}</title>
        <meta name="description" content={`Conheça a trajetória profissional de ${corretor.name}.`} />
      </Head>

      <div className="bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
        {/* Hero */}
        <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Foto */}
            <div className="lg:col-span-2 flex justify-center">
              <img
                src={corretor.avatarUrl || "/placeholder.jpg"}
                alt={corretor.name}
                className="w-full max-w-sm rounded-2xl shadow-xl object-cover aspect-[3/4]"
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-3">
              <p className="text-[#D4AC3A] font-semibold text-sm tracking-wider uppercase mb-2">
                Corretor de Imóveis
              </p>

              <h1 className="text-4xl sm:text-5xl font-bold text-accent dark:text-white tracking-tight leading-tight">
                {corretor.name}
              </h1>

              {corretor.creci && (
                <div className="flex items-center gap-2 mt-3 text-gray-500 dark:text-slate-400">
                  <FiAward size={16} />
                  <span className="text-sm font-medium">CRECI {corretor.creci}</span>
                </div>
              )}

              {corretor.email && (
                <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-slate-400">
                  <FiMail size={16} />
                  <span className="text-sm">{corretor.email}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{totalImoveis}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Imóveis</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{totalVendidos}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Vendidos</p>
                </div>
              </div>

              {/* Redes sociais */}
              {hasSocial && (
                <div className="flex items-center gap-3 mt-6">
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-500 transition text-xl">
                      <RiInstagramLine />
                    </a>
                  )}
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 transition text-xl">
                      <RiFacebookCircleLine />
                    </a>
                  )}
                  {linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-800/10 hover:text-blue-800 transition text-xl">
                      <RiLinkedinLine />
                    </a>
                  )}
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-600/10 hover:text-green-600 transition text-xl">
                      <RiWhatsappLine />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Biografia */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-accent mb-6">Sobre mim</h2>
            <div className="text-gray-600 dark:text-slate-400 text-[15px] leading-relaxed whitespace-pre-line">
              {corretor.biografia || "Biografia não preenchida."}
            </div>
          </div>
        </section>

        {/* Carrossel */}
        <CarrosselDestaques imoveis={todos} />
      </div>
    </LayoutCorretor>
  );
}
