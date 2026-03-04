"use client";

import React, { useState } from "react";
import { FiX, FiCheckCircle, FiLoader, FiSend, FiTag, FiMapPin } from "react-icons/fi";
import axios from "axios";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  corretorId: string;
  corretorName: string;
}

export default function LeadModal({ isOpen, onClose, corretorId, corretorName }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    tipo: "CASA",
    localizacao: "",
    mensagem: "Gostaria de uma avaliação para venda do meu imóvel.",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/public/leads", {
        ...form,
        corretorId,
        origem: "SITE",
        status: "NOVO",
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setForm({
          nome: "",
          whatsapp: "",
          email: "",
          tipo: "CASA",
          localizacao: "",
          mensagem: "Gostaria de uma avaliação para venda do meu imóvel.",
        });
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#fafaf8] border border-[#e8e4dc] px-4 py-3.5 text-[#1a1814] text-sm focus:bg-white focus:border-[#b8912a] focus:ring-1 focus:ring-[#b8912a] outline-none transition-all placeholder-[#9c9890]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1814]/85 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)] overflow-hidden animate-zoom-in">
        {/* Gold top border */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#b8912a]" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9c9890] hover:text-[#1a1814] transition-colors cursor-pointer"
        >
          <FiX size={20} />
        </button>

        <div className="p-8 sm:p-10 pt-10">
          {success ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-16 h-16 bg-[#b8912a]/10 text-[#b8912a] flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={36} />
              </div>
              <h3
                className="text-[#1a1814] mb-2"
                style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 400 }}
              >
                Solicitação Enviada!
              </h3>
              <p className="text-[#9c9890] text-sm leading-relaxed">
                Obrigado pela confiança.{" "}
                <span className="text-[#1a1814] font-semibold">{corretorName}</span> entrará em
                contato em breve.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-[#b8912a] text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">
                  Exclusividade & Estratégia
                </span>
                <h3
                  className="text-[#1a1814] leading-[1.05] mb-3"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 400 }}
                >
                  Venda seu Imóvel
                </h3>
                <p className="text-[#9c9890] text-sm leading-relaxed">
                  Preencha os campos abaixo para iniciarmos uma jornada de valor para o seu
                  patrimônio.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9c9890] uppercase tracking-widest block">
                      Seu Nome
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: João Silva"
                      className={inputClass}
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9c9890] uppercase tracking-widest block">
                      WhatsApp
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="(00) 00000-0000"
                      className={inputClass}
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9c9890] uppercase tracking-widest block">
                      Tipo do Imóvel
                    </label>
                    <div className="relative">
                      <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c9890]" size={14} />
                      <select
                        className={`${inputClass} pl-10 appearance-none`}
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      >
                        <option value="CASA">Casa</option>
                        <option value="APARTAMENTO">Apartamento</option>
                        <option value="TERRENO">Terreno</option>
                        <option value="COMERCIAL">Comercial</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9c9890] uppercase tracking-widest block">
                      Localização
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c9890]" size={14} />
                      <input
                        required
                        type="text"
                        placeholder="Ex: Bairro, Cidade"
                        className={`${inputClass} pl-10`}
                        value={form.localizacao}
                        onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-rose-600 text-[11px] font-bold text-center bg-rose-50 py-2 border border-rose-100 animate-shake">
                    {error}
                  </p>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-[#1a1814] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#b8912a] transition-all flex items-center justify-center gap-3 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" size={16} />
                  ) : (
                    <>
                      Solicitar Avaliação <FiSend size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-zoom-in {
          animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
