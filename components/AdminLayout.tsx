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
  Bell,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [naoLidas, setNaoLidas] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

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
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin/dashboard" },
    { label: "Usuários", icon: <Users size={18} />, href: "/admin/users" },
    { label: "Suporte", icon: <HeadphonesIcon size={18} />, href: "/admin/suporte" },
    { label: "Ajuda", icon: <HelpCircle size={18} />, href: "/admin/ajuda" },
  ];

  const extraLinks = [
    { label: "Meu Dashboard", icon: <Home size={18} />, href: "/corretor/dashboard" },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col fixed top-0 left-0 h-screen z-40
          bg-[#1A2A4F] text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-64"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 h-14 border-b border-white/10 flex-shrink-0`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-[#D4AC3A] flex items-center justify-center text-[#1A2A4F] text-xs font-bold">
                A
              </div>
              <span className="font-bold text-sm text-[#D4AC3A] tracking-tight">Admin Painel</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* User info */}
        <div className={`px-3 py-3 border-b border-white/10 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-[#D4AC3A] flex items-center justify-center text-[#1A2A4F] text-[11px] font-bold">
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-9 h-9 rounded-full bg-[#D4AC3A] flex items-center justify-center text-[#1A2A4F] text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-[#D4AC3A] text-[#1A2A4F] font-bold shadow-lg shadow-[#D4AC3A]/20"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Separador + Links Extras */}
          <div className="pt-3 mt-2 border-t border-white/10">
            {!collapsed && (
              <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-2">Área do Corretor</p>
            )}
            {extraLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-2 py-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={logout}
            title={collapsed ? "Sair" : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-64"}`}>
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
