import React from "react";
import { resolveFotoUrl } from "@/lib/imageUtils";

interface VisualizarFotosModalProps {
  fotos: { id: string; url: string }[];
  onClose: () => void;
}

const VisualizarFotosModal: React.FC<VisualizarFotosModalProps> = ({ fotos, onClose }) => {
  if (!fotos || fotos.length === 0) return null;



  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold z-[110]"
      >
        ✕
      </button>

      {/* imagem */}
      <img
        src={resolveFotoUrl(fotos[0].url)}
        alt="Foto do imóvel"
        className="
      w-screen
      h-[100dvh]
      object-contain
    "
      />
    </div>
  );
};

export default VisualizarFotosModal;
