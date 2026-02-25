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
    mensagem: "Gostaria de uma avaliação para venda do meu imóvel."
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
        status: "NOVO"
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
          mensagem: "Gostaria de uma avaliação para venda do meu imóvel."
        });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden animate-zoom-in">
        
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <FiX size={24} />
        </button>

        <div className="p-8 sm:p-12">
          {success ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-950 mb-2">Solicitação Enviada!</h3>
              <p className="text-slate-500">Obrigado pela confiança. {corretorName} entrará em contato em breve.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
                  Exclusividade & Estratégia
                </span>
                <h3 className="text-3xl font-black text-slate-950 tracking-tighter">Venda seu Imóvel</h3>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                  Preencha os campos abaixo para iniciarmos uma jornada de valor para o seu patrimônio.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                    <input 
                      required
                      type="text"
                      placeholder="Ex: João Silva"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-slate-950 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      value={form.nome}
                      onChange={(e) => setForm({...form, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input 
                      required
                      type="tel"
                      placeholder="(00) 00000-0000"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-slate-950 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      value={form.whatsapp}
                      onChange={(e) => setForm({...form, whatsapp: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo do Imóvel</label>
                    <div className="relative">
                       <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-slate-950 text-sm appearance-none focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        value={form.tipo}
                        onChange={(e) => setForm({...form, tipo: e.target.value})}
                       >
                         <option value="CASA">Casa</option>
                         <option value="APARTAMENTO">Apartamento</option>
                         <option value="TERRENO">Terreno</option>
                         <option value="COMERCIAL">Comercial</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                    <div className="relative">
                       <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                        required
                        type="text"
                        placeholder="Ex: Bairro, Cidade"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-slate-950 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        value={form.localizacao}
                        onChange={(e) => setForm({...form, localizacao: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                {error && <p className="text-rose-600 text-[11px] font-bold text-center bg-rose-50 py-2 rounded-xl border border-rose-100 animate-shake">{error}</p>}

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? <FiLoader className="animate-spin" size={18} /> : (
                    <>
                      Solicitar Avaliação <FiSend size={16} />
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
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoom-in {
          animation: zoom-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
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
