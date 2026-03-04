import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { FiGlobe, FiCheck, FiZap, FiCopy, FiCheckCircle, FiClock, FiAlertCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const VERCEL_IP = "76.76.21.21";
const CNAME_DESTINO = "imobhub.automatech.app.br";

interface DominioData {
  dominio: string;
  status: "PENDENTE" | "ATIVO" | "ERRO";
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 transition-all text-[10px] font-bold"
    >
      {copied ? <FiCheckCircle size={11} className="text-emerald-500" /> : <FiCopy size={11} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export default function DominioCard() {
  const [dominio, setDominio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const api = axios.create({ withCredentials: true });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchDominio = async () => {
      try {
        const res = await api.get<DominioData>("/api/profile/dominio");
        if (res.data) {
          setDominio(res.data.dominio);
          setStatus(res.data.status);
          if (res.data.status === "PENDENTE") setGuideOpen(true);
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
      const newStatus = res.data.status || "PENDENTE";
      setStatus(newStatus);
      if (newStatus === "PENDENTE") setGuideOpen(true);
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

  const getStatusBadge = () => {
    switch (status) {
      case "ATIVO":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-tight">
            <FiCheckCircle size={10} /> Ativo
          </span>
        );
      case "PENDENTE":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-tight">
            <FiClock size={10} /> Pendente
          </span>
        );
      case "ERRO":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-tight">
            <FiAlertCircle size={10} /> Erro
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative space-y-4">
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

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Endereço Personalizado
          </label>
          {getStatusBadge()}
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

      {/* Botão */}
      <button
        onClick={handleSalvar}
        disabled={loading}
        className="w-full bg-[#1A2A4F] text-white py-4 rounded-2xl hover:bg-opacity-90 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-100"
      >
        {loading ? "Verificando DNS..." : (
          <span className="flex items-center justify-center gap-2">
            <FiZap size={14} /> Ativar Domínio
          </span>
        )}
      </button>

      {/* Status ATIVO */}
      {status === "ATIVO" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4"
        >
          <FiCheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-emerald-700 mb-0.5">Domínio ativo e funcionando!</p>
            <p className="text-[11px] text-emerald-600/80 font-medium">
              Seu site está acessível em <strong>{dominio}</strong>.
            </p>
          </div>
        </motion.div>
      )}

      {/* Guia DNS — collapsible */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setGuideOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            Como configurar o DNS?
          </span>
          {guideOpen ? (
            <FiChevronUp size={14} className="text-slate-400" />
          ) : (
            <FiChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-3 space-y-4">

                {/* Passo a passo */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Passo a passo</p>
                  {[
                    "Acesse o painel do seu provedor de domínio (Registro.br, GoDaddy, Hostinger, etc.)",
                    "Localize a seção de DNS ou \"Gerenciar DNS\" / \"Zone Editor\"",
                    "Adicione um dos registros abaixo (escolha Opção 1 ou Opção 2)",
                    "Salve as alterações e aguarde até 24h para propagação",
                    "Volte aqui e clique em \"Ativar Domínio\" para verificar",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Opção 1: Registro A */}
                <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Opção 1 — Registro A (mais comum para domínio raiz)
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                    <span>Tipo</span><span>Nome / Host</span><span>Valor</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 rounded-lg px-2 py-1 w-fit">A</span>
                    <span className="text-xs font-bold text-slate-700">@</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-black text-slate-800">{VERCEL_IP}</code>
                      <CopyButton value={VERCEL_IP} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-1">
                    O <strong>@</strong> representa o domínio raiz (ex: seusite.com.br). Se o painel pedir "Host", use <strong>@</strong> ou deixe em branco.
                  </p>
                </div>

                {/* Opção 2: CNAME */}
                <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Opção 2 — CNAME (para subdomínio como www)
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                    <span>Tipo</span><span>Nome / Host</span><span>Valor</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-50 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-black text-violet-600 bg-violet-50 rounded-lg px-2 py-1 w-fit">CNAME</span>
                    <span className="text-xs font-bold text-slate-700">www</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-black text-slate-800 break-all">{CNAME_DESTINO}</code>
                      <CopyButton value={CNAME_DESTINO} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-1">
                    Use esta opção para <strong>www.seusite.com.br</strong>. Pode combinar com a Opção 1 para cobrir ambos.
                  </p>
                </div>

                {/* TTL note */}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <FiClock size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    <strong>Propagação DNS:</strong> após salvar, pode levar entre 5 minutos e 24 horas para o domínio ativar, dependendo do provedor. O TTL recomendado é <strong>300</strong> (5 min) ou <strong>3600</strong> (1h).
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
