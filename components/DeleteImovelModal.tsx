import axios from "axios";
import React from "react";
import { Imovel } from "@/types/Imovel";

interface DeleteImovelModalProps {
  imovel: Imovel | null;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

const DeleteImovelModal: React.FC<DeleteImovelModalProps> = ({
  imovel,
  onClose,
  onDeleteSuccess,
}) => {
  if (!imovel) return null;

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/imoveis/${imovel.id}`);
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Falha ao deletar o imóvel. Verifique se possui permissão.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          Confirmar Exclusão
        </h2>

        <p className="text-gray-600 text-center leading-relaxed">
          Você realmente deseja <strong className="text-red-600">excluir</strong> o imóvel:
          <br />
          <span className="text-red-500 font-semibold">{imovel.titulo}</span>?
        </p>

        <p className="mt-3 text-sm text-gray-500 text-center">
          Esta ação é permanente e <strong>não poderá ser desfeita</strong>.
        </p>

        {/* Botões */}
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
          >
            Excluir Imóvel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteImovelModal;
