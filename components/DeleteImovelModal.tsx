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
      console.error("Error ao deletar:", error);
      alert("Falha ao deletar o imóvel. Verifique se você é o dono.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center text-center bg-gray-400/30 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Deletar Imóvel</h2>

        <p className="text-gray-600 mb-6">
          Tem certeza que deseja <strong>deletar</strong> o imóvel
          <br />
          <span className="text-red-500 font-semibold">
            {imovel.titulo}?
            <br />
          </span>
          <span className="text-sm text-gray-700">
            Esta ação é <strong>irreversível</strong>
          </span>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-red-700 text-gray-200 hover:bg-red-900 transition hover:text-white"
          >
            cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-700 text-gray-200 hover:bg-red-800 transition hover:text-white"
          >
            Confirmar exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteImovelModal;
