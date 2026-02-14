import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FiHome, FiUser, FiPlusSquare, FiList, FiLogOut, FiShield, FiMessageSquare, FiFileText } from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { href: "/corretor/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/corretor/perfil", icon: FiUser, label: "Perfil" },
  { href: "/corretor/imoveis/cadastrar", icon: FiPlusSquare, label: "Cadastrar Imóvel" },
  { href: "/corretor/imoveis", icon: FiList, label: "Gerenciar Imóveis" },
  { href: "/corretor/contratos", icon: FiFileText, label: "Contratos" },
  { href: "/corretor/assinaturas", icon: AiOutlineFileText, label: "Meu Plano" },
];

const SidebarCorretor: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div
      className="
        flex flex-col 
        bg-gray-800 text-white 
        min-h-screen 
        fixed top-0 left-0 
        w-[70px] md:w-64          
        transition-all duration-300
        z-40
      "
    >
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold flex items-center">
          <span className="hidden md:inline">ImobCorretor</span>
          <span className="ml-0 md:ml-2 text-yellow-400">🏡</span>
        </h1>
      </div>

      {/* Navegação */}
      <nav className="flex-grow p-2 md:p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            router.pathname === item.href ||
            (item.href !== "/corretor/imoveis" && router.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center 
                p-3 rounded-lg transition-colors duration-200
                text-sm md:text-base
                ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:bg-gray-700"}
              `}
            >
              <item.icon className="w-6 h-6 mx-auto md:mx-0 md:mr-3" />

              <span className="hidden md:inline font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Link de Suporte */}
        <Link
          href="/corretor/suporte"
          className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-sm md:text-base ${
            router.pathname.startsWith("/corretor/suporte") ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:bg-gray-700"
          }`}
        >
          <FiMessageSquare className="w-6 h-6 mx-auto md:mx-0 md:mr-3" />
          <span className="hidden md:inline font-medium">Suporte</span>
        </Link>
        {user?.role === "ADMIN" && (
          <>
            <div className="pt-4 border-t border-gray-700 mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-3 hidden md:block">Administração</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="flex items-center p-3 rounded-lg transition-colors duration-200 text-sm md:text-base text-amber-400 hover:bg-gray-700"
            >
              <FiShield className="w-6 h-6 mx-auto md:mx-0 md:mr-3" />
              <span className="hidden md:inline font-medium">Painel Admin</span>
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-2 md:p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 cursor-pointer rounded-lg text-red-400 hover:bg-gray-700 transition-colors duration-200 text-sm md:text-base"
        >
          <FiLogOut className="w-6 h-6 mx-auto md:mx-0 md:mr-3" />
          <span className="hidden md:inline font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarCorretor;

