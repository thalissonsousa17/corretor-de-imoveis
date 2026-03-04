import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";

interface NovoLeadToastProps {
  nome: string;
  createdAt: string;
  onClose: () => void;
}

function getInitial(nome: string) {
  return nome.trim().charAt(0).toUpperCase();
}

export default function NovoLeadToast({ nome, onClose }: NovoLeadToastProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  const handleCardClick = () => {
    dismiss();
    router.push("/corretor/leads");
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismiss();
  };

  return (
    <div
      className={`
        fixed top-6 right-6 z-[200]
        transition-all duration-[350ms]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        onClick={handleCardClick}
        className="relative bg-[#1a1814] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] w-72 overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
      >
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b8912a]" />

        {/* Close button */}
        <button
          onClick={handleCloseClick}
          className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
        >
          <FiX size={14} />
        </button>

        <div className="flex items-center gap-3.5 px-4 py-4 pt-5 pb-4">
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
            <p className="text-white/35 text-[10px] mt-0.5">Clique para ver detalhes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
