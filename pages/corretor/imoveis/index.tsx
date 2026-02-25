import React, { useState, useEffect, useMemo } from "react";
import CorretorLayout from "../../../components/CorretorLayout";
import ImovelListagemCorretor from "../../../components/ImovelListagemCorretor";
import { Imovel } from "@/types/Imovel";
import axios from "axios";
import { motion } from "framer-motion";
import { FiHome, FiCheckCircle, FiDollarSign, FiClock } from "react-icons/fi";

const GerenciarImoveisPage: React.FC = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/users/me/imoveis");
      setImoveis(response.data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const total = imoveis.length;
    const disponiveis = imoveis.filter(i => i.status?.toUpperCase() === "DISPONIVEL").length;
    const negociados = imoveis.filter(i => {
      const s = i.status?.toUpperCase();
      return s === "VENDIDO" || s === "ALUGADO";
    }).length;
    const inativos = imoveis.filter(i => i.status?.toUpperCase() === "INATIVO").length;

    return [
      { label: "Total de Imóveis", value: total, icon: <FiHome />, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Disponíveis", value: disponiveis, icon: <FiCheckCircle />, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Negociados", value: negociados, icon: <FiDollarSign />, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Inativos", value: inativos, icon: <FiClock />, color: "text-slate-400", bg: "bg-slate-50" },
    ];
  }, [imoveis]);

  const handleEdit = (id: string) => {
    console.log("Editar imóvel com ID:", id);
  };

  const handleImovelChange = () => {
    fetchStats();
  };

  return (
    <CorretorLayout>
      <div className="space-y-8 pb-12">
        {/* Header Decriptivo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gerenciar Imóveis</h1>
            <p className="text-slate-500 mt-1 font-medium">Controle seu portfólio de luxo com precisão e clareza.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{loading ? "..." : stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Listagem Principal */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
          <ImovelListagemCorretor onEdit={handleEdit} onImovelChange={handleImovelChange} />
        </div>
      </div>
    </CorretorLayout>
  );
};

export default GerenciarImoveisPage;
