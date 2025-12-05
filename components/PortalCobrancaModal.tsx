import React from "react";

interface PortalCobrancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function PortalCobrancaModal({ isOpen, onClose, url }: PortalCobrancaModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] h-[90%] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Fechar
        </button>

        <iframe src={url} className="w-full h-full border-0" />
      </div>
    </div>
  );
}
