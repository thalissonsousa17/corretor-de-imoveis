import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  Home,
  TrendingUp 
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface AdminStats {
  totalCorretores: number;
  planosAtivos: number;
  receita: number;
  totalImoveis: number;
  breakdown: { pro: number; start: number; expert: number };
  recentes: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    profile: { plano: string; planoStatus: string } | null;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A2A4F]"></div>
        </div>
      </AdminLayout>
    );
  }

  const chartData = stats
    ? [
        { name: "Start", value: stats.breakdown.start },
        { name: "Pro", value: stats.breakdown.pro },
        { name: "Expert", value: stats.breakdown.expert },
      ].filter((d) => d.value > 0)
    : [];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

  return (
    <AdminLayout>
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Corretores"
          value={stats?.totalCorretores || 0}
          icon={<Users size={22} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Planos Ativos"
          value={stats?.planosAtivos || 0}
          icon={<CheckCircle size={22} />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Imóveis"
          value={stats?.totalImoveis || 0}
          icon={<Home size={22} />}
          color="bg-purple-500"
        />
        <StatCard
          title="Receita Mensal (Est.)"
          value={stats?.receita || 0}
          isCurrency
          icon={<DollarSign size={22} />}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Planos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Distribuição de Planos
          </h3>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(Number(percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sem planos ativos para exibir
              </div>
            )}
          </div>
        </div>

        {/* Últimos Cadastros */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-4">
            Últimos Cadastros
          </h3>
          {stats?.recentes && stats.recentes.length > 0 ? (
            <div className="space-y-3">
              {stats.recentes.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.profile?.planoStatus === "ATIVO"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.profile?.plano || "GRATUITO"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhum cadastro recente.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  isCurrency = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium">{title}</p>
        <h4 className="text-xl font-bold text-gray-800 mt-0.5">
          {isCurrency
            ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : value}
        </h4>
      </div>
    </div>
  );
}
