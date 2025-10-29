import axios from "axios";
import { useState, useEffect, useRef } from "react";

type Finalidade = "VENDA" | "ALUGUEL";
type Status = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";

interface StatusDropdownProps {
  imovelId: string;
  currentStatus: Status;
  finalidade: Finalidade;
  onUpdate: () => void;
}

export default function StatusDropdown({
  imovelId,
  currentStatus,
  finalidade,
  onUpdate,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Opções dinâmicas baseadas na finalidade
  const statusOptions: Status[] =
    finalidade === "ALUGUEL"
      ? ["DISPONIVEL", "ALUGADO", "INATIVO"]
      : ["DISPONIVEL", "VENDIDO", "INATIVO"];

  // Cores por status
  const getStatusColor = (status: Status): string => {
    switch (status) {
      case "DISPONIVEL":
        return "bg-green-100 text-green-800 border-green-400";
      case "ALUGADO":
        return "bg-orange-100 text-orange-800 border-orange-400";
      case "VENDIDO":
        return "bg-blue-100 text-blue-800 border-blue-400";
      case "INATIVO":
        return "bg-red-100 text-red-800 border-red-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualiza o status no backend
  const handleUpdate = async (newStatus: Status) => {
    if (loading || newStatus === currentStatus) return;
    setLoading(true);
    setIsOpen(false);

    try {
      await axios.patch(`/api/imoveis/${imovelId}`, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Falha ao atualizar o status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Botão que mostra o status atual */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        className={`cursor-pointer inline-flex justify-center items-center rounded-md border px-3 py-1 text-sm font-bold uppercase ${getStatusColor(currentStatus)} focus:outline-none transition`}
      >
        {loading ? "Atualizando..." : currentStatus}
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 text-gray-700 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleUpdate(status)}
              className={`block w-full text-left px-4 py-2 text-sm uppercase transition hover:bg-gray-500 ${
                status === currentStatus ? "font-semibold bg-gray-900 text-gray-100" : ""
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
