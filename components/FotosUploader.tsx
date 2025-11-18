import { Camera } from "lucide-react";
import React, { useEffect, useState } from "react";
import ModalFotos from "./ModalFotos";

interface Foto {
  id?: string;
  url: string;
  isNew?: boolean;
}

interface FotosUploaderProps {
  imovelId: string | null | undefined;
  existingPhotos?: { id: string; url: string }[];
  fotosExternas?: FileList | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteExisting?: (id: string) => void;
  recarregarFotos?: () => void;
}

const FotosUploader: React.FC<FotosUploaderProps> = ({
  imovelId,
  existingPhotos = [],
  fotosExternas,
  onChange,
  onDeleteExisting,
  recarregarFotos,
}) => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Carrega fotos já existentes (edição)
  useEffect(() => {
    if (existingPhotos.length > 0) {
      setFotos(existingPhotos.map((f) => ({ id: f.id, url: f.url })));
    }
  }, [existingPhotos]);

  // Handle alteração dos arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    setFotos((prev) => [...prev, ...previews]);

    onChange(e);
  };

  const handleDeleteFoto = (foto: Foto) => {
    if (foto.id && onDeleteExisting) onDeleteExisting(foto.id);
    setFotos((prev) =>
      foto.id ? prev.filter((f) => f.id !== foto.id) : prev.filter((f) => f.url !== foto.url)
    );
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-white mt-6 p-6 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Fotos do Imóvel</h3>

      {/* Área central */}
      <label
        htmlFor="fotos"
        className="group cursor-pointer flex flex-col items-center justify-center p-6 rounded-xl 
        border border-dashed border-gray-300 hover:border-blue-500 transition-all"
      >
        <Camera className="w-10 h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />

        <span className="text-blue-600 text-base font-medium group-hover:underline">
          Selecionar fotos (máx. 10)
        </span>

        <input
          id="fotos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-sm text-gray-600 mt-2">
          {fotos.length > 0
            ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} selecionada${fotos.length > 1 ? "s" : ""}`
            : "Nenhuma foto selecionada"}
        </p>

        {fotos.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-blue-600 hover:underline text-sm mt-2"
          >
            Ver fotos
          </button>
        )}
      </label>

      {modalOpen && (
        <ModalFotos
          fotos={fotos}
          imovelId={imovelId}
          onClose={() => {
            setModalOpen(false);
            recarregarFotos?.();
          }}
          onDeleteFoto={handleDeleteFoto}
        />
      )}
    </div>
  );
};

export default FotosUploader;
