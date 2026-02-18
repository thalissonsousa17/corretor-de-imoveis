import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FiHome,
  FiUser,
  FiPlusSquare,
  FiList,
  FiLogOut,
  FiShield,
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiLock,
  FiChevronLeft,
  FiMenu,
  FiDollarSign,
} from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";
import { useAuth } from "@/lib/AuthContext";

const mainNav = [
  { href: "/corretor/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/corretor/imoveis", icon: FiList, label: "Meus Imóveis" },
  { href: "/corretor/imoveis/cadastrar", icon: FiPlusSquare, label: "Cadastrar Imóvel" },
];

const toolsNav = [
  { href: "/corretor/leads", icon: FiUsers, label: "Leads / CRM" },
  { href: "/corretor/visitas", icon: FiCalendar, label: "Visitas" },
  { href: "/corretor/contratos", icon: FiFileText, label: "Contratos" },
  { href: "/corretor/financeiro", icon: FiDollarSign, label: "Financeiro" },
];

const accountNav = [
  { href: "/corretor/perfil", icon: FiUser, label: "Perfil" },
  { href: "/corretor/seguranca", icon: FiLock, label: "Segurança" },
  { href: "/corretor/assinaturas", icon: AiOutlineFileText, label: "Meu Plano" },
  { href: "/corretor/suporte", icon: FiMessageSquare, label: "Suporte" },
];

const SidebarCorretor: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    router.pathname === href ||
    (href !== "/corretor/imoveis" && router.pathname.startsWith(href));

  const renderNavItem = (item: { href: string; icon: React.ElementType; label: string }) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`
          group relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200
          ${active
            ? "bg-white/10 text-white shadow-sm"
            : "text-gray-400 hover:text-white hover:bg-white/5"
          }
        `}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-400 rounded-r-full" />
        )}
        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? "mx-auto" : ""} ${active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderSection = (label: string, items: typeof mainNav) => (
    <div className="mb-0.5">
      {!collapsed && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          {label}
        </p>
      )}
      {collapsed && <div className="border-t border-white/5 mx-3 mb-1.5" />}
      <div className="space-y-px">
        {items.map(renderNavItem)}
      </div>
    </div>
  );

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "C";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="md:hidden fixed top-3 left-3 z-50 bg-[#0f1729] text-white p-2 rounded-lg shadow-lg"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      <aside
        className={`
          flex flex-col fixed top-0 left-0 h-screen z-40
          bg-[#0f1729] text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[220px]"}
          ${collapsed ? "max-md:-translate-x-full md:translate-x-0" : ""}
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 h-14 border-b border-white/5 flex-shrink-0`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                IC
              </div>
              <span className="font-bold text-sm tracking-tight">ImobCorretor</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
          >
            <FiChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* User info */}
        <div className={`px-3 py-3 border-b border-white/5 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold">
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name || "Corretor"}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin">
          {renderSection("Principal", mainNav)}
          {renderSection("Ferramentas", toolsNav)}
          {renderSection("Conta", accountNav)}

          {user?.role === "ADMIN" && (
            <div className="mb-0.5">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
                  Admin
                </p>
              )}
              {collapsed && <div className="border-t border-amber-500/20 mx-3 mb-1.5" />}
              <Link
                href="/admin/dashboard"
                title={collapsed ? "Painel Admin" : undefined}
                className="group flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <FiShield className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? "mx-auto" : ""}`} />
                {!collapsed && <span>Painel Admin</span>}
              </Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="px-2 py-2 border-t border-white/5 flex-shrink-0">
          <button
            onClick={logout}
            title={collapsed ? "Sair" : undefined}
            className={`
              flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-[13px] font-medium
              text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <FiLogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarCorretor;
