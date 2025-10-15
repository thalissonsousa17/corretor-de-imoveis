import React from "react";
import CorretorLayout from "@/components/CorretorLayout";
import ImovelFormulario from "@/components/ImovelFormulario";

const CadastrarImovelPage: React.FC = () => {
  const handleSuccess = () => {
    console.log("Imóvel cadastrado com sucesso! Exibir mensagem ou redirecionar.");
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
      </div>
    </CorretorLayout>
  );
};

export default CadastrarImovelPage;
