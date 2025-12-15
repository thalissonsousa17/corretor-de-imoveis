import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Imovel, Foto } from "@/types/Imovel";
import BuscaEndereco from "./BuscaEndereco";
import { Endereco } from "../types/endereco";
import FotosUploader from "./FotosUploader";

interface FormState {
  titulo: string;
  descricao: string;
  preco: string;
  tipo: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  cidade: string;
  estado: string;
  localizacao: string;
  finalidade: "VENDA" | "ALUGUEL";
}

interface ExistingPhoto extends Foto {
  toBeDeleted: boolean;
}

interface ImovelFormularioProps {
  imovelId?: string | null;
  onSuccess: () => void;
}

const ImovelFormulario: React.FC<ImovelFormularioProps> = ({ imovelId, onSuccess }) => {
  const isEditMode = !!imovelId;

  const [formData, setFormData] = useState<FormState>({
    titulo: "",
    descricao: "",
    preco: "",
    tipo: "APARTAMENTO",
    bairro: "",
    rua: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    localizacao: "",
    finalidade: "VENDA",
  });

  const [fotos, setFotos] = useState<FileList | null>(null);
  const [fotosSelecionadas, setFotosSelecionadas] = useState<FileList | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const handleEnderecoAchado = (endereco: Endereco, cep: string) => {
    setFormData((prev) => ({
      ...prev,
      cep,
      rua: endereco.logradouro || "",
      bairro: endereco.bairro || "",
      cidade: endereco.localidade || prev.cidade,
      estado: endereco.uf || prev.estado,
    }));
  };

  useEffect(() => {
    if (isEditMode && imovelId) {
      setLoading(true);
      axios
        .get(`/api/imoveis/${imovelId}`)
        .then((response) => {
          const imovel: Imovel = response.data;
          setFormData({
            titulo: imovel.titulo,
            descricao: imovel.descricao,
            preco: imovel.preco?.toString() ?? "",
            tipo: imovel.tipo,
            bairro: imovel.bairro ?? "",
            rua: imovel.rua ?? "",
            numero: imovel.numero ?? "",
            cep: imovel.cep ?? "",
            cidade: imovel.cidade,
            estado: imovel.estado,
            localizacao: imovel.localizacao,
            finalidade: imovel.finalidade ?? "VENDA",
          });

          setExistingPhotos(imovel.fotos.map((f) => ({ ...f, toBeDeleted: false })));
        })
        .catch(() => {
          setMessage({ text: "Erro ao carregar dados do imóvel.", type: "error" });
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, imovelId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFotosSelecionadas(e.target.files);
    }
  };

  const handlePhotoToggle = (photoId: string) => {
    setExistingPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, toBeDeleted: !photo.toBeDeleted } : photo
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const data = new FormData();

    // ✅ MODELO 1 — envia SOMENTE o que está preenchido
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        data.append(key, value);
      }
    });

    if (imovelId) {
      data.append("imovelId", imovelId);
    }

    if (isEditMode) {
      const fotosRemover = existingPhotos.filter((f) => f.toBeDeleted).map((f) => f.id);

      if (fotosRemover.length > 0) {
        data.append("fotosRemover", JSON.stringify(fotosRemover));
      }
    }

    const fotosParaEnviar = fotosSelecionadas || fotos;
    if (fotosParaEnviar && fotosParaEnviar.length > 0) {
      Array.from(fotosParaEnviar).forEach((file) => {
        data.append("fotos", file);
      });
    } else if (!isEditMode) {
      setMessage({ text: "Selecione ao menos uma foto.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = isEditMode
        ? await axios.put(`/api/imoveis/${imovelId}`, data)
        : await axios.post("/api/imoveis", data);

      setMessage({
        text: response.data.message || "Imóvel salvo com sucesso!",
        type: "success",
      });

      onSuccess();
    } catch {
      setMessage({ text: "Erro ao salvar imóvel.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="space-y-6 p-6 bg-white text-gray-600 rounded-lg shadow-xl"
    >
      {message.text && (
        <div
          className={`p-3 rounded-md text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
        {isEditMode ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
      </h2>

      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          name="titulo"
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/*  Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição Detalhada
        </label>

        <textarea
          name="descricao"
          id="descricao"
          value={formData.descricao || ""}
          onChange={(e) => {
            if (e.target.value.length <= 2000) {
              setFormData({ ...formData, descricao: e.target.value });
            }
          }}
          className="
      mt-1 
      block 
      w-full 
      min-h-[12rem] 
      h-64 
      border 
      border-gray-300 
      rounded-md 
      shadow-sm 
      p-3 
      text-gray-700 
      bg-white 
      resize-y 
      overflow-y-auto 
      focus:ring-blue-500 
      focus:border-blue-500
    "
          placeholder="Descreva todos os detalhes do imóvel, área de lazer, diferenciais e informações de contato..."
        />

        <div className="flex justify-between text-sm mt-2">
          <span
            className={`${
              (formData.descricao?.length || 0) >= 3000
                ? "text-red-500 font-medium"
                : "text-gray-500"
            }`}
          >
            Caracteres: {formData.descricao?.length || 0} / 3000
          </span>

          {(formData.descricao?.length || 0) >= 3000 && (
            <span className="text-red-500 font-medium">Limite máximo atingido!</span>
          )}
        </div>
      </div>

      {/*  Preço e Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700">
            Valor (R$)
          </label>
          <input
            type="number"
            name="preco"
            id="preco"
            value={formData.preco}
            onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
            required
            min="0"
            step="0.01"
            placeholder=" 150000.00"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo de Imóvel
          </label>
          <select
            name="tipo"
            id="tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="APARTAMENTO">Apartamento</option>
            <option value="CASA">Casa</option>
            <option value="TERRENO">Terreno</option>
            <option value="COMERCIAL">Comercial</option>
          </select>
        </div>
        <div>
          <label htmlFor="finalidade" className="block text-sm font-medium text-gray-700">
            Finalidade
          </label>
          <select
            name="finalidade"
            id="finalidade"
            value={formData.finalidade}
            onChange={(e) =>
              setFormData({ ...formData, finalidade: e.target.value as "VENDA" | "ALUGUEL" })
            }
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="VENDA">Venda</option>
            <option value="ALUGUEL">Aluguel</option>
          </select>
        </div>
      </div>

      {/*  Cep e Número */}

      <h3 className="text-xl font-medium text-gray-800 pt-4 border-t mt-6">Endereço Completo</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Campo CEP */}
        <div className="md:col-span-2">
          <BuscaEndereco
            onEnderecoAchado={handleEnderecoAchado}
            cep={formData.cep ?? ""}
            onCepChange={(novoCep) => setFormData((prev) => ({ ...prev, cep: novoCep }))}
          />

          {/* Campo Número */}
          <div className="md:col-span-2">
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
              Número *
            </label>
            <input
              name="numero"
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          {/* Bloco RUA */}
          <div>
            <label htmlFor="rua" className="block text-sm font-medium text-gray-700">
              Rua/Logradouro
            </label>
            <input
              type="text"
              name="rua"
              id="rua"
              value={formData.rua}
              onChange={(e) => setFormData((prev) => ({ ...prev, rua: e.target.value }))}
              // onChange={(e) => setRua(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
          {/* Bloco BAIRRO */}
          <div className="md:col-span-2">
            <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
              Bairro
            </label>
            <input
              type="text"
              name="bairro"
              id="bairro"
              value={formData.bairro}
              onChange={(e) => setFormData((prev) => ({ ...prev, bairro: e.target.value }))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          {/* Bloco CIDADE */}
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
          {/* Bloco ESTADO */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado (Sigla)
            </label>
            <input
              type="text"
              name="estado"
              id="estado"
              maxLength={2}
              value={formData.estado}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estado: e.target.value.toUpperCase(),
                }))
              }
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/*  Fotos */}
      {isEditMode && existingPhotos.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2 text-gray-800">Fotos Existentes</h3>
          <div className="flex flex-wrap gap-3">
            {existingPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`relative border-2 rounded-lg overflow-hidden w-24 h-24 ${photo.toBeDeleted ? "border-red-500 opacity-50" : "border-green-500"}`}
              >
                <img
                  src={photo.url}
                  alt={`Foto ${photo.ordem}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoToggle(photo.id)}
                  className={`absolute top-0 right-0 p-1 text-white text-xs font-bold rounded-bl-lg ${photo.toBeDeleted ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                >
                  {photo.toBeDeleted ? "Remover? (Desfazer)" : "Manter (Remover?)"}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fotos marcadas em vermelho serão excluídas na atualização.
          </p>
        </div>
      )}

      <FotosUploader
        imovelId={imovelId}
        existingPhotos={existingPhotos}
        onChange={handleFileChange}
        fotosExternas={fotosSelecionadas}
      />

      {/* Botão de Submissão */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 cursor-pointer border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
      >
        {loading ? "Processando..." : isEditMode ? "Salvar Alterações" : "Cadastrar Imóvel"}
      </button>
    </form>
  );
};

export default ImovelFormulario;
