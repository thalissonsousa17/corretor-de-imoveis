// pages/corretor/dashboard.tsx
import Header from "@/components/Header";
import ImovelListagemCorretor from "@/components/ImovelListagemCorretor";
import ImovelFormulario from "@/components/ImovelFormulario";
import React, { useState, useCallback } from "react";
import CorretorLayout from "@/components/CorretorLayout";

const DashboardPage: React.FC = () => {
  const [editingImovelId, setEditingImovelId] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const handleEdit = useCallback((imovelId: string) => {
    setEditingImovelId(imovelId);

    document.getElementById("imovel-form-section")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleImovelChange = useCallback(() => {
    setEditingImovelId(null);
    setReloadKey((prev) => prev + 1);
  }, []);

  return (
    <CorretorLayout>
      <div className="space-y-6 text-gray-600">
        <h1 className="text-3xl font-semibold text-gray-800 p-4">🏠 Dashboard</h1>

        <p>Bem-vindo(a)! Aqui você verá um resumo dos seus imóveis e atividades.</p>

        {/* Exemplo de Card */}
      </div>
    </CorretorLayout>
  );
};

export default DashboardPage;
