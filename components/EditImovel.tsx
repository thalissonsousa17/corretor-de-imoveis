import React, { useEffect, useState } from "react";
import { Imovel } from "@/types/Imovel";
import FotosUploader from "./FotosUploader";

interface EditImovelProps {
  imovel: Imovel;
  onClose: () => void;
  onSave: (imovelAtualizado: Imovel) => void;
}

const EditImovel: React.FC<EditImovelProps> = ({ imovel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    cidade: "",
    estado: "",
    bairro: "",
    rua: "",
    numero: "",
    cep: "",
    tipo: "",
  });

  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [fotosExistentes, setFotosExistentes] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    if (imovel) {
      setFormData({
        titulo: imovel.titulo || "",
        descricao: imovel.descricao || "",
        preco: `${imovel.preco ?? ""}`,
        cidade: imovel.cidade || "",
        estado: imovel.estado || "",
        bairro: imovel.bairro || "",
        rua: imovel.rua || "",
        numero: imovel.numero || "",
        cep: imovel.cep || "",
        tipo: imovel.tipo || "",
      });

      if (imovel.fotos) {
        setFotosExistentes(imovel.fotos.map((foto) => ({ id: foto.id, url: foto.url })));
      }
    }
  }, [imovel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  Deletar foto existente (rota API: /api/imoveis/fotos/[id].ts)
  const handleDeleteFotoDoBanco = async (fotoId: string) => {
    try {
      console.log("Deletando foto ID:", fotoId);

      const res = await fetch(`/api/fotos/${fotoId}`, { method: "DELETE" });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ao excluir foto: ${msg}`);
      }

      setFotosExistentes((prev) => prev.filter((foto) => foto.id !== fotoId));
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro ao atualizar imóvel");

      if (newFiles && newFiles.length > 0) {
        const formDataUpload = new FormData();
        Array.from(newFiles).forEach((file) => {
          formDataUpload.append("fotos", file);
        });
        formDataUpload.append("imovelId", imovel.id);

        const uploadRes = await fetch("/api/fotos/upload", {
          method: "POST",
          body: formDataUpload,
        });
        if (!uploadRes.ok) throw new Error("Erro ao enviar novas fotos");
      }

      const atualizarImovel = await fetch(`/api/imoveis/${imovel.id}`);
      const imovelAtualizado = await atualizarImovel.json();

      onSave(imovelAtualizado);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações.");
    }
  };

  const recarregarFotos = async () => {
    if (!imovel.id) return;

    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`);
      if (!res.ok) throw new Error("Erro ao buscar fotos");

      const data = await res.json();

      if (data?.fotos) {
        setFotosExistentes(
          data.fotos.map((foto: { id: string; url: string }) => ({
            id: foto.id,
            url: foto.url,
          }))
        );
      }
    } catch (err) {
      console.error("Erro ao recarregar fotos:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-700">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">Editar Imóvel</h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="titulo"
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="preco"
            placeholder="Preço"
            type="number"
            value={formData.preco}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="estado"
            placeholder="Estado"
            value={formData.estado}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="bairro"
            placeholder="Bairro"
            value={formData.bairro}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="rua"
            placeholder="Rua"
            value={formData.rua}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="numero"
            placeholder="Número"
            value={formData.numero}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="cep"
            placeholder="CEP"
            value={formData.cep}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <input
            name="tipo"
            placeholder="Tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          <textarea
            name="descricao"
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            className="border rounded p-2 col-span-2 w-full"
          />
        </div>

        {imovel.id && (
          <FotosUploader
            imovelId={imovel.id}
            existingPhotos={fotosExistentes}
            recarregarFotos={recarregarFotos}
            onChange={(e) => setNewFiles(e.target.files)}
            onDeleteExisting={handleDeleteFotoDoBanco}
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-gray-100 rounded hover:bg-blue-700 cursor-pointer"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImovel;
