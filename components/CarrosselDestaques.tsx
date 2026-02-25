"use client";

import React, { useId, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { resolveFotoUrl } from "@/lib/imageUtils";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
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

  // ✅ pode vir de um endpoint
  fotos?: Foto[];

  // ✅ pode vir de outro endpoint
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
    <section className="bg-white dark:bg-slate-950 py-24 transition-colors duration-500 overflow-hidden">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-accent dark:text-blue-200">
          Seleção Premium
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight">
          Destaques <span className="text-slate-400 dark:text-slate-500">para você.</span>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 relative">
        {/* BOTÃO ESQUERDO */}
        <button
          id={prevId}
          className="
            absolute -left-4 top-1/2 -translate-y-1/2 z-30
            w-14 h-14 rounded-full
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            text-slate-900 dark:text-white 
            shadow-[0_20px_40px_rgba(0,0,0,0.1)] 
            hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]
            flex items-center justify-center
            transition-all duration-300 hover:scale-110 active:scale-95
            disabled:opacity-20 disabled:cursor-not-allowed
            hidden lg:flex border border-white dark:border-white/10
          "
          aria-label="Anterior"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* BOTÃO DIREITO */}
        <button
          id={nextId}
          className="
            absolute -right-4 top-1/2 -translate-y-1/2 z-30
            w-14 h-14 rounded-full
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            text-slate-900 dark:text-white 
            shadow-[0_20px_40px_rgba(0,0,0,0.1)] 
            hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]
            flex items-center justify-center
            transition-all duration-300 hover:scale-110 active:scale-95
            disabled:opacity-20 disabled:cursor-not-allowed
            hidden lg:flex border border-white dark:border-white/10
          "
          aria-label="Próximo"
        >
          <FiChevronRight size={24} />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{ prevEl: `#${prevId}`, nextEl: `#${nextId}` }}
          autoplay={canLoop ? { delay: 2200, disableOnInteraction: false } : false}
          loop={canLoop}
          grabCursor={true}
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 12 },
            480: { slidesPerView: 1.3, spaceBetween: 14 },
            640: { slidesPerView: 1.6, spaceBetween: 16 },
            768: { slidesPerView: 2.1, spaceBetween: 18 },
            1024: { slidesPerView: 3.1, spaceBetween: 22 },
          }}
          className="pb-8"
        >
          {destaques.slice(0, 12).map((imovel) => {
            // ✅ pega de onde vier (fotos[0] OU fotoPrincipal)
            const capaRaw = imovel.fotos?.[0]?.url ?? imovel.fotoPrincipal ?? null;
            const capa = resolveFotoUrl(capaRaw);

            return (
              <SwiperSlide key={imovel.id} className="group">
                <div
                  className="
                    relative rounded-[2.5rem] overflow-hidden 
                    shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]
                    hover:shadow-[0_40px_80px_rgba(var(--accent-color-rgb),0.1)]
                    transition-all duration-700
                    hover:-translate-y-4
                    bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 dark:hover:border-accent/30
                  "
                >
                  <img
                    src={capa}
                    alt={imovel.titulo}
                    className="w-full h-48 sm:h-56 md:h-60 lg:h-64 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute bottom-6 left-6 right-6 text-white transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="font-black text-lg sm:text-xl drop-shadow-2xl line-clamp-1 tracking-tight">
                      {imovel.titulo}
                    </h3>
 
                    <p className="text-xs sm:text-sm font-bold opacity-60 line-clamp-1 uppercase tracking-widest mt-1">
                      {imovel.cidade} - {imovel.estado}
                    </p>
 
                    <p className="text-white font-black mt-3 text-lg sm:text-xl tracking-tighter drop-shadow-2xl">
                      {Number(imovel.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>

                  <span
                    className={`
                      absolute top-4 left-4 px-4 py-1.5
                      text-[10px] font-black rounded-full uppercase tracking-widest
                      backdrop-blur-md shadow-lg border border-white/10
                      ${imovel.finalidade === "VENDA" ? "bg-accent/80 text-white" : "bg-blue-600/80 text-white"}
                    `}
                  >
                    {imovel.finalidade === "VENDA" ? "À VENDA" : "ALUGUEL"}
                  </span>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
