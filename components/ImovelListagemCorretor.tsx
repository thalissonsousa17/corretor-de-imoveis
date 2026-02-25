import React, { useState, useEffect } from "react";
import axios from "axios";
import { Imovel, Status as RawStatus } from "@/types/Imovel";
import { resolveFotoUrl } from "@/lib/imageUtils";
import StatusDropdown from "./StatusDropdown";
import EdtiImovel from "./EditImovel";
import DeleteImovelModal from "./DeleteImovelModal";
import { Camera, Pencil, Trash2, MapPin, DollarSign, Home } from "lucide-react";
import FiltroImoveis from "./FiltroImoveis";
import Paginacao from "./Paginacao";
import VisualizarFotosModal from "@/components/VisualizarFotosModal";
import { motion, AnimatePresence } from "framer-motion";

type Finalidade = "VENDA" | "ALUGUEL";
type Status = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

interface ImovelListagemCorretorProps {
  onEdit: (imovelId: string) => void;
  onImovelChange: () => void;
}

const ImovelListagemCorretor: React.FC<ImovelListagemCorretorProps> = ({ onImovelChange }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [fotosModalOpen, setFotosModalOpen] = useState(false);
  const [fotosSelecionadas, setFotosSelecionadas] = useState<{ id: string; url: string }[]>([]);

  const fetchImoveis = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/users/me/imoveis");
      setImoveis(response.data);
    } catch {
      setError("Não foi possível carregar seus imóveis. Verifique sua sessão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImoveis();
  }, []);

  const handleVerFotos = (imovel: Imovel) => {
    if (imovel.fotos?.length) {
      const fotosNormalizadas = imovel.fotos.map((f) => ({
        id: f.id,
        url: resolveFotoUrl(f.url),
      }));
      setFotosSelecionadas(fotosNormalizadas);
      setFotosModalOpen(true);
    }
  };

  const imoveisFiltrados = imoveis.filter((i) =>
    i.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(imoveisFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentImoveis = imoveisFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const [imovelSelecionadoDelete, setImovelSelecionadoDelete] = useState<Imovel | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Carregando portfólio...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-12 text-center">
      <div className="text-red-500 text-lg font-bold mb-2">Ops!</div>
      <p className="text-slate-500">{error}</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* Search and Filters Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/30">
        <FiltroImoveis search={search} onSearchChange={setSearch} />
      </div>

      {imoveisFiltrados.length === 0 ? (
        <div className="p-20 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Home size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum imóvel encontrado</h3>
             <p className="text-slate-400 text-sm max-w-xs mx-auto">
               Parece que você ainda não tem imóveis com esse critério. Comece cadastrando um novo imóvel!
             </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {currentImoveis.map((imovel, idx) => (
              <motion.div
                key={imovel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 hover:bg-blue-50/30 transition-all flex flex-col lg:flex-row items-start lg:items-center gap-6"
              >
                {/* ID / Thumbnail */}
                <div className="relative w-full lg:w-40 h-40 lg:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                   <img 
                      src={resolveFotoUrl(imovel.fotos?.[0]?.url)} 
                      alt={imovel.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleVerFotos(imovel)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-900 shadow-xl active:scale-90 transition-transform"
                      >
                         <Camera size={18} />
                      </button>
                   </div>
                   {imovel.fotos && imovel.fotos.length > 0 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        {imovel.fotos.length} FOTOS
                      </span>
                   )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                         {imovel.tipo} — {imovel.finalidade}
                      </span>
                   </div>
                   <h3 className="text-lg font-black text-slate-950 truncate leading-tight mb-2">
                     {imovel.titulo}
                   </h3>
                   <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                         <MapPin size={12} className="text-slate-300" />
                         {imovel.cidade}, {imovel.estado}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-900 text-sm font-black">
                         <DollarSign size={14} className="text-emerald-500" />
                         R$ {Number(imovel.preco).toLocaleString("pt-BR")}
                      </div>
                   </div>
                </div>

                {/* Status Column */}
                <div className="lg:w-48 flex justify-center lg:justify-end">
                   <StatusDropdown
                      imovelId={imovel.id}
                      currentStatus={(imovel.status?.toUpperCase() || "DISPONIVEL") as Status}
                      finalidade={(imovel.finalidade?.toUpperCase() || "VENDA") as Finalidade}
                      onUpdate={fetchImoveis}
                    />
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2 lg:bg-slate-50 px-3 py-2 rounded-2xl opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => setImovelSelecionado(imovel)}
                     className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all active:scale-90"
                     title="Editar Imóvel"
                   >
                     <Pencil size={18} />
                   </button>
                   <button 
                     onClick={() => setImovelSelecionadoDelete(imovel)}
                     className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                     title="Excluir Imóvel"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Container */}
      <div className="p-8 bg-slate-50/30 border-t border-slate-50">
        <Paginacao currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* MODAIS  */}
      {imovelSelecionado && (
        <EdtiImovel
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          onSave={() => {
            fetchImoveis();
            setImovelSelecionado(null);
            onImovelChange();
          }}
        />
      )}

      {imovelSelecionadoDelete && (
        <DeleteImovelModal
          imovel={imovelSelecionadoDelete}
          onClose={() => setImovelSelecionadoDelete(null)}
          onDeleteSuccess={() => {
            fetchImoveis();
            onImovelChange();
          }}
        />
      )}

      {fotosModalOpen && (
        <VisualizarFotosModal fotos={fotosSelecionadas} onClose={() => setFotosModalOpen(false)} />
      )}
    </div>
  );
};

export default ImovelListagemCorretor;
