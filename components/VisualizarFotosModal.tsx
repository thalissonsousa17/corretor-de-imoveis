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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-700">
          Fotos do Imóvel
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="rounded-lg overflow-hidden shadow-md bg-gray-100">
              <img
                src={resolveFotoUrl(foto.url)}
                alt="Foto do imóvel"
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400?text=Erro+ao+carregar";
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualizarFotosModal;
