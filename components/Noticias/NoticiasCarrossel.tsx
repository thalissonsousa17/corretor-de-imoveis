import { useEffect, useState } from "react";
import CardNoticia from "./CardNoticia";
import Link from "next/link";

interface Noticia {
  titulo: string;
  data: string;
  thumbnail: string;
  resumo: string;
  link: string;
}

export default function NoticiasCarrossel() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const r = await fetch("/api/noticias-externas");
        const data = await r.json();
        setNoticias(data.slice(4, 10)); // 6 notícias seguintes
      } catch (error) {
        console.error("Erro ao carregar carrossel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading) return null;
  if (noticias.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-[#1A2A4F] mb-4">Mais notícias sobre financiamento</h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#1A2A4F]/40">
        {noticias.map((n, i) => (
          <div key={i} className="min-w-[280px] max-w-[280px] flex-shrink-0">
            <CardNoticia {...n} />
          </div>
        ))}
      </div>

      {/* Botão Ver Mais */}
      <div className="text-right mt-4">
        <Link href="/noticias" className="font-semibold text-[#1A2A4F] hover:underline">
          Ver mais →
        </Link>
      </div>
    </section>
  );
}
