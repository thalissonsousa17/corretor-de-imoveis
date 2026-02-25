import { useState } from "react";
import { FiShare2, FiCheck, FiCopy } from "react-icons/fi";

interface CompartilharBotaoProps {
  titulo: string;
  url: string;
}

export default function CompartilharBotao({ titulo, url }: CompartilharBotaoProps) {
  const [copiado, setCopiado] = useState(false);

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: titulo,
          url,
        });
      } catch (err) {
        // Ignora erro se o usuário cancelar o compartilhamento
        if ((err as Error).name !== "AbortError") {
          console.error("Erro ao compartilhar:", err);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <button
      onClick={compartilhar}
      className={`
        relative overflow-hidden
        flex items-center gap-2.5
        px-5 py-2.5
        rounded-xl
        transition-all duration-300
        text-sm font-semibold
        cursor-pointer
        shadow-sm hover:shadow-md
        ${copiado 
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
          : "bg-white text-slate-700 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600"
        }
      `}
    >
      <div className={`transition-all duration-300 ${copiado ? "scale-110" : "scale-100"}`}>
        {copiado ? <FiCheck size={18} /> : <FiShare2 size={18} className="text-slate-400 group-hover:text-blue-600" />}
      </div>
      
      <span className="tracking-tight">
        {copiado ? "Link copiado!" : "Compartilhar"}
      </span>

      {/* Efeito de brilho sutil ao passar o mouse */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
    </button>
  );
}
