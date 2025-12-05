import React from "react";

interface PortalCobrancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function PortalCobrancaModal({ isOpen, onClose, url }: PortalCobrancaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="
          bg-white rounded-xl shadow-xl
          w-full max-w-4xl
          h-[85vh]
          relative overflow-hidden
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 
            bg-red-600 text-white 
            px-3 py-1 rounded 
            hover:bg-red-700
            text-sm md:text-base
          "
        >
          Fechar
        </button>

        <iframe src={url} className="w-full h-full border-0" />
      </div>
    </div>
  );
}
