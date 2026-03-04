import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bell } from "lucide-react";
import SidebarCorretor from "./SidebarCorretor";
import api from "@/lib/api";
import NovoLeadToast from "./NovoLeadToast";

const pageTitles: Record<string, string> = {
  "/corretor/dashboard": "Dashboard",
  "/corretor/perfil": "Perfil",
  "/corretor/imoveis/cadastrar": "Cadastrar Imóvel",
  "/corretor/imoveis": "Gerenciar Imóveis",
  "/corretor/contratos": "Contratos",
  "/corretor/leads": "Meus Leads",
  "/corretor/visitas": "Visitas",
  "/corretor/financeiro": "Financeiro",
  "/corretor/seguranca": "Segurança",
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
  const [leadNotif, setLeadNotif] = useState<{ nome: string; createdAt: string } | null>(null);

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

  useEffect(() => {
    const LS_KEY = "lastLeadSeenAt";

    const checkLeads = async () => {
      try {
        const res = await api.get("/corretor/leads");
        const leads: Array<{ nome: string; createdAt: string }> = Array.isArray(res.data) ? res.data : [];
        if (!leads.length) return;

        const newest = leads.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );

        const lastSeen = localStorage.getItem(LS_KEY);
        if (!lastSeen) {
          // First load — mark as seen, no popup
          localStorage.setItem(LS_KEY, newest.createdAt);
          return;
        }

        if (new Date(newest.createdAt) > new Date(lastSeen)) {
          localStorage.setItem(LS_KEY, newest.createdAt);
          setLeadNotif({ nome: newest.nome, createdAt: newest.createdAt });
        }
      } catch {}
    };

    checkLeads();
    const interval = setInterval(checkLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCorretor />

      <div className="flex-grow ml-0 md:ml-[220px] flex flex-col transition-all duration-300">
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

      {leadNotif && (
        <NovoLeadToast
          nome={leadNotif.nome}
          createdAt={leadNotif.createdAt}
          onClose={() => setLeadNotif(null)}
        />
      )}
    </div>
  );
};

export default CorretorLayout;
