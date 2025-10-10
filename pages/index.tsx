// pages/index.tsx

import React from "react";
import Head from "next/head";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

// Tipagem baseada no que nossa API /api/imoveis retorna
interface Foto {
  url: string;
  principal: boolean;
}

interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  localizacao: string;
  tipo: string;
  corretor: {
    name: string;
  };
  fotos: Foto[];
}

// Usaremos getServerSideProps para buscar dados no lado do servidor a cada requisição
// (isso garante que os dados estejam sempre atualizados).
export async function getServerSideProps() {
  try {
    // Busca a lista de imóveis da nossa API pública
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await axios.get(`${apiUrl}/api/imoveis`);
    const imoveis = response.data;

    return {
      props: {
        imoveis,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return {
      props: {
        imoveis: [],
        error: "Não foi possível carregar os imóveis. Tente novamente mais tarde.",
      },
    };
  }
}

interface HomeProps {
  imoveis: Imovel[];
  error?: string;
}

const Home: React.FC<HomeProps> = ({ imoveis, error }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Corretor de Imóveis | Encontre seu Próximo Lar</title>
      </Head>

      {/* Exemplo de um Header simples com link para login/dashboard */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Imobiliária
          </Link>
          <nav>
            <Link
              href="/login"
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition duration-150"
            >
              Login / Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Imóveis Disponíveis
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {imoveis.length === 0 && !error ? (
          <p className="text-center text-xl text-gray-600">Nenhum imóvel disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imoveis.map((imovel) => (
              <div
                key={imovel.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden"
              >
                {/* Imagem Principal */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {imovel.fotos && imovel.fotos.length > 0 ? (
                    <Image
                      // Prioriza a foto principal, senão usa a primeira
                      src={imovel.fotos.find((f) => f.principal)?.url || imovel.fotos[0].url}
                      alt={imovel.titulo}
                      width={600}
                      height={300}
                      className="w-full h-full object-cover"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      Sem Foto
                    </div>
                  )}
                </div>

                {/* Detalhes */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 truncate mb-2">
                    {imovel.titulo}
                  </h2>
                  <p className="text-2xl font-bold text-indigo-600 mb-3">
                    R$ {imovel.preco.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Tipo: {imovel.tipo} | Localização: {imovel.localizacao || "Não Informada"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Corretor: {imovel.corretor.name}</p>

                  {/* Link para a página de detalhes (próxima etapa) */}
                  <Link
                    href={`/imoveis/${imovel.id}`}
                    className="block w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-150"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
