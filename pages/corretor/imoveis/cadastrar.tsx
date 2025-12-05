import React, { useState } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import ImovelFormulario from "@/components/ImovelFormulario";

const CadastrarImovelPage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleSuccess = () => {
    console.log("Imóvel cadastrado com sucesso! Exibir mensagem ou redirecionar.");
    setOpenModal(true);
  };

  return (
    <CorretorLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">🏢 Cadastrar Novo Imóvel</h1>
        <p className="text-gray-600">
          Preencha o formulário para incluir um novo imóvel em sua carteira.
        </p>

        <div className="bg-white p-6 rounded-lg shadow">
          <ImovelFormulario onSuccess={handleSuccess} />
        </div>

        {openModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-10 z-50">
            <div className="bg-gray-900 opacity-90 rounded-lg shadow-lg p-8 max-w-md w-full text-center animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-100 mx-auto md-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 14.793l-3.646-3.647a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l8-8a.5.5 0 00-.708-.708L10.5 14.793z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-100">
                Imóvel cadastrado com sucesso!
              </h2>
              <p className="text-gray-100 mt-2">
                O imóvel doi adicionado à sua carteira com sucesso.
              </p>
              <button
                onClick={() => setOpenModal(false)}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </CorretorLayout>
  );
};

export default CadastrarImovelPage;
