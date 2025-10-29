// components/ImovelListagemCorretor.tsx
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fotosModalOpen, setFotosModalOpen] = useState(false);
  const [fotosSelecionadas, setFotosSelecionadas] = useState<{ id: string; url: string }[]>([]);

  const handleVerFotos = (imovel: Imovel) => {
    if (imovel.fotos && imovel.fotos.length > 0) {
      const fotosFormatadas = imovel.fotos.map((f) => ({
        id: f.id,
        url: f.url,
      }));
      setFotosSelecionadas(fotosFormatadas);
      setFotosModalOpen(true);
    }
  };

  //  Função principal de carregamento
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

  //  Filtro por texto
  const imoveisFiltradosPorBusca = imoveis.filter((imovel) =>
    imovel.titulo.toLowerCase().includes(search.toLowerCase())
  );

  //  Filtro por status
  const imoveisFiltradosStatus = statusFiltro
    ? imoveisFiltradosPorBusca.filter((imovel) => imovel.status === statusFiltro)
    : imoveisFiltradosPorBusca;

  //  Paginação
  const totalPages = Math.ceil(imoveisFiltradosStatus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentImoveis = imoveisFiltradosStatus.slice(startIndex, startIndex + itemsPerPage);

  //  Controle de modais
  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

  const handleEdit = (imovel: Imovel) => setImovelSelecionado(imovel);
  const handleSave = (imovelAtualizado: Imovel) => {
    setImoveis((prev) => prev.map((i) => (i.id === imovelAtualizado.id ? imovelAtualizado : i)));
  };

  const handleDeleteClick = (imovel: Imovel) => setImovelSelecionadoDelete(imovel);
  const handleDeleteSuccess = () => {
    if (imovelSelecionadoDelete) {
      setImoveis(imoveis.filter((i) => i.id !== imovelSelecionadoDelete.id));
    }
  };

  const handleFiltrarStatus = (status: string | null) => {
    setStatusFiltro(status === statusFiltro ? null : status);
  };

  if (loading) return <p className="p-4 text-center text-gray-600">Carregando seus imóveis...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto bg-gray-100 rounded-lg shadow-xl p-4">
      <FiltroImoveis
        search={search}
        onSearchChange={setSearch}
        onFilterclick={() => console.log("Filtrando últimos 30 dias...")}
      />

      {imoveis.length === 0 ? (
        <p className="text-center text-gray-600 mt-4">Nenhum imóvel encontrado.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Título / Endereço Completo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Finalidade
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Mudar Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Ações
                <button
                  onClick={fetchImoveis}
                  className="ml-3 text-blue-500 hover:text-blue-700 cursor-pointer"
                  title="Recarregar Lista"
                >
                  <FiRefreshCw className="inline w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Fotos
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {currentImoveis.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-gray-100 transition-colors">
                {/* Título / Endereço */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="font-medium">{imovel.titulo}</div>
                  <div className="text-xs text-gray-600">
                    {imovel.rua}, {imovel.numero} - {imovel.bairro}
                  </div>
                  <div className="text-xs text-gray-600">
                    {imovel.cidade} - {imovel.estado} ({imovel.cep})
                  </div>
                  <div className="font-medium">
                    {imovel.tipo ? `${imovel.tipo} - ${imovel.titulo}` : imovel.titulo}
                  </div>
                </td>

                {/* Valor */}
                <td className="text-gray-700 px-6 py-4 text-center text-sm font-bold">
                  R${" "}
                  {imovel.preco?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }) ?? "0,00"}
                </td>

                {/* Finalidade */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      imovel.finalidade === "VENDA"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {imovel.finalidade === "VENDA" ? "Venda" : "Aluguel"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <StatusDropdown
                    imovelId={imovel.id}
                    currentStatus={(imovel.status as Status) ?? "DISPONIVEL"}
                    finalidade={imovel.finalidade as Finalidade}
                    onUpdate={fetchImoveis}
                  />
                </td>

                {/* Ações */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(imovel)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar Imóvel"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(imovel)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir Imóvel"
                    >
                      🗑️
                    </button>
                  </div>
                </td>

                {/* Fotos */}
                <td className="px-6 py-4 text-center">
                  <button
                    title="Ver Fotos"
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => handleVerFotos(imovel)}
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modais */}
      {imovelSelecionado && (
        <EdtiImovel
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          onSave={handleSave}
        />
      )}

      {imovelSelecionadoDelete && (
        <DeleteImovelModal
          imovel={imovelSelecionadoDelete}
          onClose={() => setImovelSelecionadoDelete(null)}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
      {fotosModalOpen && (
        <VisualizarFotosModal fotos={fotosSelecionadas} onClose={() => setFotosModalOpen(false)} />
      )}

      {/* Paginação */}
      <Paginacao currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ImovelListagemCorretor;
