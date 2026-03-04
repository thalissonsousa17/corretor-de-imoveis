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
        flex items-center gap-2.5
        px-5 py-2.5
        transition-all duration-300
        text-xs font-bold uppercase tracking-widest
        cursor-pointer
        ${copiado
          ? "bg-[#b8912a] text-white border border-[#b8912a]"
          : "bg-white dark:bg-[#231f18] text-[#1a1814] dark:text-white border border-[#e8e4dc] dark:border-white/10 hover:bg-[#1a1814] hover:text-white hover:border-[#1a1814]"
        }
      `}
    >
      <div className={`transition-all duration-300 ${copiado ? "scale-110" : "scale-100"}`}>
        {copiado ? <FiCheck size={15} /> : <FiShare2 size={15} />}
      </div>
      
      <span className="tracking-tight">
        {copiado ? "Link copiado!" : "Compartilhar"}
      </span>

    </button>
  );
}
