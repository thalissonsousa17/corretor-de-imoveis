import React, { useEffect, useState } from "react";
import { Imovel } from "@/types/Imovel";

interface EditImovelProps {
  imovel: Imovel;
  onClose: () => void;
  onSave: (imovelAtualizado: Imovel) => void;
}

const EdtiImovel: React.FC<EditImovelProps> = ({ imovel, onClose, onSave }) => {
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
    }
  }, [imovel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro ao atualizar imóvel");

      const data = await res.json();
      onSave(data);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações.");
    }
  };

  return (
    <div className="fixed inset-0 bg-blck/50 flex items-center justify-center z-50 text-gray-600">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow lg">
        <h2 className="text-xl font-semibold mb-4">Editar Imóvel</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* título */}
          <input
            name="titulo"
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Preço */}
          <input
            name="preco"
            placeholder="Preço"
            type="number"
            value={formData.preco}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Cidade */}
          <input
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Estado */}
          <input
            name="estado"
            placeholder="Estado"
            value={formData.estado}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Bairro */}
          <input
            name="bairro"
            placeholder="Bairro"
            value={formData.bairro}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Rua */}
          <input
            name="rua"
            placeholder="Rua"
            value={formData.rua}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Número */}
          <input
            name="numero"
            placeholder="Número"
            value={formData.numero}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Cep */}
          <input
            name="cep"
            placeholder="CEP"
            value={formData.cep}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Tipo */}
          <input
            name="tipo"
            placeholder="Tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
          {/* Descrição */}
          <input
            name="descricao"
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            className="border rounded p-2 col-span-2 w-full"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer bg-gray200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-gray-200 cursor-pointer rounded hover:bg-blue-700 "
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EdtiImovel;
