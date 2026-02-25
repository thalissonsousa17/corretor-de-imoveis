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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ✏️ Editar Imóvel
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Altere as informações abaixo para atualizar o anúncio.
            </p>
          </div>
          
          <button
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 cursor-pointer"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
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
    </div>
  );
}
