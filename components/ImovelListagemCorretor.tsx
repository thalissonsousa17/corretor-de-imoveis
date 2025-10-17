// components/ImovelListagemCorretor.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Imovel } from "@/types/Imovel";
import { FiRefreshCw } from "react-icons/fi";
import StatusDropdown from "./StatusDropdown";
import EdtiImovel from "./EditImovel";
import DeleteImovelModal from "./DeleteImovelModal";

// Define as propriedades que o componente irá receber
interface ImovelListagemCorretorProps {
  // Função chamada quando o corretor clica em Editar
  onEdit: (imovelId: string) => void;
  // Função para notificar o Dashboard que a lista foi atualizada (após deleção/criação)
  onImovelChange: () => void;
}

// O tipo Imovel precisa incluir o ID
// type Imovel = { id: string; titulo: string; valor: number; disponivel: boolean; /* ... outros campos */ };

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = ({ onImovelChange }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edite imóvel e Delete
  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // 1. Função para buscar os imóveis do corretor
  const fetchImoveis = async () => {
    setLoading(true);
    setError("");
    try {
      // Chama a API específica do corretor
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
    // A dependência vazia garante que só carrega na montagem
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Carregando seus imóveis...</p>
      </div>
    );
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Editar Imóvel
  const handleEdit = (imovel: Imovel) => {
    setImovelSelecionado(imovel);
  };

  const handleSave = (imovelAtualizado: Imovel) => {
    setImoveis((prev) => prev.map((i) => (i.id === imovelAtualizado.id ? imovelAtualizado : i)));
  };

  // Deletar Imóvel
  const handleDeleteClick = (imovel: Imovel) => {
    setImovelSelecionadoDelete(imovel);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    if (imovelSelecionadoDelete) {
      setImoveis(imoveis.filter((i) => i.id !== imovelSelecionadoDelete.id));
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-100 rounded-lg shadow-xl">
      {imoveis.length === 0 ? (
        <p className="p-4 text-center text-gray-600">
          Você ainda não possui imóveis cadastrados. Use o formulário abaixo.
        </p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
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
                Editar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Excluir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Pesquisar
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Ações
                <button
                  onClick={fetchImoveis}
                  className="ml-3 text-blue-500 hover:text-blue-700"
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
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="bg-gray-200 border-b hover:bg-gray-300">
                {/* Título / Endereço */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-700">{imovel.titulo}</div>
                  <div className="text-xs text-gray-600">
                    {imovel.rua}, {imovel.numero} - {imovel.bairro}
                  </div>
                  <div className="text-xs text-gray-600">
                    {imovel.cidade} - {imovel.estado} ({imovel.cep})
                  </div>
                  <div className="text-xs text-gray-600">{imovel.descricao}</div>
                  <div className="text-xs text-gray-600">{imovel.status}</div>
                </td>

                {/* Valor */}
                <td className="text-gray-600 px-6 py-4 whitespace-nowrap text-sm font-bold">
                  {imovel.preco?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                </td>

                {/* Ações e Status */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Status */}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        imovel.status === "Disponivel"
                          ? "bg-green-100 text-green-800"
                          : imovel.status === "Vendido"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    `}
                  >
                    {imovel.status || "Não Definido"}
                  </span>

                  {/* Edite Imóvel */}
                  <div className="inline-flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(imovel)}
                      className=" cursor-pointer text-blue-600 hover:text-blue-900"
                      title="Editar Imóvel"
                    >
                      ✏️
                    </button>
                    {imovelSelecionado && (
                      <EdtiImovel
                        imovel={imovelSelecionado}
                        onClose={() => setImovelSelecionado(null)}
                        onSave={handleSave}
                      />
                    )}
                    <button
                      onClick={() => handleDeleteClick(imovel)}
                      className="cursor-pointer text-red-600 hover:text-red-900"
                      title="Excluir Imóvel"
                    >
                      🗑️
                    </button>
                    {imovelSelecionadoDelete && (
                      <DeleteImovelModal
                        imovel={imovelSelecionadoDelete}
                        onClose={() => setImovelSelecionadoDelete(null)}
                        onDeleteSuccess={handleDeleteSuccess}
                      />
                    )}

                    <StatusDropdown
                      imovelId={imovel.id}
                      currentStatus={imovel.status ?? "Disponivel"}
                      onUpdate={fetchImoveis}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ImovelListagemCorretor;
