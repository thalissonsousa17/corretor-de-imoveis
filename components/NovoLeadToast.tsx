import { useEffect, useState } from "react";

interface NovoLeadToastProps {
  nome: string;
  createdAt: string;
  onClose: () => void;
}

function getInitial(nome: string) {
  return nome.trim().charAt(0).toUpperCase();
}

export default function NovoLeadToast({ nome, onClose }: NovoLeadToastProps) {
  const [visible, setVisible] = useState(false);

  // Slide-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div
      onClick={handleClose}
      className={`
        fixed top-6 right-6 z-[200] cursor-pointer
        transition-all duration-[350ms]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div className="relative bg-[#1a1814] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] w-72 overflow-hidden">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b8912a]" />

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
          </div>
        </div>
      </div>
    </div>
  );
}
