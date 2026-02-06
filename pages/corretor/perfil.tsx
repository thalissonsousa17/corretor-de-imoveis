import React, { useEffect, useState, ChangeEvent, FormEvent, ReactElement } from "react";
import axios, { AxiosError } from "axios";
import CorretorLayout from "@/components/CorretorLayout";
import { FiFacebook, FiInstagram, FiLinkedin, FiPhone } from "react-icons/fi";

import DominioCard from "@/components/dominio/DominioCard";

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
  metaTitle?: string;
  metaDescription?: string;
  plano?: "GRATUITO" | "EXPERT";
}

type SocialField = keyof Pick<Perfil, "instagram" | "facebook" | "linkedin" | "whatsapp">;

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({});
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
        const data = res.data;

        setPerfil({
          ...data,
          name: data.name ?? data.user?.name ?? "",
          email: data.email ?? data.user?.email ?? "",
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
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

      setPerfil((prev) => ({ ...prev, slug }));
      return;
    }

    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files?.length) return;

    const file = files[0];
    const preview = URL.createObjectURL(file);

    if (name === "avatar") setAvatarPreview(preview);
    if (name === "banner") setBannerPreview(preview);
    if (name === "logo") setLogoPreview(preview);

    setPerfil((prev) => ({ ...prev, [name]: file }));
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setPerfil((prev) => ({ ...prev, logo: null, logoUrl: null }));
  };

  const handleAlterarSenha = async () => {
    try {
      await axios.post("/api/corretor/alterar-senha", { senhaAtual, novaSenha });

      setToast({ type: "success", message: "Senha atualizada com sucesso!" });
      setSenhaAtual("");
      setNovaSenha("");

      setTimeout(() => setToast(null), 2000);
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
        else formData.append(key, String(value));
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

      const data = res.data;
      setPerfil({
        ...data,
        name: data.name ?? data.user?.name ?? "",
        email: data.email ?? data.user?.email ?? "",
      });

      setToast({ type: "success", message: "Perfil atualizado com sucesso!" });
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      setToast({ type: "error", message: err.response?.data?.error || "Erro ao salvar perfil." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBtnEditPerfil = async () => {
    if (isEditing) {
      await handleSubmit(new Event("submit") as unknown as FormEvent);
    }
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

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-6 text-[#1A2A4F]">
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            👤 <span>Meu Perfil</span>
          </h1>
        </div>

        <div className="max-w-6xl mx-auto space-y-10">
          <section className="rounded-2xl bg-white p-8 shadow-md border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* FOTO + NOME */}
              <div className="flex items-center gap-4">
                {/* AVATAR */}
                <div className="relative">
                  <img
                    src={
                      avatarPreview ||
                      perfil.avatarUrl ||
                      "https://via.placeholder.com/120?text=Avatar"
                    }
                    alt="Avatar"
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full object-cover border"
                  />

                  {isEditing && (
                    <label
                      htmlFor="avatar"
                      className="absolute bottom-0 right-0 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs px-2 py-1 rounded-md cursor-pointer shadow"
                    >
                      trocar
                      <input
                        id="avatar"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {isEditing ? (
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={perfil.name || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 py-1 text-sm w-64 focus:ring-2 focus:ring-[#2563EB]"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold">{perfil.name}</h2>
                  )}

                  {isEditing ? (
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={perfil.email || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 py-1 text-sm w-64 focus:ring-2 focus:ring-[#2563EB]"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{perfil.email}</p>
                  )}

                  {isEditing ? (
                    <input
                      id="creci"
                      type="text"
                      name="creci"
                      value={perfil.creci || ""}
                      onChange={handleChange}
                      className="border rounded-md px-3 text-sm w-64 focus:ring-2 focus:ring-[#2563EB]"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{perfil.creci}</p>
                  )}
                </div>
              </div>

              {/* BOTÃO EDITAR */}
              <button
                onClick={handleBtnEditPerfil}
                disabled={loading}
                className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm transition ${
                  isEditing
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Editar Perfil"}
              </button>
            </div>
          </section>

          {/* BIOGRAFIA + BANNER */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-[#1A2A4F] mb-3">📝 Biografia</h3>

              {isEditing ? (
                <textarea
                  id="biografia"
                  name="biografia"
                  value={perfil.biografia || ""}
                  onChange={handleChange}
                  className="w-full min-h-[12rem] border rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Escreva uma breve biografia profissional..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {perfil.biografia || "Adicione uma breve descrição sobre você."}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-[#1E3A8A] mb-3">📸 Banner</h3>

              {isEditing && (
                <label className="cursor-pointer text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1E3A8A] px-4 py-2 rounded-md mb-3 transition inline-block">
                  Selecionar imagem
                  <input
                    type="file"
                    name="banner"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
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

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* REDES */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-[#1A2A4F] mb-4">🌐 Redes Sociais</h3>

              <ul className="divide-y">
                {socialItems.map(({ icon, field, label }) => (
                  <li key={field} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {icon}
                      <span>{label}</span>
                    </div>

                    {isEditing ? (
                      <input
                        id={field}
                        name={field}
                        value={String(perfil[field] || "")}
                        onChange={handleChange}
                        className="border rounded-md p-1 text-sm w-48 focus:ring-2 focus:ring-[#2563EB]"
                      />
                    ) : (
                      <span className="text-[#1A2A4F]">{perfil[field] || "-"}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* LOGO */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-md transition text-[#1A2A4F]">
              <h3 className="text-lg font-semibold mb-4">🏢 Logo da Imobiliária</h3>

              <div className="relative w-28 h-28 flex items-center justify-center border rounded-lg bg-gray-50 shadow-sm mb-3">
                {logoPreview ? (
                  <img src={logoPreview} className="object-contain w-full h-full p-2" />
                ) : perfil.logoUrl ? (
                  <img src={perfil.logoUrl} className="object-contain w-full h-full p-2" />
                ) : (
                  <span className="text-gray-400 text-xs">Sem logo</span>
                )}
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    id="logo"
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm"
                  />

                  {perfil.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-red-600 text-sm underline"
                    >
                      Remover logo
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* SLUG */}
          <section className="rounded-2xl bg-white p-8 shadow-md border text-[#1A2A4F]">
            <h3 className="text-lg font-semibold mb-3">🔗 Endereço da Página (Slug)</h3>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  id="slug"
                  name="slug"
                  value={perfil.slug || ""}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full focus:ring-2 focus:ring-[#2563EB]"
                />

                <p className="text-sm text-gray-600">
                  URL da sua página:{" "}
                  <span className="font-medium">https://seusite.com/{perfil.slug}</span>
                </p>
              </div>
            ) : (
              <p>
                URL: <span className="font-medium">https://seusite.com/{perfil.slug}</span>
              </p>
            )}
          </section>

          {/* DOMÍNIO PERSONALIZADO */}
          {(perfil.plano === "EXPERT" || perfil.plano === "GRATUITO") && (
            <section className="rounded-2xl bg-white p-8 shadow-md border text-[#1A2A4F]">
              <h3 className="text-lg font-semibold mb-4">🌍 Domínio Personalizado</h3>
              <DominioCard />
            </section>
          )}

          {/*   ALTERAR SENHA */}
          <section className="rounded-2xl bg-white p-8 shadow-md border text-[#1A2A4F]">
            <h3 className="text-lg font-semibold mb-4">🔒 Alterar Senha</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700">
                  Senha Atual:
                </label>
                <input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
                  Nova Senha:
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#2563EB]"
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
