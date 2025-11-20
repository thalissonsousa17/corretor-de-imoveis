import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ImobTECH • Plataforma Profissional para Corretores</title>
      </Head>

      {/* HERO */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-extrabold text-[#1A2A4F] leading-tight">
          A plataforma inteligente para Corretores de Imóveis
        </h2>

        <p className="mt-6 text-xl text-[#1A2A4F] max-w-3xl mx-auto">
          Tenha seu site profissional, publique imóveis com facilidade e gerencie tudo em um painel
          moderno — sem complicações.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#planos"
            className="bg-[#1A2A4F] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:border hover:text-[#1A2A4F] transition shadow-lg"
          >
            Começar Agora
          </Link>
        </div>
      </section>

      {/* POR QUE IMOBTECH */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1A2A4F] text-center">
            Por que corretores escolhem a ImobTECH?
          </h2>

          <div className="grid md:grid-cols-3 gap-12 mt-16">
            <div>
              <h3 className="text-xl font-semibold text-[#1A2A4F]">Página Exclusiva</h3>
              <p className="mt-2 text-[#1A2A4F]">
                Um site profissional para você divulgar seus imóveis.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A2A4F]">Painel Moderno</h3>
              <p className="mt-2 text-gray-600">
                Estatísticas, filtros avançados e controle total.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1A2A4F]">Cadastro Rápido</h3>
              <p className="mt-2 text-[#1A2A4F]">Publique novos imóveis em poucos cliques.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CARROSSEL DO SISTEMA */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[#1A2A4F]">
            Interface moderna, fácil de usar e projetada para corretores que querem crescer.
          </h2>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Veja como funciona sua área exclusiva dentro da ImobTECH.
          </p>

          {/* CARROSSEL */}
          <div className="mt-16 overflow-hidden relative">
            <div
              className="flex gap-8 animate-slide"
              style={{
                animation: "slide 18s linear infinite",
              }}
            >
              {/* ITEM 1 */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/gerenciar.png"
                    alt="Gerenciamento Completo"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Gerenciamento Completo</h3>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/cadastrar.png"
                    alt="Cadastro Rápido"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Cadastro Rápido</h3>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/dashboard.png"
                    alt="Dashboard Inteligente"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Dashboard Inteligente</h3>
                </div>
              </div>

              {/* REPETIÇÃO PARA ANIMAÇÃO INFINITA */}
              {/* ITEM 1 (repeat) */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/gerenciar.png"
                    alt="Gerenciamento Completo"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Gerenciamento Completo</h3>
                </div>
              </div>

              {/* ITEM 2 (repeat) */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/cadastrar.png"
                    alt="Cadastro Rápido"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Cadastro Rápido</h3>
                </div>
              </div>

              {/* ITEM 3 (repeat) */}
              <div className="shadow-lg bg-white rounded-2xl overflow-hidden w-[420px] flex-shrink-0">
                <div className="w-full h-[220px] bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/demo/dashboard.png"
                    alt="Dashboard Inteligente"
                    width={400}
                    height={220}
                    className="object-contain"
                  />
                </div>
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold text-[#1A2A4F]">Dashboard Inteligente</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANIMAÇÃO DO CARROSSEL */}
        <style>{`
      @keyframes slide {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-[#1A2A4F]">Como funciona?</h2>

          <div className="grid md:grid-cols-3 gap-12 mt-16 text-center">
            <div>
              <h3 className="text-xl font-bold text-[#1A2A4F]">1. Crie sua conta</h3>
              <p className="text-gray-600 mt-2">Leva menos de 1 minuto.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1A2A4F]">2. Configure seu perfil</h3>
              <p className="text-gray-600 mt-2">Adicione suas informações e links.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1A2A4F]">3. Publique seus imóveis</h3>
              <p className="text-gray-600 mt-2">Simples, rápido e profissional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SUA PÁGINA DE VENDAS */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#1A2A4F]">
              Crie sua própria página de vendas personalizada
            </h2>

            <p className="mt-6 text-lg text-[#1A2A4F]">
              Na ImobTECH você ganha automaticamente sua landing page profissional, com seu nome,
              sua foto, seus contatos e todos seus imóveis organizados de forma elegante para captar
              novos clientes todos os dias.
            </p>

            <ul className="mt-6 space-y-3 text-[#1A2A4F] text-lg">
              <li>• Link exclusivo para compartilhar</li>
              <li>• Layout limpo e profissional</li>
              <li>• Seus imóveis exibidos automaticamente</li>
              <li>• Formulário para captar leads</li>
              <li>• Zero configuração — tudo pronto!</li>
            </ul>

            <Link
              href="#planos"
              className="mt-8 inline-block bg-[#1A2A4F] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 hover:border hover:text-[#1A2A4F] transition"
            >
              Criar minha página agora
            </Link>
          </div>

          <div>
            <Image
              src="/demo/capa.png"
              alt="Página de vendas"
              width={700}
              height={450}
              className="rounded-xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="container mx-auto px-6 py-24 text-center text-[#1A2A4F]">
        <h2 className="text-4xl font-bold">Escolha o plano ideal para você</h2>
        <p className="text-[#1A2A4F]mt-4 max-w-2xl mx-auto">
          Todos os planos incluem acesso total à plataforma, página de vendas exclusiva, cadastro de
          imóveis ilimitado e suporte completo.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-12">
          {/* PLANO MENSAL */}
          <div className="shadow-xl p-10 rounded-2xl bg-white hover:scale-[1.03] transition">
            <h3 className="text-2xl font-bold">Mensal</h3>
            <p className="text-4xl font-extrabold mt-4">R$ 299,90</p>
            <ul className="mt-6 text-left text-[#1A2A4F] space-y-3">
              <li>• Página de vendas personalizada</li>
              <li>• Cadastro ilimitado de imóveis</li>
              <li>• Gerenciamento completo</li>
              <li>• Suporte básico</li>
            </ul>

            <Link
              href="https://buy.stripe.com/test_8x228qcqA6wUcVx0qp1wY01"
              target="_blank"
              className="mt-8 block w-full bg-[#1A2A4F] text-white hover:bg-gray-100 hover:border hover:text-[#1A2A4F] py-3 rounded-lg font-semibold"
            >
              Assinar Agora
            </Link>
          </div>

          {/* PLANO SEMESTRAL */}
          <div className="shadow-2xl p-10 rounded-2xl bg-white border-4 border-[#1A2A4F] scale-[1.05] hover:scale-[1.10]">
            <h3 className="text-2xl font-bold text-[#1A2A4F]">Semestral • MAIS POPULAR</h3>
            <p className="text-4xl font-extrabold mt-4 text-[#1A2A4F]">R$ 249,90</p>
            <ul className="mt-6 text-left text-gray-700 space-y-3">
              <li>• Tudo do plano Mensal</li>
              <li>• Suporte Prioritário</li>
              <li>• Melhor custo-benefício</li>
              <li>• Atualizações exclusivas</li>
            </ul>

            <Link
              href="https://buy.stripe.com/test_8x28wO0HSf3qaNp4GF1wY02"
              target="_blank"
              className="mt-8 block w-full bg-[#1A2A4F] text-white  hover:bg-gray-100 hover:border hover:text-[#1A2A4F] py-3 rounded-lg font-semibold"
            >
              Assinar Agora
            </Link>
          </div>

          {/* PLANO ANUAL */}
          <div className="shadow-xl p-10 rounded-2xl bg-white hover:scale-[1.03] transition">
            <h3 className="text-2xl font-bold">Anual</h3>
            <p className="text-4xl font-extrabold mt-4">R$ 199,00</p>
            <ul className="mt-6 text-left text-gray-700 space-y-3">
              <li>• Tudo do plano Semestral</li>
              <li>• Economia máxima</li>
              <li>• Bônus exclusivos</li>
              <li>• Suporte Premium</li>
            </ul>

            <Link
              href="https://buy.stripe.com/test_8x228q4Y82gE5t5b531wY03"
              target="_blank"
              className="mt-8 block w-full bg-[#1A2A4F] text-white  hover:bg-gray-100 hover:border hover:text-[#1A2A4F] py-3 rounded-lg font-semibold"
            >
              Assinar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A2A4F] text-gray-300 py-8 text-center">
        <p>© {new Date().getFullYear()} ImobTECH. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
