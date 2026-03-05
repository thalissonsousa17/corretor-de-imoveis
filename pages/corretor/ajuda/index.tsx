import { useState, useEffect } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import { Search, BookOpen, Video, ExternalLink, X, Play } from "lucide-react";

interface AjudaItem {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string | null;
  videoUrl: string | null;
  tipo: "DOCUMENTACAO" | "VIDEO";
  ordem: number;
}

function getYoutubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function CorretorAjuda() {
  const [items, setItems] = useState<AjudaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AjudaItem | null>(null);

  useEffect(() => {
    api.get("/ajuda")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const docs = items.filter((i) => i.tipo === "DOCUMENTACAO");
  const videos = items.filter((i) => i.tipo === "VIDEO");

  const filterItems = (list: AjudaItem[]) =>
    list.filter(
      (i) =>
        i.titulo.toLowerCase().includes(search.toLowerCase()) ||
        i.descricao.toLowerCase().includes(search.toLowerCase())
    );

  const filteredDocs = filterItems(docs);
  const filteredVideos = filterItems(videos);

  return (
    <CorretorLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={22} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Central de Ajuda</h1>
          </div>
          <p className="text-gray-500 text-sm">Documentações e tutoriais em vídeo para aproveitar ao máximo a plataforma.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentação ou tutoriais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Documentação */}
            {filteredDocs.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-700 text-sm">Documentação</h2>
                  <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{filteredDocs.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDocs.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen size={14} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.descricao}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex-shrink-0 mt-0.5">Ver</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Vídeos */}
            {filteredVideos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Video size={16} className="text-purple-600" />
                  <h2 className="font-semibold text-gray-700 text-sm">Tutoriais em Vídeo</h2>
                  <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{filteredVideos.length}</span>
                </div>
                <div className="space-y-2">
                  {filteredVideos.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="flex items-center gap-3 w-full p-3 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play size={14} className="text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.titulo}</p>
                        {item.videoUrl && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.videoUrl}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-purple-600 group-hover:underline flex-shrink-0">Ver</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {filteredDocs.length === 0 && filteredVideos.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p>Nenhum resultado para &quot;{search}&quot;</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                {selected.tipo === "VIDEO"
                  ? <Play size={16} className="text-purple-600 flex-shrink-0" />
                  : <BookOpen size={16} className="text-blue-600 flex-shrink-0" />
                }
                <h2 className="font-bold text-gray-800 truncate">{selected.titulo}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-3 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selected.tipo === "VIDEO" && selected.videoUrl ? (
                <div className="space-y-4">
                  {getYoutubeEmbed(selected.videoUrl) ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={getYoutubeEmbed(selected.videoUrl)!}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <a
                      href={selected.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <ExternalLink size={14} />
                      Abrir vídeo
                    </a>
                  )}
                  {selected.descricao && (
                    <p className="text-gray-600 text-sm">{selected.descricao}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.descricao && (
                    <p className="text-gray-500 text-sm">{selected.descricao}</p>
                  )}
                  {selected.conteudo ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: selected.conteudo }}
                    />
                  ) : (
                    <p className="text-gray-400 text-sm italic">Sem conteúdo detalhado.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CorretorLayout>
  );
}
