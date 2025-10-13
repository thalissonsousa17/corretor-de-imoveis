import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";

const Header: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const userName = user?.name || "Corretor(a)";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Falha ao sair.");
    }
  };

  return (
    <header className="flex justify-between items-center px-8 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div className="text-xl font-bold text-blue-600">Logo</div>
      {/* canto direito - perfil e notificação */}
      <div className="flex items-center space-x-5 relative" ref={menuRef}>
        {/* sino notificação */}
        <div className="text-xl cursor-pointer hover:text-gray-700 transition duration-150">🔔</div>

        {/* Avatar - E-mail do Perfil */}
        {/* Botão Sair */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm hover:bg-blue-600 focus:outline-none transition duration-150"
          aria-label="Abrir menu do usuário"
        >
          {userName.charAt(0).toUpperCase()}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
            {/* E-mail do Usuário */}
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 truncate">
              {userName}
            </div>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition duration-150"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
