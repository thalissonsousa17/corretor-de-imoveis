import { ReactElement, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiHome,
  FiCheckCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiPieChart,
  FiEye,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiPlusSquare,
  FiArrowRight,
  FiDollarSign,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Label,
} from "recharts";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";

interface Stats {
  total: number;
  disponiveis: number;
  vendidos: number;
  alugados?: number;
  inativos?: number;
}

interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  tipo: string;
  status: string;
}

interface Analytics {
  viewsMes: number;
  viewsTotal: number;
  viewsDiarias: { data: string; views: number }[];
  topImoveis: { imovelId: string; titulo: string; views: number }[];
}

interface Atividade {
  leadsNovos: number;
  visitasHoje: number;
  visitas7dias: number;
  contratosMes: number;
  ticketsAbertos: number;
}

interface ProximaVisita {
  id: string;
  dataHora: string;
  nomeVisitante: string;
  status: string;
  imovel: { id: string; titulo: string } | null;
}

interface LeadRecente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  imovelInteresse: string | null;
  createdAt: string;
}

const DONUT_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#d1d5db"];
const BAR_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#db2777"];

export default function DashboardCorretor() {
  const [stats, setStats] = useState<Stats>({ total: 0, disponiveis: 0, vendidos: 0 });
  const [imoveisRecentes, setImoveisRecentes] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<{ tipo: string; quantidade: number }[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ viewsMes: 0, viewsTotal: 0, viewsDiarias: [], topImoveis: [] });
  const [atividade, setAtividade] = useState<Atividade>({ leadsNovos: 0, visitasHoje: 0, visitas7dias: 0, contratosMes: 0, ticketsAbertos: 0 });
  const [proximasVisitas, setProximasVisitas] = useState<ProximaVisita[]>([]);
  const [leadsRecentes, setLeadsRecentes] = useState<LeadRecente[]>([]);
  const [leadsSemanais, setLeadsSemanais] = useState<{ semana: string; leads: number }[]>([]);
  const [visitasSemanais, setVisitasSemanais] = useState<{ semana: string; visitas: number }[]>([]);
  const [contratosPorMes, setContratosPorMes] = useState<{ mes: string; contratos: number }[]>([]);
  const [financeiroPorMes, setFinanceiroPorMes] = useState<{ mes: string; valor: number }[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get("/corretor/dashboard"),
          api.get("/corretor/analytics").catch(() => null),
        ]);
        setStats(dashRes.data.stats);
        setImoveisRecentes(dashRes.data.recentes);
        setBarData(dashRes.data.graficoTipos || []);
        setAtividade(dashRes.data.atividade || {});
        setProximasVisitas(dashRes.data.proximasVisitas || []);
        setLeadsRecentes(dashRes.data.leadsRecentes || []);
        setLeadsSemanais(dashRes.data.leadsSemanais || []);
        setVisitasSemanais(dashRes.data.visitasSemanais || []);
        setContratosPorMes(dashRes.data.contratosPorMes || []);
        setFinanceiroPorMes(dashRes.data.financeiroPorMes || []);
        if (analyticsRes) setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const pieData = [
    { name: "Disponíveis", value: stats.disponiveis },
    { name: "Vendidos", value: stats.vendidos },
    { name: "Alugados", value: stats.alugados || 0 },
    { name: "Inativos", value: stats.inativos || 0 },
  ];

  const totalFinanceiro = financeiroPorMes.reduce((s, d) => s + d.valor, 0);

  return (
    <CorretorLayout>
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Ações Rápidas ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/corretor/imoveis/cadastrar", icon: <FiPlusSquare />, label: "Cadastrar Imóvel", color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100" },
              { href: "/corretor/visitas", icon: <FiCalendar />, label: "Agendar Visita", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100" },
              { href: "/corretor/leads", icon: <FiUsers />, label: "Novo Lead", color: "text-violet-600 bg-violet-50 hover:bg-violet-100 border-violet-100" },
              { href: "/corretor/contratos", icon: <FiFileText />, label: "Novo Contrato", color: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${a.color}`}
              >
                <span className="text-lg">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>

          {/* ── Atividade Recente ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ActivityCard title="Leads novos" value={atividade.leadsNovos} icon={<FiUsers />} color="text-violet-600 bg-violet-100" href="/corretor/leads" />
            <ActivityCard title="Visitas hoje" value={atividade.visitasHoje} subtitle={`${atividade.visitas7dias} nos próx. 7 dias`} icon={<FiCalendar />} color="text-emerald-600 bg-emerald-100" href="/corretor/visitas" />
            <ActivityCard title="Contratos este mês" value={atividade.contratosMes} icon={<FiFileText />} color="text-amber-600 bg-amber-100" href="/corretor/contratos" />
            <ActivityCard title="Tickets abertos" value={atividade.ticketsAbertos} icon={<FiMessageSquare />} color="text-red-600 bg-red-100" href="/corretor/suporte" />
          </div>

          {/* ── Stats de Imóveis ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <DashboardCard title="Total de Imóveis" value={stats.total} icon={<FiHome />} />
            <DashboardCard title="Disponíveis" value={stats.disponiveis} icon={<FiCheckCircle />} />
            <DashboardCard title="Vendidos" value={stats.vendidos} icon={<FiShoppingBag />} />
            <DashboardCard title="Alugados" value={stats.alugados || 0} icon={<FiTrendingUp />} />
            <DashboardCard title="Inativos" value={stats.inativos || 0} icon={<FiTrendingUp />} />
          </div>

          {/* ── Engajamento (views) ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DashboardCard title="Views este mês" value={analytics.viewsMes} icon={<FiEye />} />
            <DashboardCard title="Views total" value={analytics.viewsTotal} icon={<FiEye />} />
          </div>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — SEÇÃO IMÓVEIS
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Imóveis" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Donut — distribuição */}
            <ChartCard title="Distribuição dos Imóveis" icon={<FiPieChart className="text-blue-500" />}>
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={74}
                    outerRadius={108}
                    dataKey="value"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                    <Label
                      content={({ viewBox }: any) => {
                        const { cx, cy } = viewBox;
                        return (
                          <g>
                            <text x={cx} y={cy - 10} textAnchor="middle" fill="#111827" fontSize={34} fontWeight="700">
                              {stats.total}
                            </text>
                            <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize={12}>
                              imóveis
                            </text>
                          </g>
                        );
                      }}
                    />
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Tipos — bar com cores */}
            <ChartCard title="Tipos de Imóveis" icon={<FiHome className="text-blue-500" />}>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={barData} barSize={38}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} name="Qtd.">
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — ANALYTICS (VIEWS)
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Analytics" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Views 30 dias — gradient area */}
            <ChartCard title="Views (últimos 30 dias)" icon={<FiEye className="text-cyan-500" />}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.viewsDiarias}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(v: string) => { const d = v.split("-"); return `${d[2]}/${d[1]}`; }}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(v: string) => { const d = v.split("-"); return `${d[2]}/${d[1]}/${d[0]}`; }} />
                  <Area type="monotone" dataKey="views" stroke="#0891b2" fill="url(#viewsGrad)" strokeWidth={2.5} name="Views" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Top imóveis — gradient progress bars */}
            <ChartCard title="Imóveis mais vistos" icon={<FiTrendingUp className="text-cyan-500" />} subtitle="este mês">
              {analytics.topImoveis.length > 0 ? (
                <div className="space-y-4 pt-1">
                  {analytics.topImoveis.map((item, i) => {
                    const pct = analytics.topImoveis[0]?.views
                      ? (item.views / analytics.topImoveis[0].views) * 100
                      : 0;
                    return (
                      <div key={item.imovelId} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate mb-1.5">{item.titulo}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-600 flex-shrink-0 w-8 text-right">{item.views}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-10">Nenhuma visualização registrada ainda.</p>
              )}
            </ChartCard>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — LEADS
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Leads" />
          <ChartCard
            title="Leads captados por semana"
            icon={<FiUsers className="text-violet-500" />}
            badge={`${atividade.leadsNovos} aguardando`}
            badgeColor="bg-violet-100 text-violet-700"
            link={{ href: "/corretor/leads", label: "Ver leads" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leadsSemanais}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ fill: "#7c3aed", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#7c3aed" }}
                  name="Leads"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — VISITAS
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Visitas" />
          <ChartCard
            title="Visitas agendadas por semana"
            icon={<FiCalendar className="text-emerald-500" />}
            badge={`${atividade.visitasHoje} hoje`}
            badgeColor="bg-emerald-100 text-emerald-700"
            link={{ href: "/corretor/visitas", label: "Ver visitas" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={visitasSemanais} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f0fdf4" }} />
                <Bar dataKey="visitas" radius={[6, 6, 0, 0]} fill="#059669" name="Visitas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — CONTRATOS
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Contratos" />
          <ChartCard
            title="Contratos fechados por mês"
            icon={<FiFileText className="text-amber-500" />}
            badge={`${atividade.contratosMes} este mês`}
            badgeColor="bg-amber-100 text-amber-700"
            link={{ href: "/corretor/contratos", label: "Ver contratos" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={contratosPorMes} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#fffbeb" }} />
                <Bar dataKey="contratos" radius={[6, 6, 0, 0]} fill="#d97706" name="Contratos" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ══════════════════════════════════════════════════════════════
              GRÁFICOS — FINANCEIRO
          ══════════════════════════════════════════════════════════════ */}
          <SectionLabel label="Financeiro" />
          <ChartCard
            title="Receita de comissões (últimos 6 meses)"
            icon={<FiDollarSign className="text-green-500" />}
            badge={totalFinanceiro > 0 ? `R$ ${totalFinanceiro.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} total` : undefined}
            badgeColor="bg-green-100 text-green-700"
            link={{ href: "/corretor/financeiro", label: "Ver financeiro" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={financeiroPorMes}>
                <defs>
                  <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Comissões",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#16a34a"
                  fill="url(#finGrad)"
                  strokeWidth={2.5}
                  name="Comissões"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ── Próximas Visitas + Leads ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FiCalendar className="text-emerald-500" /> Próximas Visitas
                </h3>
                <Link href="/corretor/visitas" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                  Ver todas <FiArrowRight size={12} />
                </Link>
              </div>
              {proximasVisitas.length > 0 ? (
                <div className="space-y-2.5">
                  {proximasVisitas.map((v) => {
                    const dt = new Date(v.dataHora);
                    return (
                      <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase leading-none">
                            {dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                          </span>
                          <span className="text-lg font-bold text-emerald-700 leading-none">{dt.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{v.nomeVisitante}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            {v.imovel && ` · ${v.imovel.titulo}`}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          v.status === "CONFIRMADA" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {v.status === "CONFIRMADA" ? "Confirmada" : "Agendada"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Nenhuma visita agendada.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FiUsers className="text-violet-500" /> Leads Aguardando Resposta
                </h3>
                <Link href="/corretor/leads" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                  Ver todos <FiArrowRight size={12} />
                </Link>
              </div>
              {leadsRecentes.length > 0 ? (
                <div className="space-y-2.5">
                  {leadsRecentes.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                      <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-sm font-bold text-violet-600">
                        {l.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{l.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{l.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Novo</span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum lead novo.</p>
              )}
            </div>
          </div>

          {/* ── Últimos Imóveis ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FiHome className="text-gray-500" /> Últimos imóveis cadastrados
              </h3>
              <Link href="/corretor/imoveis" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                Ver todos <FiArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Carregando...</p>
            ) : imoveisRecentes.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {imoveisRecentes.map((imovel) => (
                  <li key={imovel.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="mb-1 sm:mb-0">
                      <p className="font-medium text-gray-800 text-sm">{imovel.titulo}</p>
                      <p className="text-xs text-gray-500 capitalize">{imovel.tipo}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-900">
                        {imovel.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        imovel.status === "DISPONIVEL" ? "text-green-700 bg-green-100"
                          : imovel.status === "VENDIDO" ? "text-blue-700 bg-blue-100"
                          : imovel.status === "ALUGADO" ? "text-orange-700 bg-orange-100"
                          : "text-gray-600 bg-gray-100"
                      }`}>
                        {imovel.status === "DISPONIVEL" ? "Disponível"
                          : imovel.status === "VENDIDO" ? "Vendido"
                          : imovel.status === "ALUGADO" ? "Alugado"
                          : "Inativo"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum imóvel cadastrado ainda.</p>
            )}
          </div>

        </div>
      </div>
    </CorretorLayout>
  );
}

// ── Componentes auxiliares ───────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function ChartCard({
  title,
  icon,
  badge,
  badgeColor,
  subtitle,
  link,
  children,
}: {
  title: string;
  icon: ReactElement;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  link?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
          {subtitle && <span className="text-xs font-normal text-gray-400">{subtitle}</span>}
        </h3>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
          )}
          {link && (
            <Link href={link.href} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              {link.label} <FiArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function DashboardCard({ title, value, icon }: { title: string; value: number; icon: ReactElement }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-gray-500 font-medium">{title}</h3>
        <div className="text-lg text-gray-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1.5 group-hover:scale-105 transition-transform">
        {value}
      </p>
    </div>
  );
}

function ActivityCard({
  title,
  value,
  subtitle,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: ReactElement;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group block">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Link>
  );
}
