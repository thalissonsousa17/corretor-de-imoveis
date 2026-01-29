"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
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
  fotos: Foto[];
};

export default function CarrosselDestaques({ imoveis }: { imoveis: Imovel[] }) {
  if (!imoveis || imoveis.length === 0) return null;

  const destaques = imoveis.filter((i) => i.status !== "VENDIDO");

  if (destaques.length === 0) return null;

  return (
    <section className="bg-white py-10 sm:py-14 md:py-16">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#1A2A4F] mb-6 sm:mb-8 md:mb-10">
        Destaques para você
      </h2>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 relative">
        {/* BOTÃO ESQUERDO */}
        <button
          id="btn-prev"
          className="
            absolute left-1 top-1/2 -translate-y-1/2 z-20
            p-2 sm:p-3 rounded-full 
            bg-black/40 hover:bg-black/60
            text-white shadow-lg cursor-pointer
            hidden md:block
          "
        >
          ‹
        </button>

        {/* BOTÃO DIREITO */}
        <button
          id="btn-next"
          className="
            absolute right-1 top-1/2 -translate-y-1/2 z-20
            p-2 sm:p-3 rounded-full 
            bg-black/40 hover:bg-black/60
            text-white shadow-lg cursor-pointer
            hidden md:block
          "
        >
          ›
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{ prevEl: "#btn-prev", nextEl: "#btn-next" }}
          autoplay={{ delay: 2200, disableOnInteraction: false }}
          loop={true}
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
            const capa = imovel.fotos?.[0]?.url;

            return (
              <SwiperSlide key={imovel.id} className="group">
                <div
                  className="
                    relative rounded-2xl overflow-hidden shadow-xl 
                    transition-all duration-300 
                    group-hover:scale-[1.03]
                    bg-gray-200
                  "
                >
                  {capa && (
                    <img
                      src={capa}
                      alt={imovel.titulo}
                      className="
                        w-full 
                        h-48 sm:h-56 md:h-60 lg:h-64 
                        object-cover
                      "
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-base sm:text-lg drop-shadow-sm line-clamp-1">
                      {imovel.titulo}
                    </h3>

                    <p className="text-xs sm:text-sm opacity-90 line-clamp-1">
                      {imovel.cidade} - {imovel.estado}
                    </p>

                    <p className="text-yellow-400 font-bold mt-1 text-sm sm:text-[15px]">
                      {Number(imovel.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>

                  {/* BADGE */}
                  <span
                    className={`
                      absolute top-2 left-2 px-2 sm:px-3 py-1 
                      text-[10px] sm:text-xs font-bold rounded-full
                      ${
                        imovel.finalidade === "VENDA"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }
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
