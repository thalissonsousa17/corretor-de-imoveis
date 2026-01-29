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
      <div className="bg-gray-100">
        {/* TOPO */}
        <section className="py-4 px-6 bg-white rounded-2xl shadow border p-6">
          <div className="flex justify-end">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-[#1A2A4F] text-white rounded-lg"
            >
              ← Voltar
            </button>
          </div>

          <h1 className="text-4xl font-semibold text-[#1A2A4F] mt-4">{imovel.titulo}</h1>
        </section>

        {/* GALERIA */}
        <main className="max-w-7xl mx-auto px-4 py-10">
          {fotos.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setIdx(0);
                    setOpen(true);
                  }}
                  className="lg:col-span-2 lg:row-span-2 rounded-xl overflow-hidden"
                >
                  <img src={resolveFotoUrl(fotos[0]?.url)} className="w-full h-full object-cover" />
                </button>

                {fotos.slice(1, 5).map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setIdx(i + 1);
                      setOpen(true);
                    }}
                    className="rounded-xl overflow-hidden"
                  >
                    <img src={resolveFotoUrl(f.url)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {fotos.length > 5 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
                  {fotos.slice(5).map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setIdx(i + 5);
                        setOpen(true);
                      }}
                      className="rounded-xl overflow-hidden"
                    >
                      <img src={resolveFotoUrl(f.url)} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white">
              ✕
            </button>
            <img
              src={resolveFotoUrl(fotos[idx]?.url)}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        )}

        {/* MAPA */}
        <section className="px-6 py-10 bg-white">
          <Mapa
            endereco={`${imovel.rua || ""} ${imovel.numero || ""}, ${imovel.cidade} - ${imovel.estado}`}
          />
        </section>

        <div className="bg-white p-10">
          <CarrosselDestaques imoveis={imoveis} />
          <NoticiasCarrossel />
        </div>
      </div>
    </LayoutCorretor>
  );
}
