import { useEffect, useState } from "react";
import CardNoticia from "@/components/Noticias/CardNoticia";
import Link from "next/link";

interface Noticia {
  titulo: string;
  data: string;
  thumbnail: string;
  resumo: string;
  link: string;
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const itensPorPagina = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch("/api/noticias-externas");
        const data = await r.json();
        setNoticias(data);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      }
    };

    fetchData();
  }, []);

  // 🔍 Filtragem
  const noticiasFiltradas = noticias.filter((n) =>
    n.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  // 📄 Paginação
  const totalPaginas = Math.ceil(noticiasFiltradas.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const noticiasPaginadas = noticiasFiltradas.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Título */}
      <h1 className="text-3xl font-bold text-[#1A2A4F] mb-6">
        Todas as notícias sobre financiamento
      </h1>

      {/* Campo de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar notícia..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          className="w-full p-3 border rounded-lg shadow-sm"
        />
      </div>

      {/* Grid de notícias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {noticiasPaginadas.map((n, i) => (
          <CardNoticia key={i} {...n} />
        ))}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ← Anterior
          </button>

          <span className="px-4 py-2 text-[#1A2A4F] font-semibold">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Voltar */}
      <div className="text-center mt-10">
        <Link href="/" className="text-[#1A2A4F] font-semibold hover:underline">
          Voltar para página principal
        </Link>
      </div>
    </div>
  );
}
