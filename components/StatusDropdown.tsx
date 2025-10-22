import axios from "axios";
import { useState, useEffect, useRef } from "react";

type Status = "Disponivel" | "Vendido" | "Inativo";

interface StatusDropdownProps {
  imovelId: string;
  currentStatus: Status;
  onUpdate: () => void;
}

const statusOptions: Status[] = ["Disponivel", "Vendido", "Inativo"];

export default function StatusDropdown({ imovelId, currentStatus, onUpdate }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div ref={dropdownRef} className="relative inline-block text-left ml-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        className="cursor-pointer inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {loading ? "Aguarde..." : "Mudar Status"}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleUpdate(status)}
              className={`block w-full text-left px-4 py-2 text-sm transition ${
                status === currentStatus
                  ? "bg-green-200 text-green-700"
                  : "text-gray-700 hover:bg-green-100"
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
