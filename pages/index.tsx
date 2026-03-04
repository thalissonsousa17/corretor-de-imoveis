import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  Home as HomeIcon,
  BarChart2,
  FileText,
  Users,
  Calendar,
  Layout,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Sparkles,
} from "lucide-react";

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

interface RevealProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "fade";
  delay?: number;
  className?: string;
}
function Reveal({ children, direction = "up", delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const hidden = {
    up: "opacity-0 translate-y-12",
    left: "opacity-0 -translate-x-10",
    right: "opacity-0 translate-x-10",
    fade: "opacity-0 scale-[0.97]",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out transform-gpu ${visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hidden[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-[#1a1a2e] transition-all ${open ? "bg-white/[0.015]" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-7 text-left group"
      >
        <span className={`font-medium text-base tracking-tight transition-colors ${open ? "text-[#c9a84c]" : "text-slate-300 group-hover:text-white"}`}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`transition-all duration-300 flex-shrink-0 ml-4 ${open ? "rotate-180 text-[#c9a84c]" : "text-slate-600"}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-8 pb-7 text-slate-500 leading-relaxed text-sm">{a}</p>
      </div>
    </div>
  );
}

// ─── Dados ────────────────────────────────────────────────────────────────────
const RECURSOS = [
  { icon: Layout, titulo: "Vitrine Premium", desc: "Página de vendas de alta conversão. Design de classe mundial para expor seus imóveis com exclusividade e autoridade.", num: "01" },
  { icon: HomeIcon, titulo: "Patrimônio sob Gestão", desc: "Controle total do seu portfólio ativo, negócios fechados e locações em uma visão consolidada.", num: "02" },
  { icon: FileText, titulo: "Contratos com IA", desc: "Transforme dados de fechamento em documentos jurídicos prontos em segundos, sem erros.", num: "03" },
  { icon: Users, titulo: "Captação de Leads", desc: "Gestão de oportunidades para garantir que nenhum lead fique sem resposta.", num: "04" },
  { icon: BarChart2, titulo: "Gestão de Conversões", desc: "Acompanhe fechamentos mensais e taxas de sucesso com dashboards inteligentes.", num: "05" },
  { icon: Calendar, titulo: "Cronograma de Tours", desc: "Agendamento dinâmico de visitas e organização da agenda para otimizar sua rotina.", num: "06" },
];

const PLANOS = [
  {
    id: "gratuito", stripeId: null, nome: "Gratuito", preco: "R$ 0", periodo: "para sempre",
    destaque: false, tag: null,
    recursos: ["Até 5 imóveis cadastrados", "1 Lead, 1 Visita, 1 Contrato", "Página pública", "Painel de gerenciamento", "Suporte via comunidade"],
    cta: "Começar Agora",
  },
  {
    id: "pro", stripeId: process.env.NEXT_PUBLIC_PRICE_PRO, nome: "Pro", preco: "R$ 79,90", periodo: "por mês",
    destaque: false, tag: null,
    recursos: ["Até 50 imóveis", "Leads / CRM ilimitados", "Visitas ilimitadas", "Contratos digitais ilimitados", "Relatório financeiro", "Página personalizada"],
    cta: "Assinar Pro",
  },
  {
    id: "start", stripeId: process.env.NEXT_PUBLIC_PRICE_START, nome: "Start AI", preco: "R$ 99,90", periodo: "por mês",
    destaque: false, tag: "Mais vendido",
    recursos: ["Até 100 imóveis", "Tudo do Pro", "Domínio personalizado", "IA para contratos e copy"],
    cta: "Assinar Start",
  },
  {
    id: "expert", stripeId: process.env.NEXT_PUBLIC_PRICE_EXPERT, nome: "Expert", preco: "R$ 149,90", periodo: "por mês",
    destaque: true, tag: "Performance Máxima",
    recursos: ["Imóveis ilimitados", "Tudo do Start AI", "Suporte Premium 24/7", "Plano anual: R$ 119/mês"],
    cta: "Seja Expert",
  },
];

const FAQS = [
  { q: "Preciso de conhecimento técnico para configurar?", a: "Absolutamente não. A ImobHub foi desenhada para ser intuitiva. Em menos de 2 minutos sua página está no ar." },
  { q: "Como funciona a IA de contratos?", a: "Nossa IA analisa os dados do comprador e vendedor e preenche as cláusulas automaticamente seguindo a Lei do Inquilinato e o Código Civil." },
  { q: "Posso usar meu próprio domínio (ex: www.seunome.com.br)?", a: "Sim! Nos planos Start e Expert você pode conectar seu domínio próprio para fortalecer sua marca pessoal." },
  { q: "Existe fidelidade nos planos pagos?", a: "Não. Você pode cancelar ou alterar seu plano a qualquer momento diretamente pelo seu painel, sem multas ou burocracia." },
];

const STATS = [
  { valor: "2min", label: "Para sua página ir ao ar" },
  { valor: "100%", label: "Digital e automatizado" },
  { valor: "Top 1%", label: "Dos corretores do Brasil" },
];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [emailHero, setEmailHero] = useState("");
  const [contactForm, setContactForm] = useState({ nome: "", email: "", whatsapp: "", mensagem: "" });
  const [contactStatus, setContactStatus] = useState<"IDLE" | "SENDING" | "SUCCESS" | "ERROR">("IDLE");
  const [scrolled, setScrolled] = useState(false);
  // Light theme CSS variables injected via global style below

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    } catch (err) { console.error(err); }
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
    } catch { setContactStatus("ERROR"); }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#5a5650] selection:bg-[#c9a84c]/20 selection:text-[#b8912a]">
      <Head>
        <title>ImobHub • Plataforma Premium para Corretores de Elite</title>
        <meta name="description" content="A evolução da gestão imobiliária com inteligência artificial." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "bg-[#fafaf8]/95 backdrop-blur-xl border-b border-[#e8e4dc] shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-[#b8912a] flex items-center justify-center transition-transform group-hover:scale-95">
              <HomeIcon size={17} className="text-white" />
            </div>
            <span className="font-['Cormorant_Garamond'] text-xl font-600 tracking-[0.15em] text-[#1a1814] uppercase">
              Imob<span className="text-[#b8912a]">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9c9890]">
            <Link href="#recursos" className="hover:text-[#b8912a] transition-colors">Recursos</Link>
            <Link href="#planos" className="hover:text-[#b8912a] transition-colors">Planos</Link>
            <Link href="#faq" className="hover:text-[#b8912a] transition-colors">Dúvidas</Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link href="/login" className="hidden sm:block text-[11px] font-bold tracking-[0.18em] uppercase text-[#9c9890] hover:text-[#1a1814] transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="bg-[#b8912a] text-white px-6 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase hover:bg-[#d4aa4a] transition-all hover:-translate-y-0.5 shadow-sm">
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'linear-gradient(#e8e4dc 1px, transparent 1px), linear-gradient(90deg, #e8e4dc 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#b8912a]/[0.06] blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 text-center pt-32 pb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 border border-[#b8912a]/30 bg-[#f5edd8] px-5 py-2.5 mb-12 animate-[fadeUp_0.8s_ease_forwards]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b8912a] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#b8912a]">
                Tecnologia para o Corretor 2.0
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Cormorant_Garamond'] font-300 text-[clamp(48px,8vw,96px)] leading-[1.0] text-[#1a1814] mb-8 tracking-[-0.02em] animate-[fadeUp_0.9s_0.1s_ease_both]">
              Sua imobiliária agora é<br />
              <em className="text-[#b8912a] not-italic">digital e inteligente.</em>
            </h1>

            {/* Sub */}
            <p className="max-w-xl mx-auto text-[#5a5650] text-lg font-light leading-relaxed mb-14 animate-[fadeUp_1s_0.2s_ease_both] opacity-0" style={{ animationFillMode: 'forwards' }}>
              Abandone processos lentos. Crie sua vitrine profissional, gere contratos com IA e feche mais negócios — em uma única plataforma.
            </p>

            {/* CTA Form */}
            <div className="animate-[fadeUp_1s_0.35s_ease_both] opacity-0 max-w-md mx-auto" style={{ animationFillMode: 'forwards' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); router.push(`/register?email=${emailHero}`); }}
                className="flex border border-[#e8e4dc] bg-white shadow-sm"
              >
                <input
                  type="email" required placeholder="Seu e-mail profissional"
                  className="bg-transparent px-5 py-4 outline-none text-[#1a1814] text-sm w-full placeholder:text-[#c8c4bc] font-light"
                  value={emailHero} onChange={(e) => setEmailHero(e.target.value)}
                />
                <button className="bg-[#b8912a] hover:bg-[#d4aa4a] text-white px-7 py-4 font-bold text-[11px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors flex items-center gap-2">
                  Acessar <ArrowRight size={15} />
                </button>
              </form>
              <div className="flex justify-center gap-8 mt-5 text-[11px] text-[#9c9890] font-medium tracking-wide">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#b8912a]" /> Sem cartão</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#b8912a]" /> Ativação em 1min</span>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#e8e4dc] bg-white">
            <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-[#e8e4dc]">
              {STATS.map((s) => (
                <div key={s.label} className="px-8 text-center">
                  <div className="font-['Cormorant_Garamond'] text-2xl font-400 text-[#b8912a]">{s.valor}</div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#9c9890] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MOCKUP ── */}
        <section className="py-32 px-6">
          <Reveal direction="up" className="max-w-6xl mx-auto">
            <div className="relative group">
              {/* Glow */}
              <div className="absolute -inset-px bg-gradient-to-r from-[#c9a84c]/20 via-transparent to-[#c9a84c]/10 opacity-0 group-hover:opacity-100 transition duration-700 blur-sm" />
              <div className="border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-[#0d0d1a] px-5 py-4 flex items-center justify-between border-b border-white/[0.05]">
                  <div className="flex gap-2">
                    {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                      <div key={c} className="w-3 h-3 rounded-full opacity-40" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1 mx-6 max-w-xs">
                    <div className="bg-white/[0.04] border border-white/[0.06] px-4 py-1.5 text-center text-[11px] text-slate-600 font-mono">
                      imobhub.com/dashboard
                    </div>
                  </div>
                  <div className="w-16" />
                </div>
                {/* Screen */}
                <div className="aspect-[16/9] relative bg-[#06060f] overflow-hidden flex items-center justify-center">
                  <Image
                    src="/demo/dashboard.svg"
                    alt="Interface ImobHub"
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700"
                  />
                  {/* Floating card */}
                  <div className="absolute top-8 right-10 bg-[#0d0d1a]/90 backdrop-blur border border-[#c9a84c]/20 px-5 py-4 shadow-2xl animate-[float_5s_ease-in-out_infinite]">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]/70 mb-1">Novo Lead</div>
                    <div className="text-sm font-semibold text-white">Ricardo Oliveira</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">há 2 minutos</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── RECURSOS ── */}
        <section id="recursos" className="py-32 relative">
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#c9a84c]/10 to-transparent" />

          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="max-w-3xl mb-24">
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-5">Plataforma Completa</p>
                <h2 className="font-['Cormorant_Garamond'] font-300 text-[clamp(40px,6vw,72px)] text-white leading-[1.05] tracking-tight">
                  Ferramentas para quem<br /><em className="text-[#c9a84c]">não aceita o comum.</em>
                </h2>
              </Reveal>
              <Reveal delay={150}>
                <p className="mt-6 text-slate-500 text-lg font-light leading-relaxed max-w-xl">
                  Desenvolvemos cada módulo pensando na jornada do corretor moderno. Menos burocracia, mais fechamentos.
                </p>
              </Reveal>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
              {RECURSOS.map((r, i) => (
                <Reveal key={r.titulo} delay={i * 80} direction="up">
                  <div className="bg-[#06060f] p-10 group hover:bg-[#0d0d1a] transition-colors duration-500 relative overflow-hidden h-full">
                    {/* Number */}
                    <div className="font-['Cormorant_Garamond'] text-6xl font-300 text-white/[0.03] absolute top-4 right-6 leading-none select-none group-hover:text-[#c9a84c]/[0.07] transition-colors duration-500">
                      {r.num}
                    </div>
                    {/* Icon */}
                    <div className="w-12 h-12 border border-[#c9a84c]/20 flex items-center justify-center mb-7 group-hover:border-[#c9a84c]/50 transition-colors">
                      <r.icon size={22} className="text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold mb-3 tracking-tight">{r.titulo}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-light">{r.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVISOR EDITORIAL ── */}
        <section className="py-24 overflow-hidden border-y border-white/[0.04]">
          <div className="flex items-center gap-0 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="font-['Cormorant_Garamond'] text-6xl font-300 text-white/[0.04] pr-16 tracking-tight flex-shrink-0">
                Vitrine Premium &nbsp;•&nbsp; Contratos com IA &nbsp;•&nbsp; Gestão de Leads &nbsp;•&nbsp; Top 1%
              </span>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="planos" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="mb-20">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-5">Planos e Preços</p>
              <h2 className="font-['Cormorant_Garamond'] font-300 text-[clamp(40px,6vw,72px)] text-white leading-tight tracking-tight">
                Investimento que se paga.
              </h2>
              <p className="text-slate-500 text-lg font-light mt-4 max-w-md">
                Escolha o plano que acompanha o ritmo do seu crescimento.
              </p>
            </Reveal>

            <div className="grid lg:grid-cols-4 gap-px bg-white/[0.04]">
              {PLANOS.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <div className={`relative flex flex-col h-full p-8 transition-all duration-500 group ${p.destaque ? "bg-[#c9a84c]" : "bg-[#06060f] hover:bg-[#0d0d1a]"}`}>
                    {p.tag && (
                      <div className={`absolute -top-3.5 left-8 text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 ${p.destaque ? "bg-[#06060f] text-[#c9a84c]" : "bg-[#c9a84c] text-[#06060f]"}`}>
                        {p.tag}
                      </div>
                    )}

                    <div className={`text-xs font-bold tracking-[0.2em] uppercase mb-6 ${p.destaque ? "text-[#06060f]/60" : "text-slate-600"}`}>
                      {p.nome}
                    </div>

                    <div className="mb-8">
                      <span className={`font-['Cormorant_Garamond'] text-5xl font-400 tracking-tight ${p.destaque ? "text-[#06060f]" : "text-white"}`}>
                        {p.preco}
                      </span>
                      <span className={`text-xs ml-1 ${p.destaque ? "text-[#06060f]/50" : "text-slate-600"}`}>
                        /{p.periodo}
                      </span>
                    </div>

                    <ul className="space-y-3.5 flex-1 mb-10">
                      {p.recursos.map((rec) => (
                        <li key={rec} className="flex items-start gap-3 text-sm font-light">
                          <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${p.destaque ? "text-[#06060f]/50" : "text-[#c9a84c]/70"}`} />
                          <span className={p.destaque ? "text-[#06060f]/80" : "text-slate-400"}>{rec}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => p.stripeId ? handleCheckout(p.stripeId) : router.push("/register")}
                      className={`w-full py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all ${
                        p.destaque
                          ? "bg-[#06060f] text-[#c9a84c] hover:bg-[#0d0d1a]"
                          : "border border-white/10 text-white hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                      }`}
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
        <section id="faq" className="py-32 border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal className="mb-16">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-5">Dúvidas Frequentes</p>
              <h2 className="font-['Cormorant_Garamond'] font-300 text-[clamp(36px,5vw,60px)] text-white tracking-tight">
                Perguntas frequentes.
              </h2>
            </Reveal>
            <div className="border border-white/[0.06]">
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTATO ── */}
        <section id="contato" className="py-32 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-start">
            <Reveal direction="left">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-5">Contato</p>
              <h2 className="font-['Cormorant_Garamond'] font-300 text-[clamp(36px,5vw,64px)] text-white leading-tight tracking-tight mb-6">
                Alguma dúvida<br /><em className="text-[#c9a84c]">específica?</em>
              </h2>
              <p className="text-slate-500 font-light leading-relaxed mb-10 max-w-sm">
                Nossa equipe está pronta para ajudar você a migrar sua carteira ou configurar sua nova página.
              </p>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-[#c9a84c]/20 flex items-center justify-center group-hover:border-[#c9a84c]/50 transition-colors">
                  <MessageCircle size={20} className="text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">WhatsApp Suporte</p>
                  <p className="text-xs text-slate-600 mt-0.5">Resposta em até 15 minutos</p>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={150}>
              {contactStatus === "SUCCESS" ? (
                <div className="border border-white/[0.06] p-12 text-center">
                  <CheckCircle2 size={36} className="text-[#c9a84c] mx-auto mb-5" />
                  <h3 className="font-['Cormorant_Garamond'] text-3xl font-300 text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-slate-500 text-sm">Retornaremos em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Nome" onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })}
                      className="bg-transparent border border-white/[0.07] px-5 py-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-[#c9a84c]/40 transition-colors font-light" />
                    <input required placeholder="WhatsApp" onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                      className="bg-transparent border border-white/[0.07] px-5 py-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-[#c9a84c]/40 transition-colors font-light" />
                  </div>
                  <input required type="email" placeholder="E-mail profissional" onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-transparent border border-white/[0.07] px-5 py-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-[#c9a84c]/40 transition-colors font-light" />
                  <textarea rows={4} placeholder="Como podemos ajudar?" onChange={(e) => setContactForm({ ...contactForm, mensagem: e.target.value })}
                    className="w-full bg-transparent border border-white/[0.07] px-5 py-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-[#c9a84c]/40 transition-colors resize-none font-light" />
                  <button disabled={contactStatus === "SENDING"}
                    className="w-full bg-[#c9a84c] hover:bg-[#e2c06a] text-[#06060f] py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-50">
                    {contactStatus === "SENDING" ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── CTA FINAL ── */}
      <section className="py-40 relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=60')] bg-cover bg-center opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#c9a84c]/[0.05] blur-[120px] rounded-full" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 border border-[#c9a84c]/20 px-5 py-2 mb-10">
              <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#c9a84c]/70">Comece hoje — é gratuito</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-['Cormorant_Garamond'] font-300 text-[clamp(44px,7vw,88px)] text-white leading-[1.0] tracking-tight mb-6">
              Pronto para profissionalizar<br /><em className="text-[#c9a84c]">sua carreira?</em>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-slate-500 text-lg font-light max-w-xl mx-auto leading-relaxed mb-14">
              Junte-se a centenas de corretores que já usam o ImobHub para gerir ativos e fechar negócios com inteligência.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/register"
                className="group flex items-center gap-3 bg-[#c9a84c] hover:bg-[#e2c06a] text-[#06060f] px-10 py-5 font-bold text-[11px] tracking-[0.25em] uppercase transition-all hover:-translate-y-0.5 shadow-2xl shadow-[#c9a84c]/10">
                Criar minha conta grátis
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-white font-bold text-[11px] transition-colors tracking-[0.2em] uppercase">
                Já tenho uma conta →
              </Link>
            </div>
            <p className="mt-8 text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] py-14">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center">
              <HomeIcon size={15} className="text-[#06060f]" />
            </div>
            <span className="font-['Cormorant_Garamond'] text-lg font-400 tracking-[0.15em] uppercase text-white">
              Imob<span className="text-[#c9a84c]">Hub</span>
            </span>
          </Link>

          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <Link href="/login" className="hover:text-[#c9a84c] transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-[#c9a84c] transition-colors">Cadastrar</Link>
            <Link href="#recursos" className="hover:text-[#c9a84c] transition-colors">Recursos</Link>
            <Link href="mailto:thallisson.sousa17@gmail.com" className="hover:text-[#c9a84c] transition-colors">Suporte</Link>
          </div>

          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} IMOBHUB S.A.
          </p>
        </div>
      </footer>

      {/* WhatsApp */}
      <a href="https://wa.me/5583994044852" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 shadow-2xl shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.575 2.012.895 3.125.895 3.178 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.778-5.766-5.778zm0 0" />
        </svg>
      </a>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}