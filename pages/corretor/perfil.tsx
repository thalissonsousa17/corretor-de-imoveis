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
  avatarUrl?: string;
  bannerUrl?: string;
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

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  // Carrega dados do perfil
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get("/api/corretor/perfil", { withCredentials: true });
        const data = res.data.perfil;
        setPerfil({
          ...data,
          name: data.user?.name || "",
          email: data.user?.email || "",
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };
    fetchPerfil();
  }, []);

  // Atualiza campos de texto
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  // Preview de imagens
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];
    const preview = URL.createObjectURL(file);

    if (name === "avatar") setAvatarPreview(preview);
    if (name === "banner") setBannerPreview(preview);

    setPerfil((prev) => ({ ...prev, [name]: file }));
  };

  // Submete o formulário (envia via form-data)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();

      if (perfil.name) formData.append("name", perfil.name);
      if (perfil.email) formData.append("email", perfil.email);

      Object.entries(perfil).forEach(([key, value]) => {
        if (!value) return;

        if (key === "name" || key === "email") return;

        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string);
        }
      });

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

      setSuccessMsg("Perfil atualizado com sucesso!");
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      console.error("Erro ao salvar perfil:", error);
      setErrorMsg(err.response?.data?.error || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
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
  ] as const;

  return (
    <CorretorLayout>
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-6">
        {/* Cabeçalho */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            👤 <span>Meu Perfil</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie suas informações, redes sociais e SEO da sua página.
          </p>
          <div className="border-b border-gray-200 mt-4"></div>
        </div>

        {/* CONTAINER PRINCIPAL */}
        <div className="max-w-6xl mx-auto space-y-10">
          {/* PERFIL */}
          <section className="rounded-2xl bg-white p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
              {/* === Avatar === */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="relative group">
                  <div className="p-[3px] bg-gradient-to-tr from-gray-300 to-gray-100 rounded-full">
                    <img
                      src={avatarPreview || perfil.avatarUrl || "/placeholder-avatar.png"}
                      alt="Avatar"
                      className="w-28 h-28 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3">
                    <label
                      htmlFor="avatar"
                      className="text-xs bg-black text-white px-3 py-1 rounded-full cursor-pointer hover:bg-gray-700 transition"
                    >
                      Selecionar imagem de perfil
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* === Infos === */}
              <div className="flex-1 flex flex-col gap-5 w-full">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBtnEditPerfil}
                    disabled={loading}
                    className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all flex items-center gap-2 ${
                      isEditing
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Editar Perfil"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome:</label>
                    {isEditing ? (
                      <input
                        name="name"
                        value={perfil.name || ""}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{perfil.name || "Nome não definido"}</p>
                    )}
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail:</label>
                    {isEditing ? (
                      <input
                        name="email"
                        value={perfil.email || ""}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">
                        {perfil.email || "E-mail não definido"}
                      </p>
                    )}
                  </div>

                  {/* CRECI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CRECI:</label>
                    {isEditing ? (
                      <input
                        name="creci"
                        value={perfil.creci || ""}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{perfil.creci || "Não informado"}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Slug (link da página):
                    </label>
                    {isEditing ? (
                      <input
                        name="slug"
                        value={perfil.slug || ""}
                        onChange={handleChange}
                        placeholder="thalissonsousa"
                        className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                      />
                    ) : perfil.slug ? (
                      <a
                        href={`http://localhost:3000/${perfil.slug}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        /{perfil.slug}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800">Slug não definido</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BIOGRAFIA + BANNER */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Biografia */}
            <div className="rounded-2xl bg-gray-50 p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Biografia</h3>
              {isEditing ? (
                <textarea
                  name="biografia"
                  value={perfil.biografia || ""}
                  onChange={handleChange}
                  className="w-full h-48 border border-gray-300 rounded-lg p-3 text-gray-700 bg-white overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              ) : (
                <div className="w-full h-48 border border-gray-200 rounded-lg bg-white p-3 text-sm text-gray-700 overflow-y-auto leading-relaxed">
                  {perfil.biografia || "Adicione uma breve descrição sobre você."}
                </div>
              )}
            </div>

            {/* Banner */}
            <div className="rounded-2xl bg-gray-50 p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📸 Banner da Página</h3>

              {isEditing && (
                <label
                  htmlFor="banner"
                  className="cursor-pointer text-sm font-medium text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md mb-3 transition"
                >
                  Selecione a imagem
                </label>
              )}
              <input
                id="banner"
                type="file"
                name="banner"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-center w-full max-w-[650px] h-[250px] border border-gray-300 rounded-md bg-white overflow-hidden shadow-sm">
                {bannerPreview || perfil.bannerUrl ? (
                  <img
                    src={bannerPreview || perfil.bannerUrl}
                    alt="Banner Preview"
                    className="object-contain object-center max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">Nenhum banner selecionado</div>
                )}
              </div>
            </div>
          </section>

          {/* REDES SOCIAIS + SEO */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Redes Sociais */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌐 Redes Sociais</h3>
              <ul className="divide-y divide-gray-100">
                {[
                  {
                    icon: <FiInstagram className="text-pink-500" />,
                    field: "instagram",
                    label: "Instagram",
                  },
                  {
                    icon: <FiFacebook className="text-blue-600" />,
                    field: "facebook",
                    label: "Facebook",
                  },
                  {
                    icon: <FiLinkedin className="text-blue-500" />,
                    field: "linkedin",
                    label: "LinkedIn",
                  },
                  {
                    icon: <FiPhone className="text-green-600" />,
                    field: "whatsapp",
                    label: "WhatsApp",
                  },
                ].map(({ icon, field, label }) => (
                  <li key={field} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {icon}
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    {isEditing ? (
                      <input
                        name={field}
                        value={perfil[field as keyof typeof perfil] || ""}
                        onChange={handleChange}
                        className="border rounded-md p-1 text-sm text-gray-600 w-48 focus:ring-2 focus:ring-gray-300"
                      />
                    ) : (
                      <span className="text-gray-800 text-sm">
                        {perfil[field as keyof typeof perfil] || " "}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* SEO */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title:
                  </label>
                  {isEditing ? (
                    <input
                      name="metaTitle"
                      value={perfil.metaTitle || ""}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{perfil.metaTitle || " "}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description:
                  </label>
                  {isEditing ? (
                    <textarea
                      name="metaDescription"
                      value={perfil.metaDescription || ""}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-gray-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{perfil.metaDescription || ""}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ALTERAR SENHA */}
          <section className="rounded-2xl bg-white p-8 shadow-md border border-gray-100 hover:shadow-lg transition">
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
