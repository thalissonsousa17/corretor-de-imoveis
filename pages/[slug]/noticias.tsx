import type { GetServerSideProps } from "next";
import Head from "next/head";
import LayoutCorretor from "@/components/LayoutCorretor";

type Noticia = {
  titulo: string;
  resumo: string;
  link: string;
  data?: string;
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

interface Props {
  corretor: Corretor;
  noticias: Noticia[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  const [corretorRes, noticiasRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`),
    fetch(`${baseUrl}/api/noticias-externas`),
  ]);

  if (!corretorRes.ok) return { notFound: true };

  const corretorJson = await corretorRes.json();
  const noticiasJson = noticiasRes.ok ? await noticiasRes.json() : { noticias: [] };

  return {
    props: {
      corretor: corretorJson.corretor,
      noticias: Array.isArray(noticiasJson) ? noticiasJson : [],
    },
  };
};

export default function NoticiasPage({ corretor, noticias }: Props) {
  return (
    <LayoutCorretor corretor={corretor}>
      <Head>
        <title>Notícias sobre financiamento • {corretor.name}</title>
        <meta
          name="description"
          content={`Acompanhe notícias atualizadas sobre financiamento imobiliário selecionadas para clientes de ${corretor.name}.`}
        />
      </Head>

      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold text-[#1A2A4F] text-center mb-10">
          Todas as notícias sobre financiamento
        </h1>

        {noticias.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma notícia encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {noticias.map((n, i) => (
              <div
                key={i}
                className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-5 flex flex-col justify-between h-56">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-2">{n.titulo}</h2>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-4">{n.resumo}</p>
                  </div>

                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A2A4F] font-semibold mt-4 hover:text-[#D4AC3A]"
                  >
                    Ler matéria completa →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </LayoutCorretor>
  );
}
