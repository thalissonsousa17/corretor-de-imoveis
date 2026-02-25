import React, { useEffect, useState, ChangeEvent, FormEvent, ReactElement, useRef } from "react";
import axios, { AxiosError } from "axios";
import CorretorLayout from "@/components/CorretorLayout";
import { FiFacebook, FiInstagram, FiLinkedin, FiPhone, FiCamera, FiEdit3, FiSave, FiX, FiCheck, FiTrash2, FiGlobe, FiLock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
  avatar?: File | null;
  banner?: File | null;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
  metaTitle?: string;
  metaDescription?: string;
  plano?: "GRATUITO" | "EXPERT";
  
  // Premium Fields
  slogan?: string;
  accentColor?: string;
  videoUrl?: string;
  bioTitle?: string;
}

type SocialField = keyof Pick<Perfil, "instagram" | "facebook" | "linkedin" | "whatsapp">;

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

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
        showToast("error", "Erro ao carregar dados do perfil.");
      }
    };

    fetchPerfil();
  }, []);

  // LIMPEZA DE BLOBS PARA EVITAR MEMORY LEAK
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [avatarPreview, logoPreview]);

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

    if (name === "avatar") {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(preview);
    }
    if (name === "logo") {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(preview);
    }

    setPerfil((prev) => ({ ...prev, [name]: file }));
  };

  const handleRemoveLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setPerfil((prev) => ({ ...prev, logo: null, logoUrl: null }));
  };

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha) {
        return showToast("error", "Preencha os campos de senha.");
    }
    try {
      await axios.post("/api/corretor/alterar-senha", { senhaAtual, novaSenha });
      showToast("success", "Senha atualizada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      showToast("error", err.response?.data?.error || "Erro ao atualizar senha");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (perfil.name) formData.append("name", perfil.name);
      if (perfil.email) formData.append("email", perfil.email);

      Object.entries(perfil).forEach(([key, value]) => {
        if (value === undefined || key === "name" || key === "email" || key === "logo" || key === "avatar" || key === "banner") return;
        if (value === null) {
             // Handle explicit nulls if needed by backend
             if (key !== "logoUrl") formData.append(key, "null");
             return;
        }
        formData.append(key, String(value));
      });

      // Files
      if (perfil.avatar instanceof File) formData.append("avatar", perfil.avatar);
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

      showToast("success", "Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      showToast("error", err.response?.data?.error || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
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
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center gap-3 text-white font-bold backdrop-blur-md ${
              toast.type === "success" ? "bg-emerald-600/90" : "bg-rose-600/90"
            }`}
          >
            {toast.type === "success" ? <FiCheck size={20} /> : <FiX size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mobiliário Digital</h1>
              <p className="text-slate-500 font-medium">Gerencie sua presença de luxo e identidade visual.</p>
            </div>
            <button
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                    isEditing 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" 
                    : "bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 shadow-slate-200"
                }`}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEditing ? (
                    <><FiSave size={18} /> Salvar Perfil</>
                ) : (
                    <><FiEdit3 size={18} /> Editar Tudo</>
                )}
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Identity Card */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-10 relative">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start group">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100">
                           <img
                                src={avatarPreview || perfil.avatarUrl || "https://ui-avatars.com/api/?name=" + (perfil.name || "User") + "&background=random"}
                                alt="Avatar"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                            />
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.label 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        htmlFor="avatar"
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                    >
                                        <FiCamera className="text-white text-3xl" />
                                        <input id="avatar" type="file" name="avatar" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </motion.label>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nome Completo</label>
                                {isEditing ? (
                                    <input name="name" value={perfil.name || ""} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                ) : (
                                    <p className="text-2xl font-black text-slate-900">{perfil.name || "Seu Nome"}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Profissional / CRECI</label>
                                {isEditing ? (
                                    <input name="creci" value={perfil.creci || ""} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                ) : (
                                    <p className="text-lg font-bold text-slate-600">{perfil.creci || "Registro não informado"}</p>
                                )}
                            </div>
                            <div className="col-span-full space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">E-mail de Contato</label>
                                {isEditing ? (
                                    <input name="email" value={perfil.email || ""} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                ) : (
                                    <p className="text-slate-500 font-medium">{perfil.email}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Biography */}
                <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <FiEdit3 size={18} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">Sobre Você</h3>
                        </div>
                    </div>
                    {isEditing ? (
                        <textarea
                            name="biografia"
                            value={perfil.biografia || ""}
                            onChange={handleChange}
                            className="w-full min-h-[220px] bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Conte sua história de sucesso..."
                        />
                    ) : (
                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {perfil.biografia || "Você ainda não adicionou uma biografia."}
                        </p>
                    )}
                </section>

                {/* Social Card */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                            <FiGlobe size={18} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Conexões</h3>
                    </div>
                    <div className="space-y-4 flex-grow">
                        {socialItems.map(({ icon, field, label }) => (
                            <div key={field} className="group/social">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    {icon} {label}
                                </p>
                                {isEditing ? (
                                    <input
                                        name={field}
                                        value={String(perfil[field] || "")}
                                        onChange={handleChange}
                                        placeholder={`@seu${label.toLowerCase()}`}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-slate-900 truncate bg-slate-50/50 px-4 py-3 rounded-xl border border-transparent group-hover/social:border-slate-100 transition-all">
                                        {perfil[field] || "Não vinculado"}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Visual Branding Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* Logo Management */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-950 text-white rounded-xl">
                                <span className="text-xs font-black uppercase">Logo</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900">Identidade</h3>
                        </div>
                         {isEditing && (perfil.logoUrl || logoPreview) && (
                            <button onClick={handleRemoveLogo} className="text-rose-500 hover:text-rose-600 flex items-center gap-1.5 text-xs font-black uppercase transition-colors">
                                <FiTrash2 /> Remover
                            </button>
                         )}
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <div className="relative w-48 h-32 flex items-center justify-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-100 group/logo">
                            {logoPreview || perfil.logoUrl ? (
                                <img src={logoPreview || perfil.logoUrl!} className="object-contain max-w-full max-h-full p-6 transition-transform group-hover/logo:scale-105" />
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                        <FiCamera size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">Sem Logo</span>
                                </div>
                            )}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.label 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center cursor-pointer rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Selecionar</div>
                                    </motion.label>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </div>

             {/* SEO & Slug */}
             <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/3 space-y-2">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl w-fit">
                            <FiGlobe size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">Link da sua Vitrine</h3>
                        <p className="text-sm text-slate-500 font-medium">Defina como as pessoas encontrarão sua página na web.</p>
                    </div>
                    <div className="flex-1">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Slug Personalizado (URL)</label>
                            {isEditing ? (
                                <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <span className="bg-slate-100 px-4 py-4 text-slate-400 text-sm font-bold border-r border-slate-200">imob.com/</span>
                                    <input name="slug" value={perfil.slug || ""} onChange={handleChange} className="flex-1 px-4 py-4 text-slate-900 font-black outline-none" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-black text-slate-900">imob.com/<span className="text-blue-600">{perfil.slug || "carregando..."}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
          </motion.div>

          {/* CONFIGURAÇÕES PREMIUM 2.0 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[3rem] bg-[#1A2A4F] p-8 md:p-12 shadow-2xl text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
            
            <div className="flex items-center gap-6 mb-12">
               <div className="w-16 h-16 bg-white/10 rounded-[2rem] backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-inner">
                 <span className="text-3xl">✨</span>
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Experiência Premium</h3>
                  <p className="text-white/40 text-sm font-medium">Design cinematográfico e identidade visual avançada.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
               {/* Slogan */}
               <div className="group space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-blue-400 transition-colors">Frase de Impacto (Hero)</label>
                  {isEditing ? (
                    <input
                      name="slogan"
                      value={perfil.slogan || ""}
                      onChange={handleChange}
                      placeholder="Ex: Onde o luxo encontra seu novo lar."
                      className="w-full bg-white/5 border border-white/10 rounded-[1.25rem] p-5 text-white focus:ring-2 focus:ring-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 font-medium"
                    />
                  ) : (
                    <p className="text-xl font-black text-white leading-snug">{perfil.slogan || "Crie um slogan impactante para a home."}</p>
                  )}
               </div>

               {/* Bio Title */}
               <div className="group space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Título da Biografia</label>
                  {isEditing ? (
                    <input
                      name="bioTitle"
                      value={perfil.bioTitle || ""}
                      onChange={handleChange}
                      placeholder="Ex: Minha Jornada de Excelência"
                      className="w-full bg-white/5 border border-white/10 rounded-[1.25rem] p-5 text-white focus:ring-2 focus:ring-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 font-medium"
                    />
                  ) : (
                    <p className="text-xl font-bold text-white uppercase tracking-tighter">{perfil.bioTitle || "Sobre mim"}</p>
                  )}
               </div>

               {/* Video URL */}
               <div className="group space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Vídeo Highlight (YouTube)</label>
                  {isEditing ? (
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-[1.25rem] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="bg-white/5 px-4 h-[60px] flex items-center border-r border-white/10"><FiEdit3 className="text-white/40" /></div>
                        <input
                            name="videoUrl"
                            value={perfil.videoUrl || ""}
                            onChange={handleChange}
                            placeholder="Link do vídeo para a página"
                            className="flex-1 bg-transparent p-5 text-white outline-none"
                        />
                    </div>
                  ) : (
                    <p className="text-sm text-blue-300 font-bold truncate hover:underline cursor-pointer">{perfil.videoUrl || "Vincular vídeo de apresentação"}</p>
                  )}
               </div>

               {/* Accent Color */}
               <div className="group space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Cor de Destaque</label>
                  <div className="flex items-center gap-6">
                    <div className="relative group/picker">
                        {isEditing ? (
                             <input
                                type="color"
                                name="accentColor"
                                value={perfil.accentColor || "#1A2A4F"}
                                onChange={handleChange}
                                className="w-16 h-16 rounded-[1.5rem] bg-transparent cursor-pointer border-none shadow-2xl"
                            />
                        ) : (
                            <div 
                                className="w-14 h-14 rounded-[1.5rem] border border-white/20 shadow-2xl" 
                                style={{ backgroundColor: perfil.accentColor || "#1A2A4F" }} 
                            />
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-slate-900 border border-slate-200 shadow-xl opacity-0 group-hover/picker:opacity-100 transition-opacity">
                             <FiCheck />
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-widest uppercase mb-1">{perfil.accentColor || "#1A2A4F"}</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Tom para links e botões</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.section>

          {/* DOMÍNIO E SEGURANÇA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
             {/* DOMINIO */}
            <motion.section 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                        <FiGlobe size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Domínio Próprio</h3>
                </div>
                <div className="flex-grow">
                     <DominioCard />
                </div>
            </motion.section>

            {/* SECURITY */}
            <motion.section 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <FiLock size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Segurança</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Senha Atual</label>
                        <input
                            type="password"
                            value={senhaAtual}
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nova Senha</label>
                        <input
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleAlterarSenha}
                        className="w-full mt-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100"
                    >
                        Atualizar Credenciais
                    </button>
                </div>
            </motion.section>
          </div>
        </div>
      </div>
    </CorretorLayout>
  );
}
