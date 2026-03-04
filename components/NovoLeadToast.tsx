import { useEffect, useState } from "react";
import { FiX, FiUser } from "react-icons/fi";

interface NovoLeadToastProps {
  nome: string;
  createdAt: string;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `há ${m} ${m === 1 ? "minuto" : "minutos"}`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  }
  const d = Math.floor(diff / 86400);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

function getInitial(nome: string) {
  return nome.trim().charAt(0).toUpperCase();
}

export default function NovoLeadToast({ nome, createdAt, onClose }: NovoLeadToastProps) {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState(() => timeAgo(createdAt));

  // Slide-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 6s
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  // Update relative time every 30s
  useEffect(() => {
    const t = setInterval(() => setTime(timeAgo(createdAt)), 30000);
    return () => clearInterval(t);
  }, [createdAt]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[200]
        transition-all duration-400
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{ transitionDuration: "350ms" }}
    >
      <div className="relative bg-[#1a1814] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] w-72 overflow-hidden">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b8912a]" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
        >
          <FiX size={14} />
        </button>

        <div className="flex items-center gap-3.5 px-4 py-4 pt-5">
          {/* Avatar */}
          <div className="w-10 h-10 bg-[#b8912a]/20 border border-[#b8912a]/30 flex items-center justify-center flex-shrink-0">
            <span
              className="text-[#b8912a] font-bold text-base leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {getInitial(nome)}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <span className="text-[#b8912a] text-[9px] font-black uppercase tracking-[0.28em] block mb-0.5">
              Novo Lead
            </span>
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {nome}
            </p>
            <p className="text-white/35 text-[11px] mt-0.5">{time}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-[#b8912a]/40 w-full">
          <div
            className="h-full bg-[#b8912a]"
            style={{
              animation: "shrink 6s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
