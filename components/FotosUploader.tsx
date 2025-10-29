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
}

const FotosUploader: React.FC<FotosUploaderProps> = ({
  imovelId,
  existingPhotos = [],
  fotosExternas,
  onChange,
  onDeleteExisting,
}) => {
  console.log("Enviando com imovelId:", imovelId);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // carrega fotos já existentes (modo edição)
  useEffect(() => {
    if (existingPhotos.length > 0) {
      setFotos(existingPhotos.map((f) => ({ id: f.id, url: f.url })));
    }
  }, [existingPhotos]);

  // chamado ao escolher novas imagens
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("📸 FotosUploader: onChange chamado, files:", files);

    if (!files || files.length === 0) return;

    // preview local
    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));
    setFotos((prev) => [...prev, ...previews]);

    // envia o evento original pro pai (sem limpar o input)
    onChange(e);
  };

  const handleDeleteFoto = (foto: Foto) => {
    if (foto.id && onDeleteExisting) onDeleteExisting(foto.id);
    setFotos((prev) =>
      foto.id ? prev.filter((f) => f.id !== foto.id) : prev.filter((f) => f.url !== foto.url)
    );
  };

  // sincroniza fotos externas do pai (quando o estado muda lá)
  useEffect(() => {
    if (!fotosExternas) return;
    const novas = Array.from(fotosExternas).map((f) => ({
      url: URL.createObjectURL(f),
      isNew: true,
    }));
    setFotos(novas);
  }, [fotosExternas]);

  // limpa URLs temporárias
  useEffect(() => {
    return () => {
      fotos.forEach((f) => f.isNew && URL.revokeObjectURL(f.url));
    };
  }, [fotos]);

  return (
    <div className="border rounded-md bg-gray-50 mt-6 p-4 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Fotos do Imóvel</h3>

      <div className="flex flex-col items-center justify-center space-y-2">
        <label
          htmlFor="fotos"
          className="cursor-pointer flex flex-col items-center justify-center text-blue-600 hover:text-blue-800"
        >
          <Camera className="w-10 h-10 mb-1" />
          <span>Selecionar fotos (máx. 10)</span>
        </label>

        <input
          id="fotos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-sm text-gray-700">
          {fotos.length > 0
            ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} selecionada${fotos.length > 1 ? "s" : ""}`
            : "Nenhuma foto selecionada"}
        </p>

        {fotos.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
          >
            Ver fotos
          </button>
        )}
      </div>

      {modalOpen && (
        <ModalFotos
          fotos={fotos}
          onClose={() => setModalOpen(false)}
          onDeleteFoto={handleDeleteFoto}
        />
      )}
    </div>
  );
};

export default FotosUploader;
