import React from "react";
import CorretorLayout from "../../../components/CorretorLayout";
import ImovelListagemCorretor from "../../../components/ImovelListagemCorretor";

const GerenciarImoveisPage: React.FC = () => {
  // Quando o corretor quiser editar um imóvel
  const handleEdit = (id: string) => {
    console.log("Editar imóvel com ID:", id);
    // Aqui você pode redirecionar, ex: router.push(`/corretor/editar/${id}`)
  };

  // Quando houver alguma mudança nos imóveis (ex: exclusão, atualização)
  const handleImovelChange = () => {
    console.log("Atualizando listagem de imóveis...");
    // Aqui você pode refazer o fetch dos imóveis
  };
  return (
    <CorretorLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">📋 Gerenciar Imóveis</h1>
        <p className="text-gray-600">
          Visualize, edite e gerencie o status de todos os seus imóveis cadastrados.
        </p>

        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <ImovelListagemCorretor onEdit={handleEdit} onImovelChange={handleImovelChange} />
        </div>
      </div>
    </CorretorLayout>
  );
};

export default GerenciarImoveisPage;
