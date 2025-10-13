// pages/corretor/dashboard.tsx
import Header from "@/components/Header";
import React from "react"; // Importar React é uma boa prática

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* O conteúdo principal do Dashboard */}

      <main className="px-8 py-5">
        {/* Título */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Bem-vindo(a) ao Dashboard do Corretor!
        </h1>

        {/* Conteúdo de exemplo */}
        <p className="text-gray-600">Gerenciar imoveis.</p>

        {/* Espaço para o componente CRUD de Imóveis */}
        <div className="mt-8 p-6 bg-gray-200 text-gray-500 rounded-lg shadow">
          Conteúdo do CRUD de Imóveis
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
