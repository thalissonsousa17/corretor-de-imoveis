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
  const limit = 5;

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

  const handleEdit = (id: string) => {
    console.log("Editar imóvel com ID:", id);
  };

  const handleImovelChange = () => {
    fetchImoveis();
  };

  return (
    <CorretorLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">📋 Gerenciar Imóveis</h1>

        <p className="text-gray-600 text-sm sm:text-base">
          Visualize, edite e gerencie o status de todos os seus imóveis cadastrados.
        </p>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow overflow-x-auto w-full">
          <ImovelListagemCorretor onEdit={handleEdit} onImovelChange={handleImovelChange} />
        </div>
      </div>
    </CorretorLayout>
  );
};

export default GerenciarImoveisPage;
