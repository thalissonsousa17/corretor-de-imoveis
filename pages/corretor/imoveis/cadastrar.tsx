import React, { useState } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import ImovelFormulario from "@/components/ImovelFormulario";

const CadastrarImovelPage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleSuccess = () => {
    setOpenModal(true);
  };

  return (
    <CorretorLayout>
      <div className="max-w-4xl mx-auto py-2">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🏢 Cadastrar Novo Imóvel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados abaixo para incluir um novo imóvel em sua carteira.
          </p>
        </div>

        {/* Formulário */}
        <ImovelFormulario onSuccess={handleSuccess} />

        {/* Modal de sucesso */}
        {openModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center mx-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Imóvel cadastrado!
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                O imóvel foi adicionado à sua carteira com sucesso.
              </p>
              <button
                onClick={() => setOpenModal(false)}
                className="mt-6 w-full py-2.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </CorretorLayout>
  );
};

export default CadastrarImovelPage;
