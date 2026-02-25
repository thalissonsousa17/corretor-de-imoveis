import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

type Finalidade = "VENDA" | "ALUGUEL";
type Status = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

interface StatusDropdownProps {
  imovelId: string;
  currentStatus: Status;
  finalidade: Finalidade;
  onUpdate: () => void;
}

const statusLabels: Record<Status, string> = {
  DISPONIVEL: "Disponível",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  INATIVO: "Inativo",
};

export default function StatusDropdown({
  imovelId,
  currentStatus,
  finalidade,
  onUpdate,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions: Status[] =
    finalidade === "ALUGUEL"
      ? ["DISPONIVEL", "ALUGADO", "INATIVO"]
      : ["DISPONIVEL", "VENDIDO", "INATIVO"];

  const getStatusStyles = (status: Status): string => {
    switch (status) {
      case "DISPONIVEL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ALUGADO":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "VENDIDO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "INATIVO":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdate = async (newStatus: Status) => {
    if (loading || newStatus === currentStatus) return;
    setLoading(true);
    setIsOpen(false);

    try {
      await axios.patch(
        `/api/public/imovel/${imovelId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      onUpdate();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      // Aqui poderíamos ter um toast de erro mais premium
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left w-full lg:w-36">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        className={`cursor-pointer w-full flex justify-between items-center rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${getStatusStyles(
          currentStatus
        )} focus:outline-none transition-all active:scale-95 shadow-sm hover:shadow-md`}
      >
        <span>{loading ? "..." : statusLabels[currentStatus] || currentStatus}</span>
        <FiChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 
            top-full 
            mt-2 
            w-full
            rounded-2xl 
            shadow-[0_20px_40px_rgba(0,0,0,0.1)] 
            bg-white 
            border border-slate-100
            z-[30]
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-300
          "
        >
          <div className="p-1">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleUpdate(status)}
                className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all
                  ${status === currentStatus 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                {statusLabels[status] || status}
                {status === currentStatus && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
