import React, { useState, useEffect } from "react";
import axios from "axios";
import { Imovel } from "@/types/Imovel";
import StatusDropdown from "./StatusDropdown";
import EdtiImovel from "./EditImovel";
import DeleteImovelModal from "./DeleteImovelModal";
import { Camera, Pencil } from "lucide-react";
import FiltroImoveis from "./FiltroImoveis";
import Paginacao from "./Paginacao";
import VisualizarFotosModal from "@/components/VisualizarFotosModal";

const normalizeImageUrl = (url: string | null | undefined) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;

  const fileName = url.split(/[\\/]/).pop();
  return `/api/uploads/${fileName}`;
};

type Finalidade = "VENDA" | "ALUGUEL";
type Status = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

interface ImovelListagemCorretorProps {
  onEdit: (imovelId: string) => void;
  onImovelChange: () => void;
}

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = ({ onImovelChange }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [fotosModalOpen, setFotosModalOpen] = useState(false);
  const [fotosSelecionadas, setFotosSelecionadas] = useState<{ id: string; url: string }[]>([]);

  const fetchImoveis = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/users/me/imoveis");
      setImoveis(response.data);
    } catch {
      setError("Não foi possível carregar seus imóveis. Verifique sua sessão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImoveis();
  }, []);

  const handleVerFotos = (imovel: Imovel) => {
    if (imovel.fotos?.length) {
      const fotosNormalizadas = imovel.fotos.map((f) => ({
        id: f.id,
        url: normalizeImageUrl(f.url),
      }));
      setFotosSelecionadas(fotosNormalizadas);
      setFotosModalOpen(true);
    }
  };

  const imoveisFiltrados = imoveis.filter((i) =>
    i.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(imoveisFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentImoveis = imoveisFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

  if (loading) return <p className="p-4 text-center text-gray-600">Carregando...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="bg-gray-100 rounded-lg shadow-xl p-4 w-full">
      <FiltroImoveis search={search} onSearchChange={setSearch} />

      {imoveis.length === 0 ? (
        <p className="text-center text-gray-600 mt-4">Nenhum imóvel encontrado.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full mt-4">
            <thead className="bg-gray-300 hidden md:table-header-group">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                  Título / Endereço
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase">Valor</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase">Status</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase">Ações</th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase">Fotos</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentImoveis.map((imovel) => (
                <tr
                  key={imovel.id}
                  className="grid md:table-row border md:border-none p-3 mb-4 bg-white shadow-md md:shadow-none"
                >
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="font-semibold">{imovel.titulo}</div>
                    <div className="text-xs text-gray-500">
                      {imovel.cidade} - {imovel.estado}
                    </div>
                  </td>

                  <td className="px-4 py-2 text-center font-bold text-gray-700">
                    R$ {imovel.preco?.toLocaleString("pt-BR")}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <StatusDropdown
                      imovelId={imovel.id}
                      currentStatus={imovel.status as Status}
                      finalidade={imovel.finalidade as Finalidade}
                      onUpdate={fetchImoveis}
                    />
                  </td>

                  <td className="px-4 py-2 flex justify-center gap-3">
                    <button onClick={() => setImovelSelecionado(imovel)}>
                      <Pencil className="w-5 h-5 text-orange-500" />
                    </button>
                    <button onClick={() => setImovelSelecionadoDelete(imovel)}>
                      <span className="text-red-600 text-xl">🗑️</span>
                    </button>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleVerFotos(imovel)}
                      className="relative p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Camera className="w-5 h-5 text-gray-700" />
                      {/*  indicando quantidade de fotos */}
                      {imovel.fotos && imovel.fotos.length > 0 && (
                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                          {imovel.fotos.length}
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAIS  */}
      {imovelSelecionado && (
        <EdtiImovel
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          onSave={() => {
            fetchImoveis();
            setImovelSelecionado(null);
            onImovelChange();
          }}
        />
      )}

      {imovelSelecionadoDelete && (
        <DeleteImovelModal
          imovel={imovelSelecionadoDelete}
          onClose={() => setImovelSelecionadoDelete(null)}
          onDeleteSuccess={() => {
            fetchImoveis();
            onImovelChange();
          }}
        />
      )}

      {fotosModalOpen && (
        <VisualizarFotosModal fotos={fotosSelecionadas} onClose={() => setFotosModalOpen(false)} />
      )}

      <Paginacao currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ImovelListagemCorretor;
