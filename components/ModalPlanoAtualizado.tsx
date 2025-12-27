import { CheckCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ModalPlanoAtualizado({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 text-center">
        <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />

        <h2 className="text-xl font-bold text-[#1A2A4F] mb-2">Plano atualizado com sucesso!</h2>

        <p className="text-gray-600 mb-6">
          Seu novo plano já está ativo e os limites foram atualizados.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Ok, continuar
        </button>
      </div>
    </div>
  );
}
