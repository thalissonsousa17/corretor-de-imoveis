import React, { useEffect, useState, ChangeEvent, FormEvent, ReactElement } from "react";
import axios, { AxiosError } from "axios";
import CorretorLayout from "@/components/CorretorLayout";
import {
  FiBriefcase,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

interface Perfil {
  name?: string;
  email?: string;
  creci?: string;
  slug?: string;
  biografia?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  logo?: File | null;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  metaTitle?: string;
  metaDescription?: string;
}

type SocialField = keyof Pick<Perfil, "instagram" | "facebook" | "linkedin" | "whatsapp">;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({ logo: null });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get("/api/corretor/perfil", { withCredentials: true });
        const data = res.data.perfil;
        setPerfil({
          ...data,
          name: data.user?.name || data.name || "",
          email: data.user?.email || data.email || "",
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };
    fetchPerfil();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "slug") {
      const novoSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
      setPerfil((prev) => ({ ...prev, slug: novoSlug }));
      return;
    }
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    const file = files[0];
    const preview = URL.createObjectURL(file);

    if (name === "avatar") setAvatarPreview(preview);
    if (name === "banner") setBannerPreview(preview);
    if (name === "logo") setLogoPreview(preview);

    setPerfil((prev) => ({ ...prev, [name]: file as File }));
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setPerfil((prev) => ({ ...prev, logo: null, logoUrl: null }));
  };

  const handleAlterarSenha = async () => {
    try {
      await axios.post("/api/corretor/alterar-senha", { senhaAtual, novaSenha });
      setToast({ type: "success", message: "Senha atualizada com sucesso!" });
      setTimeout(() => {
        setSenhaAtual("");
        setNovaSenha("");
        setToast(null);
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      setToast({
        type: "error",
        message: err.response?.data?.error || "Erro ao atualizar senha",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (perfil.name) formData.append("name", perfil.name);
      if (perfil.email) formData.append("email", perfil.email);

      Object.entries(perfil).forEach(([key, value]) => {
        if (!value || key === "name" || key === "email" || key === "logo") return;

        if (value instanceof File) formData.append(key, value);
        else formData.append(key, value.toString());
      });

      if (perfil.logo instanceof File) {
        formData.append("logo", perfil.logo);
      } else if (perfil.logoUrl === null) {
        formData.append("logo", "null");
      }

      const res = await axios.post("/api/corretor/perfil", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data.perfil;
      setPerfil({
        ...data,
        name: data.user?.name || data.name || "",
        email: data.user?.email || data.email || "",
      });

      setToast({ type: "success", message: "Perfil atualizado com sucesso!" });
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      console.error("Erro ao salvar perfil:", error);
      setToast({ type: "error", message: err.response?.data?.error || "Erro ao salvar perfil." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBtnEditPerfil = async () => {
    if (isEditing) await handleSubmit(new Event("submit") as unknown as FormEvent);
    setIsEditing(!isEditing);
  };

  const socialItems: ReadonlyArray<{
    field: SocialField;
    label: string;
    icon: ReactElement;
  }> = [
    { field: "instagram", label: "Instagram", icon: <FiInstagram className="text-pink-500" /> },
    { field: "facebook", label: "Facebook", icon: <FiFacebook className="text-blue-600" /> },
    { field: "linkedin", label: "LinkedIn", icon: <FiLinkedin className="text-blue-500" /> },
    { field: "whatsapp", label: "WhatsApp", icon: <FiPhone className="text-green-600" /> },
  ];

  return (
    <CorretorLayout>
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            👤 <span>Meu Perfil</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie suas informações, redes sociais e SEO da sua página.
          </p>
          <div className="border-b border-gray-200 mt-4"></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-10">
          {/* === Seção de perfil === */}
          <section className="rounded-2xl bg-white p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
              <div className="flex items-center gap-4">
                <img
                  src={
                    avatarPreview ||
                    perfil.avatarUrl ||
                    "https://via.placeholder.com/120?text=Avatar"
                  }
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <div className="flex flex-col gap-1">
                  {/* NOME */}
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={perfil.name || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 py-1 text-gray-700 text-sm w-64 focus:ring-2 focus:ring-gray-300"
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-800">{perfil.name}</h2>
                  )}

                  {/* EMAIL */}
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={perfil.email || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 py-1 text-gray-700 text-sm w-64 focus:ring-2 focus:ring-gray-300"
                      placeholder="seuemail@exemplo.com"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{perfil.email}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleBtnEditPerfil}
                disabled={loading}
                className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${
                  isEditing
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Editar Perfil"}
              </button>
            </div>
          </section>

          {/* === Biografia e Banner === */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Biografia</h3>
              {isEditing ? (
                <textarea
                  name="biografia"
                  value={perfil.biografia || ""}
                  onChange={handleChange}
                  className="w-full min-h-[12rem] border rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-gray-400"
                  placeholder="Escreva uma breve biografia profissional..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {perfil.biografia || "Adicione uma breve descrição sobre você."}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📸 Banner</h3>
              {isEditing && (
                <label className="cursor-pointer text-sm font-medium text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md mb-3 transition">
                  <input
                    type="file"
                    name="banner"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  Selecionar imagem
                </label>
              )}
              <div className="flex justify-center w-full max-w-[650px] h-[250px] border rounded-md overflow-hidden bg-gray-50">
                {bannerPreview || perfil.bannerUrl ? (
                  <img
                    src={bannerPreview || perfil.bannerUrl!}
                    alt="Banner"
                    className="object-contain max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-gray-400 text-sm flex items-center justify-center w-full">
                    Nenhum banner selecionado
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* === Redes Sociais e Logo === */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-md border hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌐 Redes Sociais</h3>
              <ul className="divide-y divide-gray-100">
                {socialItems.map(({ icon, field, label }) => (
                  <li key={field} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {icon}
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    {isEditing ? (
                      <input
                        name={field}
                        value={String(perfil[field as keyof typeof perfil] || "")}
                        onChange={handleChange}
                        className="border rounded-md p-1 text-sm text-gray-600 w-48 focus:ring-2 focus:ring-gray-300"
                      />
                    ) : (
                      <span className="text-gray-800 text-sm">
                        {String(perfil[field as keyof typeof perfil] || "-")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md border hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 Logo da Imobiliária</h3>

              {/* Logo ou Placeholder */}
              <div className="relative w-28 h-28 flex items-center justify-center border rounded-lg bg-gray-50 shadow-sm mb-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview da logo"
                    className="object-contain w-full h-full p-2"
                  />
                ) : perfil.logoUrl ? (
                  <img
                    src={perfil.logoUrl}
                    alt="Logo atual"
                    className="object-contain w-full h-full p-2"
                  />
                ) : (
                  <div className="text-gray-400 text-xs text-center flex flex-col items-center justify-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4-4 4 4m4-4l4 4M4 8l4-4 4 4m4-4l4 4"
                      />
                    </svg>
                    Sem logo
                  </div>
                )}
              </div>

              {/* Upload e remover */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label className="block w-full">
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md 
            file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </label>

                  {perfil.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remover logo atual
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* === Campo SLUG === */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🔗 Endereço da Página (Slug)
              </h3>

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    name="slug"
                    value={perfil.slug || ""}
                    onChange={handleChange}
                    className="border rounded-md p-2 text-gray-600 w-full focus:ring-2 focus:ring-gray-400"
                    placeholder="ex: thalissonsousa"
                  />

                  {/* Pré-visualização da URL */}
                  <p className="text-sm text-gray-500">
                    URL da sua página:{" "}
                    <span className="font-medium text-gray-700">
                      https://seusite.com/{perfil.slug || "meu-slug"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-700">
                  <span className="font-medium">URL:</span> https://seusite.com/{perfil.slug}
                </p>
              )}
            </div>
          </section>

          {/* === Alterar senha === */}
          <section className="rounded-2xl bg-white p-8 shadow-md border hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Alterar Senha</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha Atual:</label>
                <input
                  type="password"
                  name="senhaAtual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full border rounded-md p-2 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha:</label>
                <input
                  type="password"
                  name="novaSenha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full border rounded-md p-2 text-gray-600"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAlterarSenha}
                className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition"
              >
                Atualizar Senha
              </button>
            </div>
          </section>
        </div>
      </div>
    </CorretorLayout>
  );
}
