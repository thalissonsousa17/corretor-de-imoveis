import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bell } from "lucide-react";
import SidebarCorretor from "./SidebarCorretor";
import api from "@/lib/api";

const pageTitles: Record<string, string> = {
  "/corretor/dashboard": "Dashboard",
  "/corretor/perfil": "Perfil",
  "/corretor/imoveis/cadastrar": "Cadastrar Imóvel",
  "/corretor/imoveis": "Gerenciar Imóveis",
  "/corretor/contratos": "Contratos",
  "/corretor/assinaturas": "Meu Plano",
  "/corretor/suporte": "Suporte",
};

const getTitle = (pathname: string) => {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/corretor/suporte/")) return "Suporte";
  if (pathname.startsWith("/corretor/imoveis/")) return "Imóvel";
  if (pathname.startsWith("/corretor/contratos")) return "Contratos";
  return "ImobCorretor";
};

const CorretorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/suporte/notificacoes");
        setNaoLidas(res.data.naoLidas);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCorretor />

      <div className="flex-grow ml-16 md:ml-56 xl:ml-64 flex flex-col transition-all duration-300">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-[5]">
          <h2 className="text-xl font-bold text-gray-800">{getTitle(router.pathname)}</h2>
          <div className="flex items-center gap-3">
            <Link href="/corretor/suporte" className="relative p-1">
              <Bell size={20} className="text-gray-400 hover:text-gray-700 transition-colors" />
              {naoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {naoLidas > 99 ? "99+" : naoLidas}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CorretorLayout;
