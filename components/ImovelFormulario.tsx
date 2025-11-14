// components/ImovelFormulario.tsx (VERSÃO ATUALIZADA PARA EDIÇÃO E CADASTRO)

import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Imovel, Foto } from "@/types/Imovel";
import BuscaEndereco from "./BuscaEndereco";
import { Endereco } from "../types/endereco";
import FotosUploader from "./FotosUploader";
//import { Finalidade } from "@prisma/client";

// INTERFACES

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
  // ----------------------------------------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------------------------------------
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

  const [cep, setCep] = useState("");
  //const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");

  // Buscar dados pelo CEP

  const handleEnderecoAchado = (endereco: Endereco, cep: string) => {
    setFormData((prev) => ({
      ...prev,
      cep: cep || prev.cep,
      rua: endereco.logradouro || "",
      bairro: endereco.bairro || "",
      cidade: endereco.localidade || prev.cidade,
      estado: endereco.uf || prev.estado,
      numero: prev.numero,
    }));
  };

  // EFEITO: CARREGAR DADOS NA EDIÇÃO

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
            preco: (imovel.preco ?? "").toString(),
            tipo: imovel.tipo,
            cep: imovel.cep ?? "",
            rua: imovel.rua ?? "",
            bairro: imovel.bairro ?? "",
            numero: imovel.numero ?? "",
            cidade: imovel.cidade,
            estado: imovel.estado,
            localizacao: imovel.localizacao,
            finalidade: imovel.finalidade ?? "VENDA",
          });
          setCep(imovel.cep ?? "");
          //setNumero(imovel.numero ?? "");

          setExistingPhotos(imovel.fotos.map((f) => ({ ...f, toBeDeleted: false })));
        })
        .catch((err) => {
          setMessage({ text: "Erro ao carregar dados do imóvel para edição.", type: "error" });
          console.error("Erro de GET:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, imovelId]);

  //Editando aqui
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("📸 (ImovelFormulario) Recebendo arquivos do filho:", files);

    if (!files || files.length === 0) {
      console.warn("⚠️ Nenhum arquivo recebido.");
      return;
    }

    const fileArray = Array.from(files);
    const dataTransfer = new DataTransfer();
    fileArray.forEach((file) => dataTransfer.items.add(file));

    setFotosSelecionadas(files); // <-- salva o FileList original
  };

  // Toggle para marcar/desmarcar foto para remoção
  const handlePhotoToggle = (photoId: string) => {
    setExistingPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, toBeDeleted: !photo.toBeDeleted } : photo
      )
    );
  };

  // Envio do Formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const data = new FormData();

    // 1. Anexa os dados do formulário
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof FormState];
      data.append(key, typeof value === "boolean" ? String(value) : value || "");
    });

    data.append("cep", cep);
    data.append("rua", rua);
    data.append("bairro", bairro);
    data.append("numero", formData.numero ?? "");

    // 2. Adiciona o imovelId (necessário para o upload backend)
    if (imovelId) {
      console.log("📦 Adicionando imovelId no FormData:", imovelId);
      data.append("imovelId", imovelId);
    }

    // 3. Anexa as fotos a remover (apenas no modo edição)
    if (isEditMode) {
      const photosToDelete = existingPhotos.filter((f) => f.toBeDeleted).map((f) => f.id);
      if (photosToDelete.length > 0) {
        data.append("fotosRemover", JSON.stringify(photosToDelete));
        console.log("🗑️ Fotos marcadas para remover:", photosToDelete);
      }
    }

    // 4. Anexa as novas fotos
    const fotosParaEnviar = fotosSelecionadas || fotos;
    if (fotosParaEnviar && fotosParaEnviar.length > 0) {
      for (let i = 0; i < fotosParaEnviar.length; i++) {
        data.append("fotos", fotosParaEnviar[i]);
      }
    } else if (!isEditMode) {
      setMessage({
        text: "Por favor, selecione pelo menos uma foto para o cadastro.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // Debug do que será enviado
    for (const [key, value] of data.entries()) {
      console.log("🧩 FormData:", key, value);
    }

    try {
      let response;
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (isEditMode) {
        response = await axios.put(`/api/imoveis/${imovelId}`, data, config);
      } else {
        response = await axios.post("/api/imoveis", data, config);
      }

      setMessage({
        text:
          response.data.message ||
          `Imóvel ${isEditMode ? "atualizado" : "cadastrado"} com sucesso!`,
        type: "success",
      });
      onSuccess();

      // Limpa formulário após envio
      if (!isEditMode) {
        setFormData({
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
        setFotos(null);
        setFotosSelecionadas(null);
      } else {
        const updatedImovel = response.data.imovel || response.data;
        setExistingPhotos(
          updatedImovel.fotos
            ? updatedImovel.fotos.map((f: Foto) => ({ ...f, toBeDeleted: false }))
            : []
        );
        setFotos(null);
      }
    } catch (error: unknown) {
      let errorMsg = "Erro ao processar imóvel. Verifique o console.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setMessage({ text: errorMsg, type: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setEstado = (value: string) => {
    setFormData((prev) => ({ ...prev, estado: value }));
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="space-y-6 p-6 bg-white text-gray-600 rounded-lg shadow-xl"
    >
      {/* Mensagem de Status */}
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

      {/* Linha 1: Título */}
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

      {/* Linha 2: Descrição */}
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

        {/* Contador de caracteres */}
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

      {/* Linha 3: Preço e Tipo */}
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

      {/* Linha 4.1 : Cep e Número */}

      <h3 className="text-xl font-medium text-gray-800 pt-4 border-t mt-6">Endereço Completo</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Campo CEP */}
        <div className="md:col-span-2">
          <BuscaEndereco onEnderecoAchado={handleEnderecoAchado} />

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
              onChange={(e) => setRua(e.target.value)}
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
              onChange={(e) => setBairro(e.target.value)}
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
              // ... (atributos)
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
              // ... (atributos)
              type="text"
              name="estado"
              id="estado"
              maxLength={2}
              value={formData.estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Linha 7: Fotos */}
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

      {/* Linha de Upload de Fotos */}
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
