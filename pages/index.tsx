import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  Home as HomeIcon, BarChart2, Zap, Globe, ShieldCheck, Users, CheckCircle2,
  Star, ArrowRight, ChevronDown, ChevronUp, FileText, MessageCircle,
} from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// ─── Dados ────────────────────────────────────────────────────────────────────

const RECURSOS = [
  {
    icon: Globe,
    titulo: "Página Exclusiva",
    desc: "Site profissional com seu nome, foto, contatos e todos os seus imóveis organizados automaticamente.",
    cor: "bg-blue-50 text-blue-600",
  },
  {
    icon: BarChart2,
    titulo: "Painel Moderno",
    desc: "Dashboard com estatísticas em tempo real, filtros avançados e controle total da sua carteira.",
    cor: "bg-violet-50 text-violet-600",
  },
  {
    icon: Zap,
    titulo: "Cadastro Rápido",
    desc: "Publique novos imóveis com fotos, descrição e valores em menos de 2 minutos.",
    cor: "bg-amber-50 text-amber-600",
  },
  {
    icon: FileText,
    titulo: "Contratos Digitais",
    desc: "Modelos prontos de contratos de aluguel e venda com preenchimento automático via IA.",
    cor: "bg-green-50 text-green-600",
  },
  {
    icon: MessageCircle,
    titulo: "Suporte Dedicado",
    desc: "Equipe pronta para te ajudar por dentro da plataforma, com histórico completo de atendimentos.",
    cor: "bg-rose-50 text-rose-600",
  },
  {
    icon: ShieldCheck,
    titulo: "Segurança Total",
    desc: "Seus dados protegidos com criptografia e backups automáticos. Sua carteira sempre segura.",
    cor: "bg-teal-50 text-teal-600",
  },
];

const PASSOS = [
  {
    num: "01",
    titulo: "Crie sua conta",
    desc: "Cadastro em menos de 1 minuto. Sem cartão de crédito.",
    cor: "bg-blue-600",
  },
  {
    num: "02",
    titulo: "Configure seu perfil",
    desc: "Adicione foto, CRECI, redes sociais e personalize sua página.",
    cor: "bg-violet-600",
  },
  {
    num: "03",
    titulo: "Publique seus imóveis",
    desc: "Simples, rápido e profissional. Compartilhe seu link e capte leads.",
    cor: "bg-emerald-600",
  },
];

const FAQS = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não! O plano Gratuito é 100% grátis e não exige nenhuma forma de pagamento. Você só assina se quiser funcionalidades avançadas.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Não há fidelidade. Você cancela quando quiser diretamente pelo painel, sem burocracia.",
  },
  {
    q: "Minha página fica disponível para clientes?",
    a: "Sim! Você recebe um link exclusivo (ex: imobhub.com/seu-nome) que pode compartilhar no WhatsApp, Instagram e onde quiser.",
  },
  {
    q: "Funciona para corretores autônomos e imobiliárias?",
    a: "Perfeitamente. A plataforma foi desenvolvida tanto para corretores independentes quanto para imobiliárias com equipes.",
  },
  {
    q: "Os contratos da plataforma têm validade jurídica?",
    a: "Os modelos seguem a legislação brasileira (Lei 8.245/91 e Código Civil). Para validade jurídica plena, recomendamos assinatura física ou digital certificada.",
  },
];

const PLANOS = [
  {
    id: "gratuito",
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "para sempre",
    destaque: false,
    tag: null,
    recursos: [
      "Até 5 imóveis",
      "Página pública básica",
      "Painel de gerenciamento",
      "Suporte básico",
    ],
    cta: "Começar Grátis",
    href: "/register",
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 79,90",
    periodo: "por mês",
    destaque: false,
    tag: null,
    recursos: [
      "Até 50 imóveis",
      "Página personalizada",
      "Gerenciamento completo",
      "Suporte padrão",
      "Contratos digitais",
    ],
    cta: "Assinar Agora",
    priceEnv: "NEXT_PUBLIC_PRICE_PRO",
  },
  {
    id: "start",
    nome: "Start",
    preco: "R$ 99,90",
    periodo: "por mês",
    destaque: false,
    tag: "Melhor custo-benefício",
    recursos: [
      "Até 100 imóveis",
      "Tudo do plano Pro",
      "Prioridade no suporte",
      "Domínio personalizado",
      "Contratos + IA",
    ],
    cta: "Assinar Agora",
    priceEnv: "NEXT_PUBLIC_PRICE_START",
  },
  {
    id: "expert",
    nome: "Expert",
    preco: "R$ 149,90",
    periodo: "por mês",
    destaque: true,
    tag: "Mais popular",
    recursos: [
      "Imóveis ilimitados",
      "Tudo do plano Start",
      "Suporte premium 24/7",
      "Recursos exclusivos",
      "Plano anual: R$ 119,90/mês",
    ],
    cta: "Assinar Agora",
    priceEnv: "NEXT_PUBLIC_PRICE_EXPERT_MENSAL",
    priceEnvAnual: "NEXT_PUBLIC_PRICE_EXPERT_YEARLY",
  },
];

