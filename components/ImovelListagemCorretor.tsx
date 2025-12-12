import React, { useState, useEffect } from "react";
import axios from "axios";
import { Imovel } from "@/types/Imovel";
import { FiRefreshCw } from "react-icons/fi";
import StatusDropdown from "./StatusDropdown";
import EdtiImovel from "./EditImovel";
import DeleteImovelModal from "./DeleteImovelModal";
import { Camera, Pencil } from "lucide-react";
import FiltroImoveis from "./FiltroImoveis";
import Paginacao from "./Paginacao";
import VisualizarFotosModal from "@/components/VisualizarFotosModal";

type Finalidade = "VENDA" | "ALUGUEL";
type Status = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

interface ImovelListagemCorretorProps {
  onEdit: (imovelId: string) => void;
  onImovelChange: () => void;
}

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string | null>(null);
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

  const imoveisFiltrados = imoveis
    .filter((i) => i.titulo.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => (statusFiltro ? i.status === statusFiltro : true));

  const totalPages = Math.ceil(imoveisFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentImoveis = imoveisFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

  const handleVerFotos = (imovel: Imovel) => {
    if (imovel.fotos?.length) {
      setFotosSelecionadas(imovel.fotos.map((f) => ({ id: f.id, url: f.url })));
      setFotosModalOpen(true);
    }
  };

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
                <th className="px-4 py-2 text-center text-xs font-semibold">Valor</th>
                <th className="px-4 py-2 text-center text-xs font-semibold">Finalidade</th>
                <th className="px-4 py-2 text-center text-xs font-semibold">Status</th>
                <th className="px-4 py-2 text-center text-xs font-semibold">Ações</th>
                <th className="px-4 py-2 text-center text-xs font-semibold">Fotos</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentImoveis.map((imovel) => (
                <tr
                  key={imovel.id}
                  className="grid md:table-row border md:border-none p-3 md:p-0 mb-4 md:mb-0 rounded-lg md:rounded-none bg-white shadow-md md:shadow-none"
                >
                  {/* TÍTULO */}
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="font-semibold text-base md:text-sm">{imovel.titulo}</div>
                    <div className="text-xs text-gray-600">
                      {imovel.rua}, {imovel.numero}
                    </div>
                    <div className="text-xs text-gray-600">
                      {imovel.cidade} - {imovel.estado}
                    </div>
                  </td>

                  {/* VALOR */}
                  <td className="px-4 py-2 text-center font-bold text-gray-700 text-sm">
                    R$ {imovel.preco?.toLocaleString("pt-BR")}
                  </td>

                  {/* FINALIDADE */}
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        imovel.finalidade === "VENDA"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {imovel.finalidade === "VENDA" ? "Venda" : "Aluguel"}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-2 text-center">
                    <StatusDropdown
                      imovelId={imovel.id}
                      currentStatus={imovel.status as Status}
                      finalidade={imovel.finalidade as Finalidade}
                      onUpdate={fetchImoveis}
                    />
                  </td>

                  {/* AÇÕES */}
                  <td className="px-4 py-2 flex md:table-cell justify-center gap-3 ">
                    <button onClick={() => setImovelSelecionado(imovel)}>
                      <Pencil className="w-5 h-5 text-orange-500 cursor-pointer" />
                    </button>

                    <button onClick={() => setImovelSelecionadoDelete(imovel)}>
                      <span className="text-red-600 text-xl cursor-pointer">🗑️</span>
                    </button>
                  </td>

                  {/* FOTOS */}
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleVerFotos(imovel)}>
                      <Camera className="w-5 h-5 text-gray-700 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAIS */}
      {imovelSelecionado && (
        <EdtiImovel
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          onSave={() => {
            fetchImoveis();
            setImovelSelecionado(null);
          }}
        />
      )}

      {imovelSelecionadoDelete && (
        <DeleteImovelModal
          imovel={imovelSelecionadoDelete}
          onClose={() => setImovelSelecionadoDelete(null)}
          onDeleteSuccess={() => fetchImoveis()}
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
