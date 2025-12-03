// components/Noticias/NoticiasInternas.tsx

import CardNoticia from "./CardNoticia";
import Link from "next/link";

interface NoticiaInterna {
  id: string;
  titulo: string;
  data: string;
  link?: string;
  thumbnail?: string;
  resumo?: string;
}

export default function NoticiasInternas({ noticias = [] }: { noticias: NoticiaInterna[] }) {
  if (noticias.length === 0) return null;

  // Ordena por data (mais novo primeiro)
  const ordenadas = [...noticias].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <section className="space-y-4 mt-12">
      <h2 className="text-xl font-bold text-[#1A2A4F]">Informativos do Corretor</h2>

      {/* Exibir só os 4 primeiros */}
      {ordenadas.slice(0, 4).map((n) => (
        <CardNoticia
          key={n.id}
          titulo={n.titulo}
          data={new Date(n.data).toLocaleDateString("pt-BR")}
          link={n.link ?? "#"}
          resumo={n.resumo}
        />
      ))}

      {/* Botão Ver Todas Internas */}
      <div className="text-right mt-4">
        <Link href="/noticias/internas" className="font-semibold text-[#1A2A4F] hover:underline">
          Ver todas internas →
        </Link>
      </div>
    </section>
  );
}
