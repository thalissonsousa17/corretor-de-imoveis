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

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFotos(
      existingPhotos.map((f) => {
        let url = f.url.replace(/\\/g, "/");
        if (!url.startsWith("/")) url = "/" + url;
        return { id: f.id, url };
      })
    );
  }, [existingPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previews = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return { url, isNew: true };
    });

    setFotos((prev) => [...prev, ...previews]);
    onChange(e);
  };

  useEffect(() => {
    return () => {
      fotos.forEach((foto) => {
        if (foto.isNew) {
          URL.revokeObjectURL(foto.url);
        }
      });
    };
  }, [fotos]);

  const handleDeleteFoto = (foto: Foto) => {
    if (foto.id && onDeleteExisting) onDeleteExisting(foto.id);
    setFotos((prev) =>
      foto.id ? prev.filter((f) => f.id !== foto.id) : prev.filter((f) => f.url !== foto.url)
    );
  };

  useEffect(() => {
    if (fotosExternas === null && !imovelId) {
      setFotos([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [fotosExternas, imovelId]);

  return (
    <div className="border border-gray-300 rounded-xl bg-white mt-6 p-4 md:p-6 text-center shadow-sm w-full">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Fotos do Imóvel</h3>

      <label
        htmlFor="fotos"
        className="group cursor-pointer flex flex-col items-center justify-center 
        p-4 md:p-6 rounded-xl w-full
        border border-dashed border-gray-300 
        hover:border-blue-500 transition-all"
      >
        <Camera className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />

        <span className="text-blue-600 text-sm md:text-base font-medium group-hover:underline">
          Selecionar fotos (máx. 20)
        </span>

        <input
          id="fotos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          ref={inputRef}
        />

        <p className="text-xs md:text-sm text-gray-600 mt-2">
          {fotos.length > 0
            ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} selecionada${fotos.length > 1 ? "s" : ""}`
            : "Nenhuma foto selecionada"}
        </p>

        {fotos.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-blue-600 hover:underline text-xs md:text-sm mt-2"
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
