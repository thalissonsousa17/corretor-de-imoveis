import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  LogOut,
  HeadphonesIcon,
  Home,
  Bell
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || isLoading) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/suporte/notificacoes");
        setNaoLidas(res.data.naoLidas);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A2A4F]"></div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin/dashboard" },
    { label: "Usuários", icon: <Users size={20} />, href: "/admin/users" },
    { label: "Suporte", icon: <HeadphonesIcon size={20} />, href: "/admin/suporte" },
  ];

  const extraLinks = [
    { label: "Meu Dashboard", icon: <Home size={20} />, href: "/corretor/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A2A4F] text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-[#D4AC3A]">🏡 Admin Painel</h1>
          <p className="text-xs text-gray-400 mt-1">Gerenciamento do Sistema</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-[#D4AC3A] text-[#1A2A4F] font-bold shadow-lg shadow-[#D4AC3A]/20"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Separador + Links Extras */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider px-4 mb-2">Área do Corretor</p>
            {extraLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-gray-400">Logado como</p>
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-[5]">
          <h2 className="text-xl font-bold text-gray-800">
            {menuItems.find(i => i.href === router.pathname)?.label || "Admin"}
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/admin/suporte" className="relative p-1">
              <Bell size={20} className="text-gray-400 hover:text-gray-700 transition-colors" />
              {naoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {naoLidas > 99 ? "99+" : naoLidas}
                </span>
              )}
            </Link>
            <div className="h-9 w-9 bg-[#1A2A4F] rounded-full flex items-center justify-center text-[#D4AC3A] font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
