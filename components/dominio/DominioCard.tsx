import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { FiGlobe, FiCheck, FiInfo, FiZap } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface DominioData {
  dominio: string;
  status: "PENDENTE" | "ATIVO" | "ERRO";
}

export default function DominioCard() {
  const [dominio, setDominio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const api = axios.create({
    withCredentials: true,
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchDominio = async () => {
      try {
        const res = await api.get<DominioData>("/api/profile/dominio");
        if (res.data) {
          setDominio(res.data.dominio);
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error("Erro ao buscar domínio", err);
      }
    };
    fetchDominio();
  }, []);

  const handleSalvar = async () => {
    if (!dominio) return showToast("error", "Por favor, digite um domínio.");

    setLoading(true);
    try {
      const res = await api.post("/api/profile/dominio", { dominio });
      showToast("success", res.data.mensagem || "Domínio salvo com sucesso!");
      setStatus(res.data.status || "PENDENTE");
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      if (err.response?.status === 401) {
        showToast("error", "Sessão expirada. Faça login novamente.");
      } else {
        showToast("error", err.response?.data?.error || "Erro ao salvar domínio");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case "ATIVO": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDENTE": return "bg-amber-50 text-amber-600 border-amber-100";
      case "ERRO": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute -top-12 left-0 right-0 py-2 px-4 rounded-xl text-xs font-bold text-center z-20 ${
                toast.type === "success" ? "bg-emerald-900 text-white" : "bg-rose-900 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Personalizado</label>
                {status && (
                    <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${getStatusStyles()}`}>
                        {status}
                    </div>
                )}
            </div>
            <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <FiGlobe size={16} />
                </div>
                <input
                    type="text"
                    value={dominio}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDominio(e.target.value)}
                    placeholder="ex: imobiliaria.com.br"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                />
            </div>
        </div>

        <button
            onClick={handleSalvar}
            disabled={loading}
            className="w-full bg-[#1A2A4F] text-white py-4 rounded-2xl hover:bg-opacity-95 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-100"
        >
            {loading ? "Processando..." : (
                <span className="flex items-center justify-center gap-2">
                    <FiZap size={14} /> Ativar Domínio
                </span>
            )}
        </button>

        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 flex gap-4">
            <div className="text-blue-500 shrink-0 mt-0.5">
                <FiInfo size={18} />
            </div>
            <p className="text-[11px] text-blue-700/80 leading-relaxed font-medium">
                <strong>Configuração Técnica:</strong><br />
                Acesse o painel do seu registro e aponte um registro do tipo <strong>A</strong> para o IP do servidor onde este sistema está hospedado.
            </p>
        </div>
      </div>
    </div>
  );
}
