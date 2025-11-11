import type { GetServerSideProps } from "next";
import { useEffect, useState, useCallback } from "react";
import { toWaLink } from "@/lib/phone";
import Mapa from "@/components/Mapa";
import DOMPurify from "isomorphic-dompurify";
import Footer from "@/components/Footer";
import LayoutCorretor from "@/components/LayoutCorretor";
import type { CorretorProps } from "@/components/LayoutCorretor";

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
  numero?: string | null;
  cep?: string | null;
  tipo: string;
  finalidade: "VENDA" | "ALUGUEL";
  status: "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";
  fotos: Foto[];
};
type Corretor = {
  name?: string | null;
  creci?: string | null;
  slug: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  whatsapp?: string | null;
};
type Props = { imovel: Imovel; corretor: CorretorProps | null; slug: string };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const id = ctx.params?.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${ctx.req.headers.host}`;
  const res = await fetch(`${baseUrl}/api/public/imovel/${id}`);
  if (!res.ok) return { notFound: true };
  const data = await res.json();
  return { props: { imovel: data.imovel, corretor: data.corretor, slug } };
};

export default function ImovelDetalhe({ imovel, corretor, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

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
    <LayoutCorretor corretor={corretor ?? undefined}>
      <div className="bg-gray-100">
        <>
          {/* Topo com banner */}
          <section className=" py-4 px-6 bg-white rounded-2xl shadow border border-gray-100 p-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* LADO ESQUERDO - Nome do corretor */}
              <div className="text-gray-700 text-center lg:text-left">
                {corretor?.name && (
                  <p className="text-3xl font-semibold text-gray-800">
                    {corretor.name}
                    {corretor.creci && (
                      <span className="text-gray-500 text-lg font-normal">
                        {" "}
                        • CRECI {corretor.creci}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* LADO DIREITO - Bloco de informações e botão */}
              <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-sm">
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {Number(imovel.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>

                <p className="text-gray-700">
                  {imovel.cidade} - {imovel.estado}
                </p>

                {(imovel.bairro || imovel.rua || imovel.numero) && (
                  <p className="text-gray-500 text-sm mt-1">
                    {[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")}
                  </p>
                )}

                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block w-full text-center rounded-xl bg-black text-white py-2 font-medium hover:bg-gray-800 transition"
                  >
                    Tenho interesse
                  </a>
                )}
              </aside>
            </div>
          </section>

          {/* Info principal e descrição */}
          <main className="flex-1 w-full max-w-8xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              {/* GALERIA DE IMAGENS */}
              <div className="lg:pl-4">
                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotos.map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setIdx(i);
                          setOpen(true);
                        }}
                        className="group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={f.url}
                          alt={`Foto ${i + 1}`}
                          className="h-48 w-full object-cover group-hover:opacity-90 transition"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DESCRIÇÃO DETALHADA */}
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
              </div>
            </div>
          </main>
          <main className="px-40 py-10 ">
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h1 className="text-2xl text-gray-700 font-semibold mb-6 ">📍 Localização</h1>
              <Mapa
                endereco={`${imovel.rua || ""}, ${imovel.numero || ""}, ${imovel.bairro || ""}, ${
                  imovel.cidade || ""
                } - ${imovel.estado || ""}`}
              />
            </section>
          </main>

          {/* Modal + Carrossel */}
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
                src={fotos[idx].url}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              />
              <button
                onClick={next}
                className="absolute right-4 md:right-8 text-white text-3xl cursor-pointer border p-2 rounded-xl hover:bg-gray-200 hover:text-gray-600"
              >
                ›
              </button>
            </div>
          )}
        </>
      </div>
    </LayoutCorretor>
  );
}
