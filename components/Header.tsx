import { useEffect, useState } from "react";
import Link from "next/link";

interface Corretor {
  name?: string;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
}

export default function HeaderCorretor({ corretor }: { corretor: Corretor }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      {/* CONTAINER PRINCIPAL */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* ===== ESQUERDA: Nome do corretor ===== */}
        <div className="flex items-center gap-3">
          <h1 className="text-white text-lg font-semibold tracking-wide">{corretor.name}</h1>
        </div>

        {/* ===== DIREITA: Navegação + WhatsApp ===== */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="#imoveis" className="text-white font-medium hover:text-gray-300 transition">
              Imóveis
            </Link>
            <Link href="#perfil" className="text-white font-medium hover:text-gray-300 transition">
              Perfil
            </Link>
            <Link href="#contato" className="text-white font-medium hover:text-gray-300 transition">
              Contato
            </Link>
            <Link href="#contato" className="text-white font-medium hover:text-gray-300 transition">
              {corretor.whatsapp}
            </Link>
          </nav>

          {/* Botão WhatsApp */}
          {corretor.whatsapp && (
            <a
              href={`https://wa.me/${corretor.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
