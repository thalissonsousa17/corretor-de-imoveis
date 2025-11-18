import type { GetServerSideProps } from "next";
import Link from "next/link";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";
import CarrosselDestaques from "@/components/CarrosselDestaques";

type Foto = { id: string; url: string };
type Imovel = {
  id: string;
  titulo: string;
  status: string;
  finalidade: string;
  preco: number;
  cidade: string;
  estado: string;
  fotos: Foto[];
};

type Props = {
  slug: string;
  imoveis: Imovel[];
  corretor: CorretorProps | null;
  todos: Imovel[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  const [topoRes, aluguelRes, todosRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`),
    fetch(`${baseUrl}/api/public/corretor/${slug}?filtro=aluguel`),
    fetch(`${baseUrl}/api/public/corretor/${slug}/todos`),
  ]);

  if (!topoRes.ok || !aluguelRes.ok) return { notFound: true };

  const todosJson = todosRes.ok ? await todosRes.json() : { imoveis: [] };

  const topo = await topoRes.json();
  const aluguel = await aluguelRes.json();

  return {
    props: {
      slug,
      imoveis: aluguel.imoveis,
      corretor: topo.corretor ?? null,
      todos: todosJson.imoveis,
    },
  };
};

export default function Aluguel({ slug, imoveis, corretor, todos }: Props) {
  const router = useRouter();

  return (
    <LayoutCorretor corretor={corretor}>
      <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
        <div className="flex items-center justify-end mb-6 mt-4 gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1A2A4F] text-white hover:text-[#D4AC3A] hover:bg-[#1A2A4F] rounded-lg transition font-medium cursor-pointer"
          >
            ← Voltar
          </button>
        </div>

        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <p>Nenhum imóvel para aluguel encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {imoveis.map((i) => {
              const capa = i.fotos?.[0]?.url;
              return (
                <article
                  key={i.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* FOTO */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={capa}
                      alt={i.titulo}
                      className="absolute inset-0 w-full h-full object-cover object-center 
      group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* BADGE FIXO PARA ALUGUEL */}
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      ALUGAR
                    </span>
                  </div>

                  {/* CONTEÚDO */}
                  <div className="p-5 space-y-3">
                    {/* TÍTULO */}
                    <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                      {i.titulo}
                    </h3>

                    {/* QUADRO DE DETALHES (IGUAL AO DA HOME) */}
                    <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-700">Tipo</p>
                        <p className="text-gray-600">Aluguel</p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-700">Status</p>
                        <p className="text-gray-600">{i.status}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-700">Cidade</p>
                        <p className="text-gray-600">{i.cidade}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-700">Preço</p>
                        <p className="text-gray-600">
                          {Number(i.preco).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* BOTÃO */}
                    <Link
                      href={`/${slug}/imovel/${i.id}`}
                      className="mt-4 inline-block w-full text-center rounded-xl bg-[#1A2A4F] text-white hover:text-[#D4AC3A] py-2 font-medium transition"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <CarrosselDestaques imoveis={todos} />
    </LayoutCorretor>
  );
}
