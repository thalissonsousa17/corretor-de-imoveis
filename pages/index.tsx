import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  Home as HomeIcon,
  BarChart2,
  Zap,
  Globe,
  ShieldCheck,
  Users,
  CheckCircle2,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageCircle,
  MousePointer2,
  Sparkles,
  Layout,
  Shield,
  Calendar,
} from "lucide-react";

// ─── Hook de Scroll Reveal (Otimizado para Performance) ───────────────────────
function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

interface RevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number;
  className?: string;
}

function Reveal({ children, direction = "up", delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const base =
    "transition-all duration-[1000ms] cubic-bezier(0.21, 1.02, 0.47, 0.98) transform-gpu";

  const hidden = {
    up: "opacity-0 translate-y-16",
    down: "opacity-0 -translate-y-16",
    left: "opacity-0 -translate-x-16",
    right: "opacity-0 translate-x-16",
    fade: "opacity-0 scale-95",
  };

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hidden[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Componente FAQ Premium ───────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`group border-b border-white/5 transition-all ${open ? "bg-white/[0.02]" : ""}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-6 text-left"
      >
        <span
          className={`text-lg font-medium transition-colors ${open ? "text-blue-400" : "text-slate-300 group-hover:text-white"}`}
        >
          {q}
        </span>
        <div
          className={`transition-transform duration-300 ${open ? "rotate-180 text-blue-400" : "text-slate-500"}`}
        >
          <ChevronDown size={20} />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-6 text-slate-400 leading-relaxed max-w-3xl">{a}</div>
      </div>
    </div>
  );
}

// ─── Dados (Preservados e Expandidos) ────────────────────────────────────────
const RECURSOS = [
  {
    icon: Layout, // Ícone de Layout/Design
    titulo: "Sua Vitrine Premium",
    desc: "Crie sua própria página de vendas de alta conversão em minutos. Um design de classe mundial para expor seus imóveis com exclusividade.",
    cor: "bg-cyan-500/10 text-cyan-400",
  },
  {
    icon: HomeIcon,
    titulo: "Patrimônio sob Gestão",
    desc: "Controle total do seu portfólio ativo, negócios fechados e locações em uma visão consolidada de ativos.",
    cor: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: FileText,
    titulo: "Gere contratos com IA",
    desc: "Transforme dados de fechamento em documentos jurídicos prontos em segundos, eliminando erros e burocracia manual.",
    cor: "bg-indigo-500/10 text-indigo-400",
  },
  {
    icon: Users,
    titulo: "Captação de Leads",
    desc: "Gestão de novas oportunidades e ações pendentes para garantir que nenhum lead fique sem resposta.",
    cor: "bg-violet-500/10 text-violet-400",
  },
  {
    icon: BarChart2,
    titulo: "Gestão de Conversões",
    desc: "Interface dedicada para acompanhar o desempenho de fechamentos mensais e taxas de sucesso comercial.",
    cor: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Calendar,
    titulo: "Cronograma de Tours",
    desc: "Agendamento dinâmico de visitas e organização da agenda do dia para otimizar sua rotina externa.",
    cor: "bg-amber-500/10 text-amber-400",
  },
];

const PLANOS = [
  {
    id: "gratuito",
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "para sempre",
    destaque: false,
    recursos: [
      "Até 5 imóveis",
      "Página pública básica",
      "Painel de gerenciamento",
      "Suporte via comunidade",
    ],
    cta: "Começar Agora",
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 79,90",
    periodo: "por mês",
    destaque: false,
    recursos: [
      "Até 50 imóveis",
      "Página personalizada",
      "Gerenciamento completo",
      "Contratos digitais",
    ],
    cta: "Assinar Pro",
  },
  {
    id: "start",
    nome: "Start AI",
    preco: "R$ 99,90",
    periodo: "por mês",
    destaque: false,
    tag: "Mais vendido",
    recursos: ["Até 100 imóveis", "Tudo do Pro", "Domínio personalizado", "IA de Copywriting"],
    cta: "Assinar Start",
  },
  {
    id: "expert",
    nome: "Expert",
    preco: "R$ 149,90",
    periodo: "por mês",
    destaque: true,
    tag: "Performance Máxima",
    recursos: [
      "Imóveis ilimitados",
      "Tudo do Start",
      "Suporte Premium 24/7",
      "Plano anual: R$ 119/mês",
    ],
    cta: "Seja Expert",
  },
];

const FAQS = [
  {
    q: "Preciso de conhecimento técnico para configurar?",
    a: "Absolutamente não. A ImobHub foi desenhada para ser intuitiva. Em menos de 2 minutos sua página está no ar.",
  },
  {
    q: "Como funciona a IA de contratos?",
    a: "Nossa IA analisa os dados do comprador e vendedor e preenche as cláusulas automaticamente seguindo a Lei do Inquilinato e o Código Civil.",
  },
  {
    q: "Posso usar meu próprio domínio (ex: www.seunome.com.br)?",
    a: "Sim! Nos planos Start e Expert você pode conectar seu domínio próprio para fortalecer sua marca pessoal.",
  },
  {
    q: "Existe fidelidade nos planos pagos?",
    a: "Não. Você pode cancelar ou alterar seu plano a qualquer momento diretamente pelo seu painel, sem multas ou burocracia.",
  },
];

// ─── Componente Principal ────────────────────────────────────────────────────
export default function LandingPagePremium() {
  const router = useRouter();
  const [emailHero, setEmailHero] = useState("");
  const [contactForm, setContactForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    mensagem: "",
  });
  const [contactStatus, setContactStatus] = useState<"IDLE" | "SENDING" | "SUCCESS" | "ERROR">(
    "IDLE"
  );

  // Handlers (Preservando sua lógica de API)
  async function handleCheckout(priceId: string) {
    if (!priceId) return;
    try {
      const res = await fetch("/api/stripe/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactStatus("SENDING");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactStatus(res.ok ? "SUCCESS" : "ERROR");
    } catch {
      setContactStatus("ERROR");
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
      <Head>
        <title>ImobHub • Plataforma Premium para Corretores de Elite</title>
        <meta
          name="description"
          content="A evolução da gestão imobiliária com inteligência artificial."
        />
      </Head>

      {/* ── NAVBAR PREMIUM ── */}
      <header className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-white flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HomeIcon size={18} className="text-white" />
            </div>
            IMOB<span className="text-blue-500">HUB</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide uppercase">
            <Link href="#recursos" className="hover:text-white transition">
              Recursos
            </Link>
            <Link href="#planos" className="hover:text-white transition">
              Planos
            </Link>
            <Link href="#faq" className="hover:text-white transition">
              Dúvidas
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold hover:text-white transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-500 hover:text-white transition shadow-xl shadow-white/5"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO SECTION ── */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -z-10 opacity-50" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto px-6 text-center">
            <Reveal direction="fade">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                <Sparkles size={14} className="animate-pulse" />
                Tecnologia para o Corretor 2.0
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-5xl md:text-[5.5rem] font-black text-white tracking-tight leading-[1] mb-8">
                Sua imobiliária agora é <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-slate-100 to-indigo-400">
                  digital e inteligente.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
                Abandone processos lentos. Crie sua vitrine profissional, gere contratos com IA e
                escaneie o mercado em busca de oportunidades em uma única plataforma.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push(`/register?email=${emailHero}`);
                }}
                className="relative max-w-lg mx-auto group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex bg-[#0F172A] rounded-xl p-2 border border-white/10">
                  <input
                    type="email"
                    required
                    placeholder="Seu e-mail profissional..."
                    className="bg-transparent px-5 py-3 outline-none text-white w-full"
                    value={emailHero}
                    onChange={(e) => setEmailHero(e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2">
                    Acessar <ArrowRight size={18} />
                  </button>
                </div>
              </form>
              <div className="mt-8 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> Sem cartão
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> Ativação em 1min
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── MOCKUP SECTION ── */}
        <section className="pb-32 px-6">
          <Reveal direction="up" delay={400} className="max-w-6xl mx-auto relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl rounded-[3rem] -z-10 group-hover:opacity-100 transition duration-1000 opacity-50" />
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-[#1E293B] rounded-t-xl p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                </div>
                <div className="bg-[#020617] px-4 py-1 rounded-md text-[10px] text-slate-500 font-mono">
                  imobhub.com/dashboard
                </div>
                <div className="w-10" />
              </div>
              <div className="aspect-[16/9] relative bg-[#020617] group-hover:bg-[#040a1f] transition-colors duration-700 flex items-center justify-center overflow-hidden">
                <Image
                  src="/demo/dashboard.svg"
                  alt="Interface ImobHub"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
                {/* Elementos flutuantes de UI */}
                <div className="absolute top-10 right-10 bg-blue-600/90 backdrop-blur p-4 rounded-xl border border-white/20 shadow-2xl animate-float">
                  <div className="text-[10px] uppercase font-bold text-blue-100 mb-1">
                    Novo Lead
                  </div>
                  <div className="text-sm font-bold text-white">Ricardo Oliveira</div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── RECURSOS ── */}
        <section id="recursos" className="py-32 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <Reveal direction="left">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                  Ferramentas para quem <br /> não aceita o comum.
                </h2>
              </Reveal>
              <Reveal direction="right" delay={200}>
                <p className="text-xl text-slate-400 leading-relaxed">
                  Desenvolvemos cada módulo pensando na jornada do corretor moderno. Menos
                  burocracia, mais fechamentos.
                </p>
              </Reveal>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {RECURSOS.map((r, i) => (
                <Reveal key={r.titulo} delay={i * 100} direction="up">
                  <div className="h-full p-10 rounded-[2.5rem] bg-[#0F172A] border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/5 blur-2xl rounded-full group-hover:bg-blue-600/10 transition-colors" />
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${r.cor} transition-transform group-hover:scale-110 duration-500`}
                    >
                      <r.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                      {r.titulo}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{r.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="planos" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                Investimento que se paga.
              </h2>
              <p className="text-slate-400 text-lg">
                Escolha o plano que acompanha o ritmo do seu crescimento.
              </p>
            </Reveal>

            <div className="grid lg:grid-cols-4 gap-6">
              {PLANOS.map((p, i) => (
                <Reveal key={p.id} delay={i * 100} direction="up">
                  <div
                    className={`
                    relative flex flex-col h-full p-8 rounded-[2rem] transition-all duration-500
                    ${
                      p.destaque
                        ? "bg-blue-600 text-white shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] scale-105 z-10"
                        : "bg-[#0F172A] border border-white/5 hover:border-white/20"
                    }
                  `}
                  >
                    {p.tag && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        {p.tag}
                      </div>
                    )}

                    <h3
                      className={`text-lg font-bold mb-1 ${p.destaque ? "text-white" : "text-white"}`}
                    >
                      {p.nome}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black tracking-tighter">{p.preco}</span>
                      <span className="text-xs opacity-60 font-medium">/{p.periodo}</span>
                    </div>

                    <ul className="space-y-4 flex-1 mb-10">
                      {p.recursos.map((rec) => (
                        <li key={rec} className="flex items-start gap-3 text-sm font-medium">
                          <CheckCircle2
                            size={16}
                            className={p.destaque ? "text-blue-200" : "text-blue-500"}
                          />
                          <span className={p.destaque ? "text-blue-50" : "text-slate-400"}>
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCheckout(p.id)}
                      className={`
                        w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                        ${
                          p.destaque
                            ? "bg-white text-blue-600 hover:bg-slate-100 shadow-xl"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        }
                      `}
                    >
                      {p.cta}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-32 bg-white/[0.01]">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal className="text-center mb-20">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
                Perguntas frequentes.
              </h2>
              <p className="text-slate-400">Tudo o que você precisa saber antes de assinar.</p>
            </Reveal>
            <div className="bg-[#0F172A] rounded-3xl border border-white/5 overflow-hidden">
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTATO ── */}
        <section id="contato" className="py-32">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
            <Reveal direction="left">
              <h2 className="text-5xl font-black text-white tracking-tighter mb-6">
                Alguma dúvida específica?
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Nossa equipe de especialistas está pronta para ajudar você a migrar sua carteira ou
                configurar sua nova página.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-white font-bold">WhatsApp Suporte</p>
                    <p className="text-sm text-slate-500">Resposta em até 15 minutos</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="bg-[#0F172A] p-10 rounded-[2.5rem] border border-white/5">
                {contactStatus === "SUCCESS" ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                    <p className="text-slate-400">Retornaremos em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <input
                        required
                        placeholder="Nome"
                        className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-white"
                        onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })}
                      />
                      <input
                        required
                        placeholder="WhatsApp"
                        className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-white"
                        onChange={(e) =>
                          setContactForm({ ...contactForm, whatsapp: e.target.value })
                        }
                      />
                    </div>
                    <input
                      required
                      type="email"
                      placeholder="E-mail profissional"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-white"
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                    <textarea
                      rows={4}
                      placeholder="Como podemos ajudar?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-white"
                      onChange={(e) => setContactForm({ ...contactForm, mensagem: e.target.value })}
                    />
                    <button
                      disabled={contactStatus === "SENDING"}
                      className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-xl font-bold text-white transition disabled:opacity-50"
                    >
                      {contactStatus === "SENDING" ? "Enviando..." : "Enviar Mensagem"}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#020617] relative overflow-hidden">
        {/* Glow de fundo para profundidade */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal direction="down">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-10">
              🚀 Comece hoje mesmo — é gratuito
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tighter">
              Pronto para profissionalizar
              <br />
              sua carreira?
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de corretores que já usam o{" "}
              <span className="text-white font-bold">ImobHub</span> para gerir ativos e fechar
              negócios com inteligência.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/register"
                className="group flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95"
              >
                Criar minha conta grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="text-slate-500 hover:text-white font-bold text-sm transition-colors tracking-widest uppercase"
              >
                Já tenho uma conta →
              </Link>
            </div>
            <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER RESTAURADO ─────────────────────────────────────────────────── */}
      <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <Link
              href="/"
              className="text-2xl font-black text-white tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <HomeIcon size={18} />
              </div>
              IMOB<span className="text-blue-500">HUB.</span>
            </Link>

            <div className="flex flex-wrap justify-center items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/login" className="hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Cadastrar
              </Link>
              <Link href="#portfolio" className="hover:text-white transition-colors">
                Recursos
              </Link>
              <Link
                href="mailto:thallisson.sousa17@gmail.com"
                className="hover:text-white transition-colors"
              >
                Suporte
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-4">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} IMOBHUB S.A. • MADE FOR THE TOP 1%
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Flutuante Estilizado */}
      <a
        href="https://wa.me/5583994044852"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl shadow-[#25D366]/20 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.575 2.012.895 3.125.895 3.178 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.778-5.766-5.778zm0 0M12.061 17.5c-1.125 0-2.071-.345-2.909-.908l-.208-.139-1.921.503.513-1.872-.138-.218c-.463-.733-.705-1.488-.705-2.296-.001-2.43 1.975-4.406 4.406-4.406s4.406 1.975 4.406 4.406c0 2.43-1.975 4.406-4.406 4.406zm0 0" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out">
          <span className="pl-3 pr-1 font-black text-xs uppercase tracking-widest">
            Fale Conosco
          </span>
        </span>
      </a>

      {/* ── ESTILOS ADICIONAIS ── */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
