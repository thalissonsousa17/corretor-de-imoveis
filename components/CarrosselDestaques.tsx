"use client";

import React, { useId, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { resolveFotoUrl } from "@/lib/imageUtils";
import { FiChevronLeft, FiChevronRight, FiMapPin } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";

type Foto = { url: string };

type Imovel = {
  id: string;
  titulo: string;
  preco: number;
  cidade: string;
  estado: string;
  status: string;
  finalidade: string;
  fotos?: Foto[];
  fotoPrincipal?: string | null;
};

export default function CarrosselDestaques({ imoveis }: { imoveis: Imovel[] }) {
  const uid = useId();
  const prevId = `btn-prev-${uid}`;
  const nextId = `btn-next-${uid}`;

  const destaques = useMemo(() => {
    if (!imoveis?.length) return [];
    return imoveis.filter((i) => i.status !== "VENDIDO");
  }, [imoveis]);

  if (!destaques.length) return null;

  const canLoop = destaques.length > 1;

  return (
    <section className="bg-[#fafaf8] dark:bg-[#1a1814] py-28 transition-colors duration-500 overflow-hidden border-t border-[#e8e4dc] dark:border-white/5">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] mb-5 border border-[#e8e4dc] dark:border-white/5 bg-white dark:bg-[#231f18] text-[#b8912a]">
              Seleção Premium
            </span>
            <h2
              className="text-4xl md:text-6xl text-[#1a1814] dark:text-white leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Destaques{" "}
              <span className="text-[#9c9890] dark:text-white/30">para você.</span>
            </h2>
          </div>

          {/* Nav buttons — alinhados à direita do título */}
          <div className="hidden lg:flex items-center gap-3 pb-1">
            <button
              id={prevId}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/10 text-[#1a1814] dark:text-white hover:bg-[#b8912a] hover:border-[#b8912a] hover:text-white flex items-center justify-center transition-all duration-300 active:scale-95"
              aria-label="Anterior"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              id={nextId}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/10 text-[#1a1814] dark:text-white hover:bg-[#b8912a] hover:border-[#b8912a] hover:text-white flex items-center justify-center transition-all duration-300 active:scale-95"
              aria-label="Próximo"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 relative">
        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
          autoplay={canLoop ? { delay: 3000, disableOnInteraction: false } : false}
          loop={canLoop}
          grabCursor={true}
          spaceBetween={16}
          breakpoints={{
            0:    { slidesPerView: 1.1,  spaceBetween: 12 },
            480:  { slidesPerView: 1.3,  spaceBetween: 14 },
            640:  { slidesPerView: 1.6,  spaceBetween: 16 },
            768:  { slidesPerView: 2.1,  spaceBetween: 18 },
            1024: { slidesPerView: 3.1,  spaceBetween: 22 },
          }}
          className="pb-2"
        >
          {destaques.slice(0, 12).map((imovel) => {
            const capaRaw = imovel.fotos?.[0]?.url ?? imovel.fotoPrincipal ?? null;
            const capa = resolveFotoUrl(capaRaw);
            const isVenda = imovel.finalidade === "VENDA";

            return (
              <SwiperSlide key={imovel.id} className="group">
                <article className="relative overflow-hidden bg-[#1a1814] border border-white/5 hover:border-[#b8912a]/30 transition-all duration-500 hover:shadow-[0_24px_64px_rgba(184,145,42,0.12)]">
                  {/* Foto */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={capa}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814]/80 via-transparent to-transparent" />

                    {/* Badge flush top-left */}
                    <div className="absolute top-0 left-0">
                      <span
                        className={`block text-[9px] font-black uppercase tracking-[0.28em] px-4 py-2 ${
                          isVenda
                            ? "bg-[#b8912a] text-white"
                            : "bg-[#1a1814] text-[#b8912a]"
                        }`}
                      >
                        {isVenda ? "Venda" : "Aluguel"}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    <p
                      className="text-white leading-none tracking-tight mb-1"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(22px, 2.8vw, 28px)",
                        fontWeight: 400,
                      }}
                    >
                      {Number(imovel.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-[9px] text-[#b8912a] font-bold uppercase tracking-[0.22em] mb-3">
                      {isVenda ? "valor de venda" : "por mês"}
                    </p>
                    <h3 className="text-white/90 text-[13px] font-semibold leading-snug line-clamp-1 mb-2">
                      {imovel.titulo}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/40 text-[11px]">
                      <FiMapPin size={10} />
                      <span>{imovel.cidade}, {imovel.estado}</span>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
