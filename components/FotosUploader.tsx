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
        // Limpa barras invertidas (comum em Windows) e garante o caminho limpo
        const cleanUrl = f.url.replace(/\\/g, "/");
        return { id: f.id, url: cleanUrl };
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
    <div className="border border-gray-300 rounded-xl bg-white mt-6 p-4 md:p-6 text-center shadow-sm w-full">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Fotos do Imóvel</h3>

      <div
        className="group relative flex flex-col items-center justify-center 
        p-4 md:p-6 rounded-xl w-full
        border border-dashed border-gray-300 
        hover:border-blue-500 transition-all bg-gray-50/50"
      >
        <Camera className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />

        <label
          htmlFor="fotos"
          className="text-blue-600 text-sm md:text-base font-medium cursor-pointer hover:underline"
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

        <p className="text-xs md:text-sm text-gray-600 mt-2">
          {fotos.length > 0
            ? `${fotos.length} foto${fotos.length > 1 ? "s" : ""} carregada${fotos.length > 1 ? "s" : ""}`
            : "Nenhuma foto selecionada"}
        </p>

        {fotos.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault(); // Evita qualquer comportamento de submit inesperado
              setModalOpen(true);
            }}
            className="cursor-pointer text-blue-700 font-semibold hover:text-blue-900 text-xs md:text-sm mt-3 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100"
          >
            Ver e Gerenciar fotos
          </button>
        )}
      </div>

      {modalOpen && (
        <ModalFotos
          fotos={fotos}
          imovelId={imovelId}
          onClose={() => {
            setModalOpen(false);
            recarregarFotos?.(); // Importante para atualizar a lista após salvar no banco
          }}
          onDeleteFoto={handleDeleteFoto}
        />
      )}
    </div>
  );
};

export default FotosUploader;
