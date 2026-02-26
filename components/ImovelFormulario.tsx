import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { resolveFotoUrl } from "@/lib/imageUtils";
import { Imovel, Foto } from "@/types/Imovel";
import BuscaEndereco from "./BuscaEndereco";
import { Endereco } from "../types/endereco";
import FotosUploader from "./FotosUploader";
import {
  FaBed,
  FaBath,
  FaCar,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaBuilding,
  FaHome,
} from "react-icons/fa";

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
  quartos: string;
  banheiros: string;
  suites: string;
  vagas: string;
  areaTotal: string;
  areaUtil: string;
  condominio: string;
  iptu: string;
  anoConstrucao: string;
}

interface ExistingPhoto extends Foto {
  toBeDeleted: boolean;
}

interface ImovelFormularioProps {
  imovelId?: string | null;
  onSuccess: () => void;
}

// ─── Componentes auxiliares de UI ──────────────────────────────
const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-5 py-3.5 border-b border-gray-200">
      <div className="flex items-center gap-2.5">
        <span className="text-blue-600 text-lg">{icon}</span>
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Label: React.FC<{
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}> = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputClass =
  "block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm text-gray-700 bg-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 hover:border-gray-400";

const inputReadOnlyClass =
  "block w-full border border-gray-200 rounded-lg shadow-sm px-3 py-2.5 text-sm text-gray-600 bg-gray-50 placeholder-gray-400";

const selectClass =
  "block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm text-gray-700 bg-white transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 hover:border-gray-400 cursor-pointer";

