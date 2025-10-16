import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import CorretorLayout from "./CorretorLayout";

const Header: React.FC = () => {
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

  return (
    <CorretorLayout>
      <header className="flex justify-between items-center px-8 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="text-xl font-bold text-blue-600">Logo</div>
        {/* canto direito - perfil e notificação */}
        <div className="flex items-center space-x-5 relative" ref={menuRef}>
          {/* sino notificação */}
          <div className="text-xl cursor-pointer hover:text-gray-700 transition duration-150">
            🔔
          </div>

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
            </div>
          )}
        </div>
      </header>
    </CorretorLayout>
  );
};

export default Header;
