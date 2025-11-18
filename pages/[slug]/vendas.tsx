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
  descricao: string;
  preco: number;
  finalidade: string;
  cidade: string;
  estado: string;
  status: string;
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

  // Pegamos os dados do corretor e os imóveis
  const [topoRes, vendasRes, todosRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/corretor/${slug}`),
    fetch(`${baseUrl}/api/public/corretor/${slug}/vendas`),
    fetch(`${baseUrl}/api/public/corretor/${slug}/todos`),
  ]);

  if (!topoRes.ok || !vendasRes.ok) return { notFound: true };
  const todosJson = todosRes.ok ? await todosRes.json() : { imoveis: [] };

  const topo = await topoRes.json();
  const vendas = await vendasRes.json();

  return {
    props: {
      slug,
      imoveis: vendas.imoveis,
      corretor: topo?.corretor ?? null,
      todos: todosJson.imoveis,
    },
  };
};

export default function Vendas({ slug, imoveis, corretor, todos }: Props) {
  const router = useRouter();
  return (
    <LayoutCorretor corretor={corretor}>
      {/* Listagem de imóveis */}
      <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
        <div className="flex items-center justify-end mb-6 mt-4 gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1A2A4F] text-white hover:text-[#D4AC3A] hover:bg-[#1A2A4F] rounded-lg transition font-medium cursor-pointer "
          >
            ← Voltar
          </button>
        </div>
        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <p>Nenhum imóvel encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {imoveis.map((i) => {
              const capa = i.fotos?.[0]?.url;

              // BADGE LABEL
              const badgeLabel =
                i.status === "VENDIDO"
                  ? "VENDIDO"
                  : i.status === "ALUGADO"
                    ? "ALUGADO"
                    : i.finalidade === "VENDA"
                      ? "À VENDA"
                      : "ALUGUEL";

              // BADGE COLOR
              const badgeColor =
                i.status === "VENDIDO"
                  ? "bg-red-600"
                  : i.status === "ALUGADO"
                    ? "bg-yellow-600"
                    : i.finalidade === "VENDA"
                      ? "bg-green-600"
                      : "bg-blue-600";

              return (
                <article
                  key={i.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Imagem */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={capa}
                      alt={i.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow
        ${
          i.status === "VENDIDO"
            ? "bg-red-600 text-white"
            : i.finalidade === "VENDA"
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white"
        }
      `}
                    >
                      {i.status === "VENDIDO"
                        ? "VENDIDO"
                        : i.finalidade === "VENDA"
                          ? "À VENDA"
                          : "ALUGUEL"}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                      {i.titulo}
                    </h3>

                    {/* Rodapé tipo "Winter Garden" */}
                    <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-700">Tipo</p>
                        <p className="text-gray-600">
                          {i.finalidade === "VENDA" ? "Venda" : "Aluguel"}
                        </p>
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

                    {/* Botão */}
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
        <CarrosselDestaques imoveis={todos} />
      </main>
    </LayoutCorretor>
  );
}
