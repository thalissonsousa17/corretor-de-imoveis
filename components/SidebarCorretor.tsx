import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FiHome, FiUser, FiPlusSquare, FiList, FiLogOut } from "react-icons/fi";
import axios from "axios";

const navItems = [
  { href: "/corretor/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/corretor/perfil", icon: FiUser, label: "Perfil" },
  { href: "/corretor/imoveis/cadastrar", icon: FiPlusSquare, label: "Cadastrar Imóvel" },
  { href: "/corretor/imoveis", icon: FiList, label: "Gerenciar Imóveis" },
];

const SidebarCorretor: React.FC = () => {
  const router = useRouter();

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
    <div className="flex flex-col w-64 bg-gray-800 text-white min-h-screen fixed top-0 left-0">
      {/* 1. Cabeçalho */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center">
          ImobiCorretor <span className="ml-2 text-yellow-400">🏡</span>
        </h1>
      </div>

      {/* 2. Itens de Navegação */}
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            router.pathname === item.href ||
            (item.href !== "/corretor/imoveis" && router.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Futuras expansões */}
        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Futuras Expansões</p>
        </div>
      </nav>

      {/* 3. Botão de Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 cursor-pointer rounded-lg text-red-400  hover:bg-gray-700 transition-colors duration-200"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarCorretor;
