import { useEffect, useState } from "react";
import CardNoticia from "./CardNoticia";
import Link from "next/link";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

interface Noticia {
  titulo: string;
  data: string;
  thumbnail?: string;
  resumo?: string;
  link: string;
}

export default function NoticiasCarrossel() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const r = await fetch("/api/noticias-externas");
        const data = await r.json();

        // Caso venha no formato { noticias: [] }
        const lista = Array.isArray(data) ? data : data.noticias || [];

        setNoticias(lista.slice(4, 10));
      } catch (error) {
        console.error("Erro ao carregar carrossel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading || noticias.length === 0) return null;

  return (
    <section className="mt-12 bg-white border rounded-2xl shadow-2xl">
      <h2 className="text-xl font-bold  text-[#1A2A4F] mb-4">Mais notícias sobre financiamento</h2>

      {/* CARROSSEL ANIMADO */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        loop={true}
        spaceBetween={20}
        grabCursor={true}
        breakpoints={{
          0: { slidesPerView: 1.2 },
          480: { slidesPerView: 1.4 },
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
        className="pb-4"
      >
        {noticias.map((n, i) => (
          <SwiperSlide key={i} className="flex justify-center ">
            <div className="min-w-[280px] max-w-[280px] ">
              <CardNoticia {...n} data={new Date(n.data).toLocaleDateString("pt-BR")} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botão Ver Mais */}
      <div className="text-right mt-4">
        <Link
          href={`/${slug}/noticias`}
          className="font-semibold p-5 text-[#1A2A4F] hover:underline"
        >
          Ver mais →
        </Link>
      </div>
    </section>
  );
}
