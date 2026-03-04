import React from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiZap, FiCheck, FiArrowRight, FiLock } from "react-icons/fi";

interface UpgradeModalProps {
  onClose: () => void;
  recurso?: string;
  planoAtual?: string;
}

const PLANOS = [
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 79,90",
    cor: "from-blue-500 to-blue-700",
    badge: null,
    recursos: [
      "Até 50 imóveis",
      "Leads / CRM ilimitados",
      "Visitas ilimitadas",
      "Contratos digitais ilimitados",
      "Relatório financeiro",
    ],
  },
  {
    id: "start",
    nome: "Start AI",
    preco: "R$ 99,90",
    cor: "from-violet-500 to-violet-700",
    badge: "Mais Vendido",
    recursos: [
      "Até 100 imóveis",
      "Tudo do Pro",
      "Domínio personalizado",
      "IA de Contratos",
    ],
  },
  {
    id: "expert",
    nome: "Expert",
    preco: "R$ 149,90",
    cor: "from-amber-500 to-orange-600",
    badge: "Ilimitado",
    recursos: [
      "Imóveis ilimitados",
      "Tudo do Start",
      "Suporte Premium 24/7",
    ],
  },
];

const LABELS_RECURSO: Record<string, string> = {
  imoveis:    "imóveis",
  leads:      "leads",
  visitas:    "visitas",
  contratos:  "contratos",
  financeiro: "registros financeiros",
};

export default function UpgradeModal({ onClose, recurso, planoAtual = "GRATUITO" }: UpgradeModalProps) {
  const router = useRouter();
  const label = recurso ? LABELS_RECURSO[recurso] ?? recurso : "itens";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#1A2A4F] to-[#0f1a33] p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <FiX size={16} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-400/20 rounded-2xl flex items-center justify-center">
                <FiLock size={18} className="text-amber-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/50">
                Plano {planoAtual}
              </span>
            </div>
            <h2 className="text-2xl font-black leading-tight mb-1">
              Limite de {label} atingido
            </h2>
            <p className="text-white/60 text-sm font-medium">
              Faça upgrade para continuar adicionando {label} sem restrições.
            </p>
          </div>

          {/* Planos */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANOS.map((p) => (
              <div
                key={p.id}
                className="relative border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-violet-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </span>
                )}
                <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${p.cor} text-white text-xs font-black px-3 py-1.5 rounded-xl mb-3`}>
                  <FiZap size={11} />
                  {p.nome}
                </div>
                <p className="text-xl font-black text-slate-900 mb-1">{p.preco}</p>
                <p className="text-[10px] text-slate-400 font-medium mb-4">/por mês</p>
                <ul className="space-y-2">
                  {p.recursos.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                      <FiCheck size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/corretor/assinaturas")}
              className="flex-1 bg-[#1A2A4F] text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#253a6a] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
              <FiZap size={15} /> Ver Planos e Fazer Upgrade
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Agora não
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
