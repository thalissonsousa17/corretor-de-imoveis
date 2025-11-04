import type { GetServerSideProps } from "next";
import { useEffect, useState, useCallback } from "react";
import { toWaLink } from "@/lib/phone";
import Link from "next/link";

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
type Props = { imovel: Imovel; corretor: Corretor | null; slug: string };

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
    <div className="bg-gray-100">
      <>
        {/* Topo com banner */}
        <section className=" bg-gray-200 ">
          {/* {corretor?.bannerUrl && (
            <div className="absolute inset-0">
              <img src={corretor.bannerUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )} */}
          <div className="flex flex-col items-center justify-center p-10">
            {/* {corretor?.avatarUrl && (
              <img
                src={corretor.avatarUrl}
                className="w-14 h-14 rounded-full ring-2 ring-white/40 object-cover"
              />
            )} */}
            <div className="text-gray-700">
              {/* <h1 className="text-2xl font-bold">{imovel.titulo}</h1> */}
              {corretor?.name && (
                <p className="opacity-90 text-3xl ">
                  {corretor.name}
                  {corretor.creci ? ` • CRECI ${corretor.creci}` : ""}
                </p>
              )}
            </div>
            <div className="ml-auto flex gap-3 ">
              <Link href={`/${slug}`} className="rounded-xl text-gray-500 bg-white/10 px-4 py-2">
                Voltar
              </Link>
              {wa && (
                <a href={wa} target="_blank" className="rounded-xl bg-emerald-600 px-4 py-2">
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-10 bg-gray-200 rounded-2xl p-2 mt-4">
          {/* Galeria */}
          {fotos.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fotos.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setIdx(i);
                    setOpen(true);
                  }}
                  className="group rounded-xl overflow-hidden "
                >
                  <img
                    src={f.url}
                    alt={`Foto ${i + 1}`}
                    className="h-56 w-full object-cover group-hover:opacity-90 transition"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold">Descrição</h2>
              <p className="mt-2 text-zinc-700">{imovel.descricao}</p>
            </div>
            <aside className="rounded-2xl border text-gray-700 bg-white p-5">
              <p className="text-2xl font-semibold">
                {Number(imovel.preco).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-zinc-700 mt-1">
                {imovel.cidade} - {imovel.estado}
              </p>
              {(imovel.bairro || imovel.rua || imovel.numero) && (
                <p className="text-zinc-600 mt-1">
                  {[imovel.rua, imovel.numero, imovel.bairro].filter(Boolean).join(", ")}
                </p>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  className="mt-4 inline-block w-full text-center rounded-xl bg-black text-white py-2"
                >
                  Tenho interesse
                </a>
              )}
            </aside>
          </div>
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
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg "
            />
            <button
              onClick={next}
              className="absolute right-4 md:right-8 text-white text-3xl cursor-pointer border p-2 rounded-xl  hover:bg-gray-200 hover:text-gray-600"
            >
              ›
            </button>
          </div>
        )}
      </>
    </div>
  );
}