// ─── Componente principal ─────────────────────────────────────
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
    quartos: "",
    banheiros: "",
    suites: "",
    vagas: "",
    areaTotal: "",
    areaUtil: "",
    condominio: "",
    iptu: "",
    anoConstrucao: "",
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
            quartos: imovel.quartos?.toString() ?? "",
            banheiros: imovel.banheiros?.toString() ?? "",
            suites: imovel.suites?.toString() ?? "",
            vagas: imovel.vagas?.toString() ?? "",
            areaTotal: imovel.areaTotal?.toString() ?? "",
            areaUtil: imovel.areaUtil?.toString() ?? "",
            condominio: imovel.condominio?.toString() ?? "",
            iptu: imovel.iptu?.toString() ?? "",
            anoConstrucao: imovel.anoConstrucao?.toString() ?? "",
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

    // ✅ envia SOMENTE o que está preenchido
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

  const descLen = formData.descricao?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Mensagem de status ──────────────────────── */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="text-lg">{message.type === "success" ? "✅" : "❌"}</span>
          {message.text}
        </div>
      )}

      {/* ═══ SEÇÃO 1 — Informações Básicas ═══════════ */}
      <SectionCard
        icon={<FaHome />}
        title="Informações Básicas"
        subtitle="Título, descrição e classificação do imóvel"
      >
        <div className="space-y-5">
          {/* Título */}
          <div>
            <Label htmlFor="titulo" required>
              Título do Anúncio
            </Label>
            <input
              type="text"
              name="titulo"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              placeholder="Ex: Casa Premium com 3 quartos no Catolé"
              className={inputClass}
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao" required>
              Descrição Detalhada
            </Label>
            <textarea
              name="descricao"
              id="descricao"
              value={formData.descricao || ""}
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({ ...formData, descricao: e.target.value });
                }
              }}
              rows={6}
              className={`${inputClass} resize-y min-h-[10rem]`}
              placeholder="Descreva todos os detalhes do imóvel, área de lazer, diferenciais e informações relevantes..."
            />
            <div className="flex justify-between items-center mt-1.5">
              <span
                className={`text-xs ${descLen >= 3000 ? "text-red-500 font-semibold" : "text-gray-400"}`}
              >
                {descLen.toLocaleString()} / 3.000 caracteres
              </span>
              {descLen >= 3000 && (
                <span className="text-xs text-red-500 font-medium">Limite atingido</span>
              )}
            </div>
          </div>

          {/* Preço, Tipo, Finalidade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preco" required>
                Valor (R$)
              </Label>
              <input
                type="number"
                name="preco"
                id="preco"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="300000.00"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="tipo" required>
                Tipo de Imóvel
              </Label>
              <select
                name="tipo"
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
                className={selectClass}
              >
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
              </select>
            </div>
            <div>
              <Label htmlFor="finalidade" required>
                Finalidade
              </Label>
              <select
                name="finalidade"
                id="finalidade"
                value={formData.finalidade}
                onChange={(e) =>
                  setFormData({ ...formData, finalidade: e.target.value as "VENDA" | "ALUGUEL" })
                }
                required
                className={selectClass}
              >
                <option value="VENDA">Venda</option>
                <option value="ALUGUEL">Aluguel</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ SEÇÃO 2 — Características ═══════════════ */}
      <SectionCard
        icon={<FaBed />}
        title="Características do Imóvel"
        subtitle="Quantidade de cômodos, vagas e áreas"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Quartos */}
          <div>
            <Label htmlFor="quartos">Quartos</Label>
            <div className="relative">
              <FaBed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="quartos"
                id="quartos"
                min="0"
                value={formData.quartos}
                onChange={(e) => setFormData({ ...formData, quartos: e.target.value })}
                placeholder="3"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
          </div>

          {/* Banheiros */}
          <div>
            <Label htmlFor="banheiros">Banheiros</Label>
            <div className="relative">
              <FaBath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="banheiros"
                id="banheiros"
                min="0"
                value={formData.banheiros}
                onChange={(e) => setFormData({ ...formData, banheiros: e.target.value })}
                placeholder="2"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
          </div>

          {/* Suítes */}
          <div>
            <Label htmlFor="suites">Suítes</Label>
            <div className="relative">
              <FaBed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="suites"
                id="suites"
                min="0"
                value={formData.suites}
                onChange={(e) => setFormData({ ...formData, suites: e.target.value })}
                placeholder="1"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
          </div>

          {/* Vagas */}
          <div>
            <Label htmlFor="vagas">Vagas</Label>
            <div className="relative">
              <FaCar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="vagas"
                id="vagas"
                min="0"
                value={formData.vagas}
                onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                placeholder="2"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
          </div>

          {/* Área Total */}
          <div>
            <Label htmlFor="areaTotal">Área Total</Label>
            <div className="relative">
              <FaRulerCombined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="areaTotal"
                id="areaTotal"
                min="0"
                step="0.01"
                value={formData.areaTotal}
                onChange={(e) => setFormData({ ...formData, areaTotal: e.target.value })}
                placeholder="240"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block text-center">m²</span>
          </div>

          {/* Área Útil */}
          <div>
            <Label htmlFor="areaUtil">Área Útil</Label>
            <div className="relative">
              <FaRulerCombined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="number"
                name="areaUtil"
                id="areaUtil"
                min="0"
                step="0.01"
                value={formData.areaUtil}
                onChange={(e) => setFormData({ ...formData, areaUtil: e.target.value })}
                placeholder="150"
                className={`${inputClass} pl-8 text-center`}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block text-center">m²</span>
          </div>
        </div>
      </SectionCard>

      {/* ═══ SEÇÃO 3 — Valores Adicionais ════════════ */}
      <SectionCard
        icon={<FaMoneyBillWave />}
        title="Valores Adicionais"
        subtitle="Taxas de condomínio, IPTU e ano de construção"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="condominio">Condomínio (R$/mês)</Label>
            <input
              type="number"
              name="condominio"
              id="condominio"
              min="0"
              step="0.01"
              value={formData.condominio}
              onChange={(e) => setFormData({ ...formData, condominio: e.target.value })}
              placeholder="450.00"
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="iptu">IPTU (R$/ano)</Label>
            <input
              type="number"
              name="iptu"
              id="iptu"
              min="0"
              step="0.01"
              value={formData.iptu}
              onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
              placeholder="1200.00"
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="anoConstrucao">Ano de Construção</Label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="number"
                name="anoConstrucao"
                id="anoConstrucao"
                min="1900"
                max="2030"
                value={formData.anoConstrucao}
                onChange={(e) => setFormData({ ...formData, anoConstrucao: e.target.value })}
                placeholder="2020"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ SEÇÃO 4 — Endereço ══════════════════════ */}
      <SectionCard
        icon={<FaMapMarkerAlt />}
        title="Endereço Completo"
        subtitle="Localização do imóvel preenchida via CEP"
      >
        <div className="space-y-4">
          <div className="text-black grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CEP */}
            <div>
              <BuscaEndereco
                onEnderecoAchado={handleEnderecoAchado}
                cep={formData.cep ?? ""}
                onCepChange={(novoCep) => setFormData((prev) => ({ ...prev, cep: novoCep }))}
              />
            </div>
            {/* Número */}
            <div>
              <Label htmlFor="numero" required>
                Número
              </Label>
              <input
                name="numero"
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
                required
                placeholder="Ex: 844"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rua */}
            <div>
              <Label htmlFor="rua" required>
                Rua / Logradouro
              </Label>
              <input
                type="text"
                name="rua"
                id="rua"
                value={formData.rua}
                onChange={(e) => setFormData((prev) => ({ ...prev, rua: e.target.value }))}
                required
                className={inputReadOnlyClass}
              />
            </div>
            {/* Bairro */}
            <div>
              <Label htmlFor="bairro" required>
                Bairro
              </Label>
              <input
                type="text"
                name="bairro"
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData((prev) => ({ ...prev, bairro: e.target.value }))}
                required
                className={inputReadOnlyClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cidade */}
            <div>
              <Label htmlFor="cidade" required>
                Cidade
              </Label>
              <input
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
                className={inputReadOnlyClass}
              />
            </div>
            {/* Estado */}
            <div>
              <Label htmlFor="estado" required>
                Estado (Sigla)
              </Label>
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
                placeholder="PB"
                className={inputReadOnlyClass}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ SEÇÃO 5 — Localização no Mapa ═══════════ */}
      <SectionCard
        icon={<FaMapMarkerAlt />}
        title="Localização no Mapa"
        subtitle="Link do Google Maps para exibir a localização exata"
      >
        <div>
          <Label htmlFor="localizacao">Link do Google Maps</Label>
          <input
            type="url"
            name="localizacao"
            id="localizacao"
            value={formData.localizacao}
            onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            placeholder="https://www.google.com/maps/place/..."
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <FaMapMarkerAlt className="text-gray-400" />
            Cole o link de compartilhamento do Google Maps para exibir o mapa na página pública.
          </p>
        </div>
      </SectionCard>

      {/* ═══ SEÇÃO 6 — Fotos ═════════════════════════ */}
      <SectionCard
        icon={<FaBuilding />}
        title="Fotos do Imóvel"
        subtitle={isEditMode ? "Gerencie e adicione novas fotos" : "Adicione ao menos uma foto"}
      >
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4">
          <p className="text-[11px] text-blue-700 leading-tight">
            <strong>✨ Dica de Visualização:</strong> Para que os cards fiquem &quot;cheios&quot; e
            sem faixas laterais, prefira fotos na <strong>horizontal (paisagem)</strong>.
            Recomendamos a proporção <strong>3:2</strong> ou <strong>4:3</strong> (ex: 1200x800 ou
            1024x768 pixels).
          </p>
        </div>
        <div className="space-y-4">
          {isEditMode && existingPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Fotos Existentes</p>
              <div className="flex flex-wrap gap-3">
                {existingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative rounded-xl overflow-hidden w-24 h-24 border-2 transition-all duration-200 cursor-pointer group ${
                      photo.toBeDeleted
                        ? "border-red-400 opacity-60 grayscale"
                        : "border-emerald-400 hover:border-emerald-500"
                    }`}
                    onClick={() => handlePhotoToggle(photo.id)}
                  >
                    <img
                      src={resolveFotoUrl(photo.url)}
                      alt={`Foto ${photo.ordem}`}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                        photo.toBeDeleted
                          ? "bg-red-500/40 opacity-100"
                          : "bg-black/0 opacity-0 group-hover:bg-black/20 group-hover:opacity-100"
                      }`}
                    >
                      <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                        {photo.toBeDeleted ? "Remover ✕" : "Manter ✓"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Clique na foto para alternar entre manter e remover.
              </p>
            </div>
          )}

          <FotosUploader
            imovelId={imovelId}
            existingPhotos={existingPhotos}
            onChange={handleFileChange}
            fotosExternas={fotosSelecionadas}
          />
        </div>
      </SectionCard>

      {/* ═══ Botão de envio ══════════════════════════ */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3.5 px-6 rounded-xl text-base font-semibold text-white shadow-lg transition-all duration-300 cursor-pointer ${
          loading
            ? "bg-gray-400 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25 active:scale-[0.98]"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processando...
          </span>
        ) : isEditMode ? (
          "💾 Salvar Alterações"
        ) : (
          "🏠 Cadastrar Imóvel"
        )}
      </button>
    </form>
  );
};

export default ImovelFormulario;
