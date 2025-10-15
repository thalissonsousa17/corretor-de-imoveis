import React from "react";
import SidebarCorretor from "./SidebarCorretor";

const CorretorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fixa */}
      <SidebarCorretor />

      {/* Conteúdo principal com margem para a sidebar */}
      <main className="flex-grow ml-64 p-8">{children}</main>
    </div>
  );
};

export default CorretorLayout;
