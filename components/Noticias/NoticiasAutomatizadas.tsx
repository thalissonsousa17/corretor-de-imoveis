import { useEffect, useState } from "react";
import CardNoticia from "./CardNoticia";

interface Noticia {
  titulo: string;
  data: string;
  link: string;
}

export default function NoticiasAutomatizadas() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const r = await fetch("/api/noticias-externas");
        const data = await r.json();
        setNoticias(data);
      } catch (e) {
        console.error("Erro ao carregar notícias:", e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) {
    return <div>Carregando notícias...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#1A2A4F]">Últimas notícias sobre financiamento</h2>

      {noticias.map((n, i) => (
        <CardNoticia
          key={i}
          titulo={n.titulo}
          data={new Date(n.data).toLocaleDateString("pt-BR")}
          link={n.link}
        />
      ))}
    </div>
  );
}
