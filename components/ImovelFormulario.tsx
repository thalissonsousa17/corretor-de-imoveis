// components/ImovelFormulario.tsx (VERSÃO ATUALIZADA PARA EDIÇÃO E CADASTRO)

import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Imovel, Foto } from "@/types/Imovel";
import BuscaEndereco from "./BuscaEndereco";
import { Endereco } from "../types/endereco";
// ----------------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------------
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
  localizacao: string; // Adicionado, conforme seu schema
  disponivel: boolean; // Adicionado, para o modo edição
}

interface ExistingPhoto extends Foto {
  toBeDeleted: boolean; // Flag para marcar fotos para remoção
}

interface ImovelFormularioProps {
  imovelId?: string | null; // Se for null, é Cadastro (POST)
  onSuccess: () => void; // Função para ser chamada no sucesso
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
    localizacao: "", // Valor inicial para o novo campo
    disponivel: true, // Valor inicial para o novo campo
  });
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]); // Fotos carregadas
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
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
      numero: numero || prev.numero,
    }));
    setMessage({ text: "Endereço preemchido com sucesso", type: "success" });
  };

  // EFEITO: CARREGAR DADOS NA EDIÇÃO
  // ----------------------------------------------------------------------------------
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
            disponivel: imovel.disponivel,
          });
          setCep(imovel.cep ?? "");
          setNumero(imovel.numero ?? "");

          setExistingPhotos(imovel.fotos.map((f) => ({ ...f, toBeDeleted: false })));
        })
        .catch((err) => {
          setMessage({ text: "Erro ao carregar dados do imóvel para edição.", type: "error" });
          console.error("Erro de GET:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, imovelId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Lida com checkbox 'disponivel'
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(e.target.files);
    }
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
    data.append("numero", numero);

    // 2. Anexa as fotos a remover (apenas no modo edição)
    if (isEditMode) {
      const photosToDelete = existingPhotos.filter((f) => f.toBeDeleted).map((f) => f.id);
      if (photosToDelete.length > 0) {
        data.append("fotosRemover", JSON.stringify(photosToDelete));
      }
    }

    // 3. Anexa as novas fotos
    if (fotos) {
      for (let i = 0; i < fotos.length; i++) {
        data.append("fotos", fotos[i]);
      }
    } else if (!isEditMode && !fotos) {
      // Bloqueia POST se não houver foto
      setMessage({
        text: "Por favor, selecione pelo menos uma foto para o cadastro.",
        type: "error",
      });
      setLoading(false);
      return;
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
      onSuccess(); // Chama a função para atualizar a listagem

      // Limpa o formulário ou atualiza o estado de edição
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
          disponivel: true,
        });
        setFotos(null);
        (document.getElementById("fotos") as HTMLInputElement).value = "";
      } else {
        // Atualiza o estado das fotos após a edição (para desmarcar as deletadas)
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

  function setEstado(_value: string): void {
    throw new Error("Function not implemented.");
  }

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
          rows={4}
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Linha 3: Preço e Tipo */}
      <div className="grid grid-cols-2 gap-6">
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
      </div>

      {/* Linha 4: Localização (NOVO CAMPO) */}
      <div>
        <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">
          Localização Detalhada
        </label>
        <input
          type="text"
          name="localizacao"
          id="localizacao"
          value={formData.localizacao}
          onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
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
              type="text"
              name="numero"
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              readOnly={false}
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
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Linha 6: Disponibilidade (Apenas no Modo Edição) */}
      {isEditMode && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="disponivel"
            id="disponivel"
            checked={formData.disponivel}
            onChange={handleChange}
            className="h-20 w-20 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
            Imóvel Disponível
          </label>
        </div>
      )}

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
      <div>
        <label htmlFor="fotos" className="block text-sm font-medium text-gray-700">
          {isEditMode ? "Adicionar Novas Fotos" : "Fotos do Imóvel (Máx. 10)"}
        </label>
        <input
          type="file"
          name="fotos"
          id="fotos"
          onChange={handleFileChange}
          multiple
          required={!isEditMode}
          accept="image/*"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {fotos && (
          <p className="mt-1 text-xs text-gray-500">{fotos.length} arquivo(s) selecionado(s).</p>
        )}
      </div>

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
