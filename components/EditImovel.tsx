import React from "react";
import ImovelFormulario from "./ImovelFormulario";
import { Imovel } from "@/types/Imovel";
import { X } from "lucide-react";

interface EditImovelProps {
  imovel: Imovel;
  onClose: () => void;
  onSave: () => void;
}

export default function EditImovel({ imovel, onClose, onSave }: EditImovelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl relative">
        {/* Botão fechar */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Editar imóvel</h2>

          <ImovelFormulario
            imovelId={imovel.id}
            onSuccess={() => {
              onSave();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
