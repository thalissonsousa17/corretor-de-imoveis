// components/ImovelListagemCorretor.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
// Certifique-se de que o caminho para o seu tipo Imovel está correto
import { Imovel } from "@/types/Imovel";
import { FiEdit, FiTrash2, FiRefreshCw } from "react-icons/fi";

// Define as propriedades que o componente irá receber
interface ImovelListagemCorretorProps {
  // Função chamada quando o corretor clica em Editar
  onEdit: (imovelId: string) => void;
  // Função para notificar o Dashboard que a lista foi atualizada (após deleção/criação)
  onImovelChange: () => void;
}

// O tipo Imovel precisa incluir o ID
// type Imovel = { id: string; titulo: string; valor: number; disponivel: boolean; /* ... outros campos */ };

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = ({
  onEdit,
  onImovelChange,
}) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // 2. Função para deletar um imóvel
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "ATENÇÃO: Tem certeza que deseja DELETAR este imóvel? Esta ação é irreversível."
      )
    )
      return;

    try {
      // A API de DELETE /api/imoveis/[id] é protegida e verifica o corretorId
      await axios.delete(`/api/imoveis/${id}`);

      // Atualiza a lista no frontend (Otimista)
      setImoveis(imoveis.filter((i) => i.id !== id));
      onImovelChange(); // Notifica o dashboard sobre a mudança

      alert("Imóvel deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Falha ao deletar o imóvel. Verifique se você é o dono.");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Carregando seus imóveis...</p>
      </div>
    );
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // 3. Função para alternar a disponibilidade do imóvel
  const toggleDisponibilidade = async (imovel: Imovel) => {
    try {
      await axios.patch(`/api/imoveis/${imovel.id}`, {
        disponivel: !imovel.disponivel,
      });
      fetchImoveis();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Falha ao atualizar o status do imóvel.");
    }
  };
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {imoveis.length === 0 ? (
        <p className="p-4 text-center text-gray-600">
          Você ainda não possui imóveis cadastrados. Use o formulário abaixo.
        </p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
                <button
                  onClick={fetchImoveis}
                  className="ml-3 text-blue-500 hover:text-blue-700"
                  title="Recarregar Lista"
                >
                  <FiRefreshCw className="inline w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{imovel.titulo}</div>
                  <div className="text-xs text-gray-500">
                    {imovel.cidade} - {imovel.estado}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                  {(imovel.preco ?? 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${imovel.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {imovel.disponivel ? "Disponível" : "Vendido"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Botão de Edição - Chama a função onEdit que veio do Dashboard */}
                  <button
                    onClick={() => onEdit(imovel.id)}
                    className="text-blue-600 hover:text-blue-900 transition"
                    title="Editar Imóvel"
                  >
                    <FiEdit className="inline w-5 h-5" />
                  </button>
                  {/* Botão de Deleção - Chama a função handleDelete */}
                  <button
                    onClick={() => handleDelete(imovel.id)}
                    className="text-red-600 hover:text-red-900 transition"
                    title="Deletar Imóvel"
                  >
                    <FiTrash2 className="inline w-5 h-5" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleDisponibilidade(imovel)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${imovel.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {imovel.disponivel ? "Disponível" : "Indisponível"}
                  </button>
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
