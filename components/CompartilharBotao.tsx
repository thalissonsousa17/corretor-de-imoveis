import { useState } from "react";

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
        console.error("Erro ao compartilhar:", err);
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <button
      onClick={compartilhar}
      className="
        flex items-center gap-2
        px-4 py-2
        rounded-lg
        bg-[#1A2A4F]
        text-white
        transition
        text-sm
        font-medium
        cursor-pointer
        hover:text-[#D4AC3A]
      "
    >
      🔗 {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
