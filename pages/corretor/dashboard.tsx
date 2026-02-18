import { ReactElement, useEffect, useState } from "react";
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
  PieLabelRenderProps,
  AreaChart,
  Area,
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

export default function DashboardCorretor() {
  const [stats, setStats] = useState<Stats>({ total: 0, disponiveis: 0, vendidos: 0 });
  const [imoveisRecentes, setImoveisRecentes] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<{ tipo: string; quantidade: number }[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ viewsMes: 0, viewsTotal: 0, viewsDiarias: [], topImoveis: [] });
  const [atividade, setAtividade] = useState<Atividade>({ leadsNovos: 0, visitasHoje: 0, visitas7dias: 0, contratosMes: 0, ticketsAbertos: 0 });
  const [proximasVisitas, setProximasVisitas] = useState<ProximaVisita[]>([]);
  const [leadsRecentes, setLeadsRecentes] = useState<LeadRecente[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get("/corretor/dashboard", { withCredentials: true }),
          api.get("/corretor/analytics").catch(() => null),
        ]);
        setStats(dashRes.data.stats);
        setImoveisRecentes(dashRes.data.recentes);
        setBarData(dashRes.data.graficoTipos || []);
        setAtividade(dashRes.data.atividade || {});
        setProximasVisitas(dashRes.data.proximasVisitas || []);
        setLeadsRecentes(dashRes.data.leadsRecentes || []);
        if (analyticsRes) {
          setAnalytics(analyticsRes.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#d1d5db"];

  const pieData = [
    { name: "Disponíveis", value: stats.disponiveis },
    { name: "Vendidos", value: stats.vendidos },
    { name: "Alugados", value: stats.alugados || 0 },
    { name: "Inativos", value: stats.inativos },
  ];

  const renderPieLabel = ({ name, percent }: PieLabelRenderProps) => {
    const safePercent = typeof percent === "number" && !isNaN(percent) ? percent : 0;
    const safeName = name ?? "";
    return `${safeName} ${(safePercent * 100).toFixed(0)}%`;
  };

  return (
    <CorretorLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
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

          {/* ── Atividade Recente (4 cards) ────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ActivityCard
              title="Leads novos"
              value={atividade.leadsNovos}
              icon={<FiUsers />}
              color="text-violet-600 bg-violet-100"
              href="/corretor/leads"
            />
            <ActivityCard
              title="Visitas hoje"
              value={atividade.visitasHoje}
              subtitle={`${atividade.visitas7dias} nos próx. 7 dias`}
              icon={<FiCalendar />}
              color="text-emerald-600 bg-emerald-100"
              href="/corretor/visitas"
            />
            <ActivityCard
              title="Contratos este mês"
              value={atividade.contratosMes}
              icon={<FiFileText />}
              color="text-amber-600 bg-amber-100"
              href="/corretor/contratos"
            />
            <ActivityCard
              title="Tickets abertos"
              value={atividade.ticketsAbertos}
              icon={<FiMessageSquare />}
              color="text-red-600 bg-red-100"
              href="/corretor/suporte"
            />
          </div>

          {/* ── Stats de Imóveis ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <DashboardCard title="Total de Imóveis" value={stats.total} icon={<FiHome />} />
            <DashboardCard title="Disponíveis" value={stats.disponiveis} icon={<FiCheckCircle />} />
            <DashboardCard title="Vendidos" value={stats.vendidos} icon={<FiShoppingBag />} />
            <DashboardCard title="Alugados" value={stats.alugados || 0} icon={<FiTrendingUp />} />
            <DashboardCard title="Inativos" value={stats.inativos || 0} icon={<FiTrendingUp />} />
          </div>

          {/* ── Próximas Visitas + Leads Novos ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximas Visitas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
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
                      <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-lg flex flex-col items-center justify-center">
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
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          v.status === "CONFIRMADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
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

            {/* Leads que precisam de atenção */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
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
                    <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition">
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

          {/* ── Gráficos Imóveis ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiPieChart className="text-blue-500" /> Distribuição dos imóveis
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Legend />
                  <Pie data={pieData} labelLine={false} outerRadius={95} dataKey="value" label={renderPieLabel}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> Tipos de imóveis cadastrados
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Engajamento ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DashboardCard title="Views este mês" value={analytics.viewsMes} icon={<FiEye />} />
            <DashboardCard title="Views total" value={analytics.viewsTotal} icon={<FiEye />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiEye className="text-blue-500" /> Views (últimos 30 dias)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.viewsDiarias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(v: string) => { const d = v.split("-"); return `${d[2]}/${d[1]}`; }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(v: string) => { const d = v.split("-"); return `${d[2]}/${d[1]}/${d[0]}`; }} />
                  <Area type="monotone" dataKey="views" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> Imóveis mais vistos (este mês)
              </h3>
              {analytics.topImoveis.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topImoveis.map((item, i) => (
                    <div key={item.imovelId} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.titulo}</p>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${analytics.topImoveis[0]?.views ? (item.views / analytics.topImoveis[0].views) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{item.views}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Nenhuma visualização registrada ainda.</p>
              )}
            </div>
          </div>

          {/* ── Últimos Imóveis ────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
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
                      <p className="text-sm font-medium text-gray-700">
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

// ── Componentes auxiliares ──────────────────────────────────────────────────────

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
