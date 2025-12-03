// components/Noticias/NoticiasPrincipais.tsx

import { useEffect, useState } from "react";
import CardNoticia from "./CardNoticia";
import Link from "next/link";
import { useRouter } from "next/router";

interface Noticia {
  titulo: string;
  data: string;
  thumbnail: string;
  resumo: string;
  link: string;
}

export default function NoticiasPrincipais() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const r = await fetch("/api/noticias-externas");
        const data = await r.json();
        setNoticias(data.slice(0, 4)); // só as 4 principais
      } catch (e) {
        console.error("Erro ao carregar notícias:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading) return null;
  if (noticias.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-[#1A2A4F] mb-4">
        Principais notícias do mercado imobiliário
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {noticias.map((n, i) => (
          <CardNoticia key={i} {...n} />
        ))}
      </div>

      {/* Botão Ver Mais */}
      <div className="text-right mt-4">
        <Link href={`${slug}/noticias`} className="font-semibold text-[#1A2A4F] hover:underline">
          Ver mais →
        </Link>
      </div>
    </section>
  );
}
