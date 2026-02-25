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

  // SINCRONIZAÇÃO COM FOTOS DO BANCO
  useEffect(() => {
    setFotos(
      existingPhotos.map((f) => {
        return { id: f.id, url: f.url };
      })
    );
  }, [existingPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previews = Array.from(files).map((file) => {
      // Cria URL temporária (blob:) para visualizar antes de subir pro servidor
      const url = URL.createObjectURL(file);
      return { url, isNew: true };
    });

    setFotos((prev) => [...prev, ...previews]);
    onChange(e);
  };

  // LIMPEZA DE MEMÓRIA (Blobs)
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
    // Se a foto já existe no banco, chama a função de deletar do pai
    if (foto.id && onDeleteExisting) onDeleteExisting(foto.id);

    // Remove da lista local para atualizar a interface imediatamente
    setFotos((prev) =>
      foto.id ? prev.filter((f) => f.id !== foto.id) : prev.filter((f) => f.url !== foto.url)
    );
  };

  // RESET SE O FORMULÁRIO FOR LIMPO
  useEffect(() => {
    if (fotosExternas === null && !imovelId) {
      setFotos([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [fotosExternas, imovelId]);

  return (
    <div className="bg-gray-50/50 rounded-xl p-4 md:p-6 text-center border border-dashed border-gray-300 hover:border-blue-500 transition-all group">
      <Camera className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2 mx-auto group-hover:scale-110 transition-transform" />

      <label
        htmlFor="fotos"
        className="text-blue-600 text-sm md:text-base font-semibold cursor-pointer hover:underline block"
      >
        Selecionar fotos (máx. 20)
      </label>

      <input
        id="fotos"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={inputRef}
      />

      <p className="text-xs md:text-sm text-gray-500 mt-2">
        {fotos.length > 0
          ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} selecionada${fotos.length > 1 ? "s" : ""}`
          : "Arraste fotos aqui ou clique para selecionar"}
      </p>
      <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
        Dica: Use fotos na horizontal (paisagem) em 3:2 ou 4:3 (ex: 1200x800px) para preencher o card perfeitamente.
      </p>

      {fotos.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setModalOpen(true);
          }}
          className="cursor-pointer text-blue-700 font-semibold hover:text-blue-800 text-xs md:text-sm mt-4 px-5 py-2 bg-blue-100/50 hover:bg-blue-100 rounded-full border border-blue-200 transition-colors"
        >
          🖼️ Ver e Gerenciar fotos
        </button>
      )}

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
