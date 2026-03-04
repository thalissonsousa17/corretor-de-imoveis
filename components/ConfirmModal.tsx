import { useEffect } from "react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  danger = true,
}: ConfirmModalProps) {
  // Fechar com Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="relative bg-[#1a1814] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b8912a]" />

        <div className="px-6 pt-7 pb-6">
          <p className="text-white text-sm leading-relaxed">{message}</p>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(); onCancel(); }}
              className={`px-5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                danger
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#b8912a] hover:bg-[#a07820] text-[#1a1814]"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
