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

      <main className="container mx-auto p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">ImobTECH</h1>

          <h2 className="text-gray-800 font-bold text-5xl">
            A ImobTECH é uma plataforma para Corretores de imóveis.{" "}
          </h2>

          <div className="container mx-auto flex justify-between items-center">
            <nav>
              <Link
                href="/login"
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition duration-150"
              >
                Login / Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
