import LayoutCorretor from "@/components/LayoutCorretor";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import {
  RiInstagramLine,
  RiFacebookCircleLine,
  RiLinkedinLine,
  RiWhatsappLine,
} from "react-icons/ri";

/** Normaliza qualquer URL de imagem pra sempre servir via /api/uploads */
const resolveFotoUrl = (url?: string | null) => {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/api/uploads/")) return url;

  const fileName = url.split(/[\\/]/).pop();
  return fileName ? `/api/uploads/${fileName}` : "/placeholder.jpg";
};

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
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  const [corretorRes, todosRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`, { headers: { "cache-control": "no-cache" } }),
    fetch(`${baseUrl}/api/public/corretor/${slug}/todos`, {
      headers: { "cache-control": "no-cache" },
    }),
  ]);

  if (!corretorRes.ok) return { notFound: true };

  const corretorJson = await corretorRes.json();
  const todosJson = todosRes.ok ? await todosRes.json() : { imoveis: [] };

  // ✅ Normaliza corretor (avatar/banner/logo)
  const corretorRaw = corretorJson.corretor as Corretor;
  const corretor: Corretor = {
    ...corretorRaw,
    avatarUrl: resolveFotoUrl(corretorRaw.avatarUrl),
    bannerUrl: resolveFotoUrl(corretorRaw.bannerUrl),
    logoUrl: resolveFotoUrl(corretorRaw.logoUrl),
  };

  // ✅ Normaliza TODAS as fotos dos imóveis (isso mata o /uploads 404)
  const todos: ImovelCompleto[] = (todosJson.imoveis || []).map((im: ImovelCompleto) => ({
    ...im,
    fotos: (im.fotos || []).map((f) => ({
      ...f,
      url: resolveFotoUrl(f.url),
    })),
  }));

  return {
    props: {
      corretor,
      todos,
    },
  };
};

export default function PerfilProfissional({ corretor, todos }: Props) {
  const instagramUrl = buildSocialUrl(corretor.instagram, "instagram");
  const facebookUrl = buildSocialUrl(corretor.facebook, "facebook");
  const linkedinUrl = buildSocialUrl(corretor.linkedin, "linkedin");
  const whatsappUrl = buildSocialUrl(corretor.whatsapp, "whatsapp");

  return (
    <>
      <LayoutCorretor corretor={corretor}>
        <Head>
          <title>{`${corretor.name} • Perfil Profissional`}</title>
          <meta
            name="description"
            content={`Conheça a história, trajetória e informações profissionais de ${corretor.name}.`}
          />
        </Head>

        <div className="min-h-screen bg-white text-gray-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* FOTO DO CORRETOR */}
            <div className="flex justify-center lg:justify-start">
              <img
                src={corretor.avatarUrl || "/placeholder.jpg"}
                alt={corretor.name}
                className="w-full max-w-lg rounded-xl shadow-lg object-cover"
              />
            </div>

            {/* SEÇÃO DE TEXTO */}
            <div className="flex flex-col justify-start mt-4">
              {/* NOME */}
              <h1 className="text-5xl font-extrabold font-sans text-gray-900 tracking-tight uppercase leading-tight">
                {corretor.name}
              </h1>

              {/* PROFISSÃO */}
              <p className="mt-2 text-lg font-semibold text-gray-700 tracking-wide font-sans">
                CORRETOR IMÓVEIS
              </p>

              {/* CRECI */}
              <p className="mt-3 text-gray-700 font-medium">
                <span className="font-semibold text-lg mt-2 tracking-wide text-gray-700">
                  Creci {corretor.creci}
                </span>
              </p>

              {/* E-MAIL */}
              {corretor.email && (
                <p className="mt-3 text-gray-700 font-medium text-lg font-sans">{corretor.email}</p>
              )}

              {/* REDES SOCIAIS */}
              <div className="flex items-center gap-6 mt-6 text-3xl">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 hover:scale-110 transition-transform"
                  >
                    <RiInstagramLine />
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:scale-110 transition-transform"
                  >
                    <RiFacebookCircleLine />
                  </a>
                )}

                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:text-blue-900 hover:scale-110 transition-transform"
                  >
                    <RiLinkedinLine />
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:scale-110 transition-transform"
                  >
                    <RiWhatsappLine />
                  </a>
                )}
              </div>

              {/* BIOGRAFIA */}
              <div className="mt-10 text-lg leading-relaxed text-gray-800 max-w-2xl whitespace-pre-line font-sans">
                {corretor.biografia || "Biografia não preenchida."}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Agora o carrossel recebe fotos já normalizadas */}
        <CarrosselDestaques imoveis={todos} />
      </LayoutCorretor>
    </>
  );
}