// ─── Componente FAQ item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "border-blue-200 shadow-sm" : "border-gray-100"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-blue-600 shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-3" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────
export default function Home() {
  async function handleCheckout(priceId: string) {
    if (!priceId) { alert("Plano inválido. Tente novamente."); return; }
    try {
      const res = await fetch("/api/stripe/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Erro ao iniciar checkout");
      window.location.href = data.url;
    } catch (err) {
      alert("Erro ao iniciar pagamento");
      console.error(err);
    }
  }

  const router = useRouter();
  const [emailHero, setEmailHero] = useState("");

  function handleHeroRegister(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/register?email=${encodeURIComponent(emailHero)}`);
  }

  // Form de contato
  const [contactForm, setContactForm] = useState({ nome: "", email: "", whatsapp: "", mensagem: "" });
  const [contactStatus, setContactStatus] = useState<"IDLE" | "SENDING" | "SUCCESS" | "ERROR">("IDLE");

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactStatus("SENDING");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactStatus("SUCCESS");
        setContactForm({ nome: "", email: "", whatsapp: "", mensagem: "" });
      } else {
        setContactStatus("ERROR");
      }
    } catch {
      setContactStatus("ERROR");
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>ImobHub • Plataforma Profissional para Corretores de Imóveis</title>
        <meta name="description" content="Crie sua página profissional, publique imóveis e gerencie contratos em um só lugar. A plataforma completa para corretores de imóveis." />
      </Head>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#1A2A4F] tracking-tight">
            Imob<span className="text-blue-500">Hub</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="#planos" className="hidden sm:block text-sm text-gray-600 hover:text-[#1A2A4F] font-medium transition">
              Planos
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#1A2A4F] font-medium transition px-3 py-2">
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-[#1A2A4F] text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1f45] via-[#1A2A4F] to-[#1e3a8a] text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 sm:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            Plataforma nº 1 para corretores autônomos
          </div>

          <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight max-w-4xl mx-auto">
            A plataforma{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              inteligente
            </span>{" "}
            para Corretores de Imóveis
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            Crie sua página profissional, publique imóveis, gere contratos com IA e gerencie
            tudo em um painel moderno. Comece <strong className="text-white">gratuitamente</strong> hoje.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-6">
            <form onSubmit={handleHeroRegister} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Seu melhor e-mail"
                value={emailHero}
                onChange={(e) => setEmailHero(e.target.value)}
                className="flex-1 px-5 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg text-base"
              />
              <button
                type="submit"
                className="group flex-shrink-0 bg-[#D4AC3A] text-[#1A2A4F] px-8 py-4 rounded-xl text-base font-bold hover:bg-[#bfa33f] transition shadow-lg shadow-black/20 flex items-center justify-center gap-2"
              >
                Começar grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <Link href="#planos" className="text-white/70 hover:text-white text-sm font-medium transition flex items-center gap-1.5">
              Ver planos e preços
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-6 text-white/50 text-xs">Sem cartão de crédito • Ativação imediata • Cancele quando quiser</p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/10 pt-10">
            {[
              { num: "500+", label: "Corretores ativos" },
              { num: "12k+", label: "Imóveis publicados" },
              { num: "98%", label: "Satisfação" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-black text-white">{s.num}</p>
                <p className="text-xs text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Funcionalidades</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">
              Por que corretores escolhem a ImobHub?
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Tudo que você precisa para profissionalizar sua atuação e aumentar suas vendas em um só lugar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECURSOS.map((r) => (
              <div
                key={r.titulo}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${r.cor}`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#1A2A4F] text-base mb-1.5">{r.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARROSSEL / DEMOS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Veja na prática</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">
            Interface moderna e fácil de usar
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Projetada para corretores que querem crescer, sem complicação.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex gap-6"
            style={{ animation: "slide 20s linear infinite", width: "max-content" }}
          >
            {[
              { src: "/demo/gerenciar.png", label: "Gerenciamento Completo" },
              { src: "/demo/cadastrar.png", label: "Cadastro Rápido" },
              { src: "/demo/dashboard.png", label: "Dashboard Inteligente" },
              { src: "/demo/gerenciar.png", label: "Gerenciamento Completo" },
              { src: "/demo/cadastrar.png", label: "Cadastro Rápido" },
              { src: "/demo/dashboard.png", label: "Dashboard Inteligente" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[380px] bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
              >
                {/* Browser chrome */}
                <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 bg-white rounded-md h-5 ml-2 opacity-60" />
                </div>
                <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={380}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="py-3.5 px-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-[#1A2A4F]">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        <style>{`
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Simples assim</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">Como funciona?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

            {PASSOS.map((p) => (
              <div key={p.num} className="text-center relative">
                <div className={`w-16 h-16 ${p.cor} rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-100 relative z-10`}>
                  <span className="text-white text-xl font-black">{p.num}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#1A2A4F]">{p.titulo}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1A2A4F] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Criar minha conta agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PÁGINA DE VENDAS ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Sua vitrine digital</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#1A2A4F] leading-tight">
              Sua própria página de vendas profissional
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Na ImobHub você ganha automaticamente uma landing page com seu nome, foto, contatos e
              imóveis organizados de forma elegante — pronto para captar novos clientes todos os dias.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Link exclusivo para compartilhar nas redes",
                "Layout limpo, responsivo e profissional",
                "Seus imóveis exibidos automaticamente",
                "Formulário para captar leads qualificados",
                "Zero configuração — tudo pronto em minutos!",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="#planos"
              className="mt-8 inline-flex items-center gap-2 bg-[#1A2A4F] text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Criar minha página agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl -rotate-2" />
            <Image
              src="/demo/capa.png"
              alt="Página de vendas do corretor"
              width={700}
              height={450}
              className="relative rounded-2xl shadow-2xl border border-white"
            />
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#1A2A4F] to-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, num: "500+", label: "Corretores ativos" },
            { icon: HomeIcon, num: "12.000+", label: "Imóveis publicados" },
            { icon: Star, num: "4.9★", label: "Avaliação média" },
            { icon: Zap, num: "< 2min", label: "Para publicar um imóvel" },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black">{s.num}</p>
              <p className="text-white/60 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTATO / FALE CONOSCO ─────────────────────────────────────────────── */}
      <section id="contato" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Fale Conosco</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">
              Ficou com alguma dúvida?
            </h2>
            <p className="mt-3 text-gray-500">
              Preencha o formulário abaixo e nossa equipe entrará em contato.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {contactStatus === "SUCCESS" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Mensagem Enviada!</h3>
                <p className="text-gray-500 mt-2">Em breve nossa equipe entrará em contato com você.</p>
                <button 
                  onClick={() => setContactStatus("IDLE")}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={contactForm.nome}
                      onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={contactForm.whatsapp}
                      onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    rows={4}
                    value={contactForm.mensagem}
                    onChange={(e) => setContactForm({ ...contactForm, mensagem: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Como podemos te ajudar?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactStatus === "SENDING"}
                  className="w-full bg-[#1A2A4F] text-white font-bold py-4 rounded-xl hover:bg-blue-900 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {contactStatus === "SENDING" ? "Enviando..." : "Enviar Mensagem"}
                  {!contactStatus && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── PLANOS ─────────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Preços</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">
              Escolha o plano ideal para você
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Comece gratuitamente. Evolua conforme sua carteira cresce. Sem surpresas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {PLANOS.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl p-7 flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  p.destaque
                    ? "bg-[#1A2A4F] text-white shadow-2xl shadow-blue-900/30 border-2 border-blue-400"
                    : "bg-white border border-gray-100 shadow-sm"
                }`}
              >
                {p.tag && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    p.destaque ? "bg-blue-400 text-white" : "bg-amber-400 text-white"
                  }`}>
                    {p.tag}
                  </div>
                )}

                <h3 className={`text-xl font-black ${p.destaque ? "text-white" : "text-[#1A2A4F]"}`}>{p.nome}</h3>

                <div className="mt-4 mb-6">
                  <span className={`text-4xl font-black ${p.destaque ? "text-white" : "text-[#1A2A4F]"}`}>{p.preco}</span>
                  <span className={`ml-1 text-sm ${p.destaque ? "text-white/60" : "text-gray-400"}`}>{p.periodo}</span>
                  {p.id === "expert" && (
                    <p className="text-xs text-blue-300 mt-1 font-medium">ou R$ 119,90/mês no plano anual</p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1">
                  {p.recursos.map((r) => (
                    <li key={r} className={`flex items-start gap-2 text-sm ${p.destaque ? "text-white/80" : "text-gray-600"}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${p.destaque ? "text-blue-300" : "text-green-500"}`} />
                      {r}
                    </li>
                  ))}
                </ul>

                {p.href ? (
                  <Link
                    href={p.href}
                    className={`mt-8 w-full py-3 rounded-xl font-bold text-sm text-center transition block ${
                      p.destaque
                        ? "bg-white text-[#1A2A4F] hover:bg-blue-50"
                        : "border-2 border-[#1A2A4F] text-[#1A2A4F] hover:bg-[#1A2A4F] hover:text-white"
                    }`}
                  >
                    {p.cta}
                  </Link>
                ) : (
                  <div className="mt-8 space-y-2">
                    <button
                      onClick={() => handleCheckout((process.env as Record<string, string>)[p.priceEnv!] ?? "")}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                        p.destaque
                          ? "bg-white text-[#1A2A4F] hover:bg-blue-50"
                          : "bg-[#1A2A4F] text-white hover:bg-blue-700"
                      }`}
                    >
                      {p.cta}
                    </button>
                    {p.id === "expert" && p.priceEnvAnual && (
                      <button
                        onClick={() => handleCheckout((process.env as Record<string, string>)[p.priceEnvAnual!] ?? "")}
                        className="w-full py-2.5 rounded-xl font-semibold text-xs border border-blue-400 text-blue-300 hover:bg-white/10 transition"
                      >
                        Assinar plano anual (–20%)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            Todos os planos incluem suporte, atualizações e sem taxa de adesão.
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Dúvidas</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#1A2A4F]">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#1A2A4F] to-[#1e3a8a] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            🎉 Comece hoje mesmo — é gratuito!
          </div>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight">
            Pronto para profissionalizar<br />sua carreira?
          </h2>
          <p className="mt-5 text-white/70 text-lg max-w-xl mx-auto">
            Junte-se a centenas de corretores que já usam a ImobHub para vender mais e se destacar no mercado.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-white text-[#1A2A4F] px-8 py-4 rounded-xl text-base font-bold hover:bg-blue-50 transition shadow-lg shadow-black/20"
            >
              Criar minha conta grátis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="text-white/60 hover:text-white text-sm transition">
              Já tenho uma conta →
            </Link>
          </div>
          <p className="mt-5 text-white/40 text-xs">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1f45] text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black text-white tracking-tight">
            Imob<span className="text-blue-400">Hub</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
            <Link href="/register" className="hover:text-white transition">Cadastrar</Link>
            <Link href="#planos" className="hover:text-white transition">Planos</Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ImobHub. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      {/* WhatsApp Flutuante */}
      <a
        href="https://wa.me/5511999999999" // TODO: Substituir pelo número real
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Fale conosco no WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.575 2.012.895 3.125.895 3.178 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.778-5.766-5.778zm0 0M12.061 17.5c-1.125 0-2.071-.345-2.909-.908l-.208-.139-1.921.503.513-1.872-.138-.218c-.463-.733-.705-1.488-.705-2.296-.001-2.43 1.975-4.406 4.406-4.406s4.406 1.975 4.406 4.406c0 2.43-1.975 4.406-4.406 4.406zm0 0m2.384-3.328c-.131-.066-.777-.384-.897-.428-.121-.044-.209-.066-.297.066-.087.132-.339.428-.416.517-.076.088-.153.099-.284.033-.131-.066-.554-.204-1.055-.65-.393-.35-.658-.783-.735-.914-.076-.132-.008-.203.057-.269.06-.059.132-.154.198-.231.066-.077.087-.132.131-.22.044-.088.022-.165-.011-.232-.033-.066-.297-.715-.407-.98-.107-.257-.215-.222-.297-.226l-.253-.005c-.087 0-.23.033-.351.165-.121.132-.462.451-.462 1.1s.473 1.276.539 1.365c.065.088 1.848 3.012 4.478 4.148 2.63 1.136 2.63.758 3.113.714.484-.044 1.034-.428 1.177-.841.143-.413.143-.768.1-.841-.043-.073-.164-.117-.295-.183zm0 0" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out">
          <span className="pl-3 pr-1 font-bold">Fale Conosco</span>
        </span>
      </a>
    </div>
  );
}
