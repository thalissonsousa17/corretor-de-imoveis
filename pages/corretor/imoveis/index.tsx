import React, { useState } from "react";
import CorretorLayout from "../../../components/CorretorLayout";
import ImovelListagemCorretor from "../../../components/ImovelListagemCorretor";
import { Imovel } from "@prisma/client";
import axios from "axios";

const GerenciarImoveisPage: React.FC = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; //número de imóveis por página.

  const fetchImoveis = async () => {
    try {
      const res = await axios.get("/api/imoveis", {
        params: { page, limit, search },
      });
      setImoveis(res.data.imoveis);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar imóveis", error);
    }
  };

  // Quando o corretor quiser editar um imóvel
  const handleEdit = (id: string) => {
    console.log("Editar imóvel com ID:", id);
    // Aqui você pode redirecionar, ex: router.push(`/corretor/editar/${id}`)
  };

  // Quando houver alguma mudança nos imóveis (ex: exclusão, atualização)
  const handleImovelChange = () => {
    console.log("Atualizando listagem de imóveis...");
    fetchImoveis();
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
