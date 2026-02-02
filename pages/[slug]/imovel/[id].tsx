import type { GetServerSideProps } from "next";
import { useEffect, useState, useCallback } from "react";
import { toWaLink } from "@/lib/phone";
import DOMPurify from "isomorphic-dompurify";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";
import { useRouter } from "next/router";
import CarrosselDestaques from "@/components/CarrosselDestaques";
import NoticiasCarrossel from "@/components/Noticias/NoticiasCarrossel";
import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("@/components/Mapa"), { ssr: false });

const resolveFotoUrl = (url?: string | null) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/api/uploads/")) return url;

  const fileName = url.split(/[\\/]/).pop();
  return fileName ? `/api/uploads/${fileName}` : "/placeholder.png";
};

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
};

type Props = {
  imovel: Imovel;
  corretor: CorretorProps;
  slug: string;
  imoveis: Imovel[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const id = ctx.params?.id as string;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;

  const resImovel = await fetch(`${baseUrl}/api/public/imovel/${id}`, {
    headers: { "cache-control": "no-cache" },
  });
  if (!resImovel.ok) return { notFound: true };
  const dataImovel = await resImovel.json();

  const resCorretor = await fetch(`${baseUrl}/api/public/corretor/${slug}`, {
    headers: { "cache-control": "no-cache" },
  });
  if (!resCorretor.ok) return { notFound: true };
  const dataCorretor = await resCorretor.json();

  return {
    props: {
      imovel: dataImovel.imovel,
      corretor: dataCorretor.corretor,
      slug,
      imoveis: dataCorretor.imoveis,
    },
  };
};

export default function ImovelDetalhe({ imovel, corretor, imoveis }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const router = useRouter();

  const fotos = imovel.fotos || [];
  const wa = toWaLink(corretor?.whatsapp || undefined);

  const prev = useCallback(
    () => setIdx((p) => (p - 1 + fotos.length) % fotos.length),
    [fotos.length]
  );

  const next = useCallback(() => setIdx((p) => (p + 1) % fotos.length), [fotos.length]);

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

  return (
    <LayoutCorretor corretor={corretor}>
      <div className="bg-gray-100 overflow-x-hidden">
        {/* TOPO */}
        <section className="py-4 px-6 bg-white rounded-2xl shadow border border-gray-100 p-6">
          <br />
          <div className="flex justify-start mb-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-[#1A2A4F] text-white hover:text-[#D4AC3A] rounded-lg transition font-medium"
            >
              ← Voltar
            </button>
          </div>
          <div className="flex items-center  justify-end mt-10 gap-4">
            <aside className="bg-[#1A2A4F] border border-gray-200 rounded-3xl shadow-sm p-6 w-full lg:w-[360px] shrink-0 lg:sticky lg:top-6">
              <p
                className={`text-2xl font-bold mb-1 ${
                  imovel.status === "VENDIDO"
                    ? "text-white bg-red-600 px-3 py-1 rounded-lg inline-block"
                    : "text-[#D4AC3A]"
                }`}
              >
                {imovel.status === "VENDIDO"
                  ? "VENDIDO"
                  : Number(imovel.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </p>

              <p className="text-[#D4AC3A] font-medium">
                {imovel.cidade} - {imovel.estado}
              </p>

              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block w-full text-center rounded-xl bg-[#D4AC3A] text-[#1A2A4F] hover:text-white py-2 font-medium transition"
                >
                  Tenho interesse
                </a>
              )}
            </aside>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-gray-700 text-center lg:text-left">
              <p className="text-4xl font-semibold text-[#1A2A4F]">{imovel.titulo}</p>
            </div>
          </div>
        </section>

        {/* GALERIA + DESCRIÇÃO */}
        <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            {/* GALERIA */}
            <div className="lg:pl-4">
              {fotos.length > 0 && (
                <div className="w-full">
                  <div
                    className="
                      grid 
                      grid-cols-1
                      sm:grid-cols-2
                      lg:grid-cols-4 lg:grid-rows-2
                      gap-3
                      lg:h-[420px]
                    "
                  >
                    {/* FOTO PRINCIPAL */}
                    <button
                      onClick={() => {
                        setIdx(0);
                        setOpen(true);
                      }}
                      className="
                        rounded-xl overflow-hidden shadow group
                        lg:col-span-2 lg:row-span-2
                        h-52 sm:h-64 lg:h-full
                      "
                    >
                      <img
                        src={resolveFotoUrl(fotos[0]?.url)}
                        alt="Foto principal"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </button>

                    {/* MINIATURAS */}
                    {fotos.slice(1, 5).map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setIdx(i + 1);
                          setOpen(true);
                        }}
                        className="rounded-xl overflow-hidden shadow group h-40 sm:h-48 lg:h-full"
                      >
                        <img
                          src={resolveFotoUrl(f.url)}
                          alt={`Foto ${i + 2}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </button>
                    ))}
                  </div>

                  {/* FOTOS EXTRAS */}
                  {fotos.length > 5 && (
                    <div
                      className="
                        grid 
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-5
                        gap-3
                        mt-3
                      "
                    >
                      {fotos.slice(5).map((f, i) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setIdx(i + 5);
                            setOpen(true);
                          }}
                          className="rounded-lg overflow-hidden shadow group h-32 sm:h-40 lg:h-24"
                        >
                          <img
                            src={resolveFotoUrl(f.url)}
                            alt={`Foto extra ${i + 6}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DESCRIÇÃO */}
            <div className="lg:pr-4">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Descrição</h2>

                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      (imovel.descricao || "")
                        .trim()
                        .replace(/\n{2,}/g, "<br>")
                        .replace(/\n/g, " ")
                    ),
                  }}
                />
              </div>

              <h2 className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mt-2 text-gray-700">
                <span className="font-bold">Endereço:</span> {imovel.rua}, {imovel.numero},{" "}
                {imovel.bairro} — {imovel.cidade} — {imovel.estado} — CEP: {imovel.cep}
              </h2>
            </div>
          </div>
        </main>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white text-xl cursor-pointer"
            >
              ✕
            </button>

            <button
              onClick={prev}
              className="absolute left-4 md:left-8 text-white text-3xl cursor-pointer border p-2 rounded-xl hover:bg-gray-200 hover:text-gray-600"
            >
              ‹
            </button>

            <img
              src={resolveFotoUrl(fotos[idx]?.url)}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              alt="Foto ampliada"
            />

            <button
              onClick={next}
              className="absolute right-4 md:right-8 text-white text-3xl cursor-pointer border p-2 rounded-xl hover:bg-gray-200 hover:text-gray-600"
            >
              ›
            </button>
          </div>
        )}

        {/* MAPA */}
        <main className="px-4 sm:px-8 lg:px-20 py-10">
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h1 className="text-xl sm:text-2xl text-[#1A2A4F] font-semibold mb-6">
              📍 Localização
            </h1>

            <div className="w-full h-[380px] sm:h-[450px] rounded-xl overflow-hidden">
              <Mapa
                endereco={`${imovel.rua || ""} ${imovel.numero || ""}, ${imovel.bairro || ""}, ${
                  imovel.cidade || ""
                } - ${imovel.estado || ""}, Brasil`}
              />
            </div>
          </section>
        </main>

        <div className="bg-white left-4 border p-10 text-center rounded-2xl">
          <CarrosselDestaques imoveis={imoveis} />
          <NoticiasCarrossel />
        </div>
      </div>
    </LayoutCorretor>
  );
}
