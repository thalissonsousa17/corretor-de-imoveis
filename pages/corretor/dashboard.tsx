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
      <Header />
      <div className="space-y-6 text-gray-600">
        <h1 className="text-3xl font-semibold text-gray-800 p-4">🏠 Dashboard</h1>

        <p>Bem-vindo(a)! Aqui você verá um resumo dos seus imóveis e atividades.</p>

        {/* Exemplo de Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500">Imóveis Ativos</p>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div className="min-h-screen bg-gray-50">
            <main className="px-8 py-5 container mx-auto">
              <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                Gerenciamento de Imóveis
              </h1>

              <ImovelListagemCorretor
                key={reloadKey}
                onEdit={handleEdit}
                onImovelChange={handleImovelChange}
              />

              <div id="imovel-form-section" className="mt-10 pt-10">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                  {editingImovelId ? "Editar Imóvel Existente" : "Cadastrar Novo Imóvel"}

                  {editingImovelId && (
                    <button
                      onClick={() => setEditingImovelId(null)}
                      className="ml-4 text-base font-normal text-red-500 hover:text-red-700 border border-red-500 rounded-md px-3 py-1 transition"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </h2>

                <ImovelFormulario imovelId={editingImovelId} onSuccess={handleImovelChange} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </CorretorLayout>
  );
};

export default DashboardPage;
