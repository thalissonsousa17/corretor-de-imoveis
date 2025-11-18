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

  return (
    <section className="bg-white py-16">
      <h2 className="text-center text-3xl font-bold text-[#1A2A4F] mb-10">Destaques para você</h2>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Botão esquerdo */}
        <button
          id="btn-prev"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                     p-3 rounded-full bg-black/40 hover:bg-black/60
                     text-white shadow-lg cursor-pointer hidden md:block"
        >
          ‹
        </button>

        {/* Botão direito */}
        <button
          id="btn-next"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                     p-3 rounded-full bg-black/40 hover:bg-black/60
                     text-white shadow-lg cursor-pointer hidden md:block"
        >
          ›
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{
            prevEl: "#btn-prev",
            nextEl: "#btn-next",
          }}
          autoplay={{ delay: 2200, disableOnInteraction: false }}
          loop={true}
          grabCursor={true}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            640: { slidesPerView: 1.6 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.1 },
          }}
          className="pb-8"
        >
          {imoveis.slice(0, 12).map((imovel) => {
            const capa = imovel.fotos?.[0]?.url;

            return (
              <SwiperSlide key={imovel.id} className="group">
                <div className="relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-105">
                  {capa && (
                    <img src={capa} alt={imovel.titulo} className="w-full h-60 object-cover" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg drop-shadow-sm line-clamp-1">
                      {imovel.titulo}
                    </h3>
                    <p className="text-sm opacity-90 line-clamp-1">
                      {imovel.cidade} - {imovel.estado}
                    </p>
                    <p className="text-yellow-400 font-bold mt-1 text-[15px]">
                      {Number(imovel.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>

                  <span
                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full
                      ${
                        imovel.status === "VENDIDO"
                          ? "bg-red-500 text-white"
                          : imovel.finalidade === "VENDA"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                      }`}
                  >
                    {imovel.status === "VENDIDO"
                      ? "VENDIDO"
                      : imovel.finalidade === "VENDA"
                        ? "À VENDA"
                        : "ALUGUEL"}
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
