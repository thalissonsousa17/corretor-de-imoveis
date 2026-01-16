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
  async function handleCheckout(priceId: string) {
    if (!priceId) {
      alert("Plano inválido. Tente novamente.");
      return;
    }
    try {
      const res = await fetch("/api/stripe/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Erro ao iniciar checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      alert("Erro ao iniciar pagamento");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ImobHub • Plataforma Profissional para Corretores</title>
      </Head>

      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-extrabold text-[#1A2A4F] leading-tight">
          A plataforma inteligente para Corretores de Imóveis
        </h2>

        <p className="mt-6 text-xl text-[#1A2A4F] max-w-3xl mx-auto">
          Crie sua página profissional, publique imóveis com facilidade e gerencie tudo em um painel
          moderno. Comece gratuitamente e evolua conforme seu negócio cresce.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-[#1A2A4F] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:border hover:text-[#1A2A4F] transition shadow-lg"
          >
            Começar gratuitamente
          </Link>

          <span className="text-sm text-gray-500">Sem cartão de crédito • Ativação imediata</span>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1A2A4F] text-center">
            Por que corretores escolhem a ImobHub?
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
            Veja como funciona sua área exclusiva dentro da ImobHub.
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

      {/*  PÁGINA DE VENDAS */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#1A2A4F]">
              Crie sua própria página de vendas personalizada
            </h2>

            <p className="mt-6 text-lg text-[#1A2A4F]">
              Na ImobHub você ganha automaticamente sua landing page profissional, com seu nome, sua
              foto, seus contatos e todos seus imóveis organizados de forma elegante para captar
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

        <p className="mt-4 max-w-2xl mx-auto">
          Comece gratuitamente e evolua conforme sua carteira de imóveis cresce. Planos acessíveis
          pensados para corretores que querem escalar.
        </p>

        <div className="mt-16 grid md:grid-cols-4 gap-10 ">
          {/* PLANO GRATUITO */}
          <div className="shadow-lg p-8 rounded-2xl bg-white border border-gray-200 hover:scale-[1.03] transition">
            <h3 className="text-2xl font-bold">Gratuito</h3>

            <p className="text-4xl font-extrabold mt-4">
              R$ 0<span className="block text-base font-medium">Para sempre</span>
            </p>

            <ul className="mt-6 text-left space-y-3">
              <li>• Até 5 imóveis</li>
              <li>• Página pública básica</li>
              <li>• Painel de gerenciamento</li>
              <li>• Suporte básico</li>
            </ul>

            <Link
              href="/register"
              className="mt-8 block w-full border border-[#1A2A4F] text-[#1A2A4F] py-3 rounded-lg font-semibold hover:bg-[#1A2A4F] hover:text-white transition"
            >
              Começar Grátis
            </Link>
          </div>

          {/* PLANO PRO */}
          <div className="shadow-xl p-8 rounded-2xl bg-white hover:scale-[1.03] transition">
            <h3 className="text-2xl font-bold">Pro</h3>

            <p className="text-4xl font-extrabold mt-4">
              R$ 79,90
              <span className="block text-base font-medium">Por mês</span>
            </p>

            <ul className="mt-6 text-left space-y-3">
              <li>• Até 50 imóveis</li>
              <li>• Página personalizada</li>
              <li>• Gerenciamento completo</li>
              <li>• Suporte padrão</li>
            </ul>

            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_PRO!)}
              className="cursor-pointer mt-8 block w-full bg-[#1A2A4F] text-white hover:bg-white hover:text-[#1A2A4F] hover:border hover:border-[#1A2A4F] py-3 rounded-lg font-semibold"
            >
              Assinar Agora
            </button>
          </div>

          {/* PLANO START */}
          <div className="shadow-xl p-8 rounded-2xl bg-white hover:scale-[1.03] transition">
            <h3 className="text-2xl font-bold">Start</h3>

            <p className="text-4xl font-extrabold mt-4">
              R$ 99,90
              <span className="block text-base font-medium">Por mês</span>
            </p>

            <ul className="mt-6 text-left space-y-3">
              <li>• Até 100 imóveis</li>
              <li>• Tudo do plano Pro</li>
              <li>• Prioridade no suporte</li>
              <li>• Melhor custo-benefício</li>
            </ul>

            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_START!)}
              className="cursor-pointer mt-8 block w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1A2A4F] hover:border hover:border-[#1A2A4F]"
            >
              Assinar Agora
            </button>
          </div>
          {/* PLANO EXPERT */}
          <div className="shadow-lg p-5 rounded-xl bg-white border-2 border-[#1A2A4F] hover:scale-[1.03] transition">
            <h3 className="text-lg font-bold">Expert</h3>
            <p className="text-xs font-bold text-[#1A2A4F] uppercase mt-1">MAIS POPULAR</p>

            {/* Mensal */}
            <p className="text-2xl font-extrabold mt-2">
              R$ 149,90
              <span className="block text-xs font-medium">Por mês</span>
            </p>

            {/* Anual */}
            <div className="mt-3 bg-[#1A2A4F] text-white rounded-lg p-3">
              <p className="text-xs uppercase font-semibold">Oferta anual (12 meses)</p>

              <p className="text-lg font-extrabold">R$ 119,90 / mês</p>

              <p className="text-sm font-medium opacity-90">Cobrança única anual de R$ 1.438,80</p>

              <p className="text-xs opacity-80 mt-1">Parcelamento disponível conforme o cartão</p>
            </div>

            <ul className="mt-4 text-left text-sm space-y-1.5">
              <li>• Imóveis ilimitados</li>
              <li>• Tudo do plano Start</li>
              <li>• Suporte premium</li>
              <li>• Recursos avançados</li>
            </ul>

            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_EXPERT_MENSAL!)}
              className="cursor-pointer mt-8 block w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1A2A4F] hover:border hover:border-[#1A2A4F]"
            >
              Assinar Agora
            </button>

            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_EXPERT_YEARLY!)}
              className="cursor-pointer mt-8 block w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1A2A4F] hover:border hover:border-[#1A2A4F]"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A2A4F] text-gray-300 py-8 text-center">
        <p>© {new Date().getFullYear()} ImobHub. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
