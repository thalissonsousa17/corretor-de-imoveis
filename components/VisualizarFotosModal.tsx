import React from "react";

interface VisualizarFotosModalProps {
  fotos: { id: string; url: string }[];
  onClose: () => void;
}

const VisualizarFotosModal: React.FC<VisualizarFotosModalProps> = ({ fotos, onClose }) => {
  if (!fotos || fotos.length === 0) return null;

  function resolveFotoUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http")) return url;

    const fileName = url.split("/").pop();

    return `/api/uploads/${fileName}`;
  }

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
      max-w-[98vw]
      max-h-[95vh]
      object-contain
      rounded-xl
      shadow-2xl
    "
      />
    </div>
  );
};

export default VisualizarFotosModal;
