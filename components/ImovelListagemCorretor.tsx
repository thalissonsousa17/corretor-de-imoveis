// components/ImovelListagemCorretor.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Imovel } from "@/types/Imovel";
import { FiRefreshCw } from "react-icons/fi";
import StatusDropdown from "./StatusDropdown";
import EdtiImovel from "./EditImovel";
import DeleteImovelModal from "./DeleteImovelModal";
import { Pencil } from "lucide-react";
import FiltroImoveis from "./FiltroImoveis";

interface ImovelListagemCorretorProps {
  onEdit: (imovelId: string) => void;
  onImovelChange: () => void;
}

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modais
  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

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

  const imoveisFiltrados = imoveis.filter((imovel) =>
    imovel.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-4 text-center text-gray-600">Carregando seus imóveis...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto bg-gray-100 rounded-lg shadow-xl p-4 ">
      <FiltroImoveis
        search={search}
        onSearchChange={setSearch}
        onFilterclick={() => console.log("Filtrando últimos 30 dias...")}
      />

      {imoveisFiltrados.length === 0 ? (
        <p className="text-center text-gray-600 mt-4">Nenhum imóvel encontrado.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Título / Endereço Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Ações
                <button
                  onClick={fetchImoveis}
                  className="ml-3 text-blue-500 hover:text-blue-700 cursor-pointer"
                  title="Recarregar Lista"
                >
                  <FiRefreshCw className="inline w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Fotos
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {imoveisFiltrados.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-gray-100 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-700 max-w-prose">
                  <div className="font-medium">{imovel.titulo}</div>
                  <div className="text-xs text-gray-600">
                    {imovel.rua}, {imovel.numero} - {imovel.bairro}
                  </div>
                  <div className="text-xs text-gray-600">
                    {imovel.cidade} - {imovel.estado} ({imovel.cep})
                  </div>
                  <div className="text-xs text-gray-600">{imovel.descricao}</div>
                </td>

                <td className="text-gray-700 px-6 py-4 text-center text-sm font-bold">
                  R$ {imovel.preco?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      imovel.status === "Disponivel"
                        ? "bg-green-100 text-green-800"
                        : imovel.status === "Vendido"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {imovel.status || "Não Definido"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(imovel)}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      title="Editar Imóvel"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(imovel)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                      title="Excluir Imóvel"
                    >
                      🗑️
                    </button>

                    <StatusDropdown
                      imovelId={imovel.id}
                      currentStatus={imovel.status ?? "Disponivel"}
                      onUpdate={fetchImoveis}
                    />
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    title="Ver Fotos"
                    className="p-1 rounded hover:bg-gray-200 cursor-pointer"
                  >
                    📷
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
    </div>
  );
};

export default ImovelListagemCorretor;
