// pages/corretor/dashboard.tsx
import { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import { FiHome, FiCheckCircle, FiShoppingBag, FiTrendingUp, FiPieChart } from "react-icons/fi";
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

export default function DashboardCorretor() {
  const [stats, setStats] = useState<Stats>({ total: 0, disponiveis: 0, vendidos: 0 });
  const [imoveisRecentes, setImoveisRecentes] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<{ tipo: string; quantidade: number }[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/corretor/dashboard", { withCredentials: true });
        setStats(res.data.stats);
        setImoveisRecentes(res.data.recentes);
        setBarData(res.data.graficoTipos || []);
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            🏡 Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Bem-vindo(a)! Aqui você vê um resumo dos seus imóveis e atividades recentes.
          </p>

          {/* === Estatísticas === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <DashboardCard
              title="Total de Imóveis"
              value={stats.total}
              icon={<FiHome className="text-gray-500" />}
            />
            <DashboardCard
              title="Disponíveis"
              value={stats.disponiveis}
              icon={<FiCheckCircle className="text-green-600" />}
            />
            <DashboardCard
              title="Vendidos"
              value={stats.vendidos}
              icon={<FiShoppingBag className="text-blue-600" />}
            />
            <DashboardCard
              title="Alugados"
              value={stats.alugados || 0}
              icon={<FiTrendingUp className="text-orange-500" />}
            />
            <DashboardCard
              title="Inativos"
              value={stats.inativos || 0}
              icon={<FiTrendingUp className="text-orange-500" />}
            />
          </div>

          {/* === Gráficos === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Pizza */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiPieChart /> Distribuição dos imóveis
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Legend />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderPieLabel}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Barras */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiTrendingUp /> Tipos de imóveis cadastrados
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Últimos imóveis === */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Últimos imóveis cadastrados
            </h2>

            {loading ? (
              <p className="text-gray-500 text-sm">Carregando imóveis...</p>
            ) : imoveisRecentes.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {imoveisRecentes.map((imovel) => (
                  <li key={imovel.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{imovel.titulo}</p>
                      <p className="text-xs text-gray-500 capitalize">{imovel.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700">
                        {imovel.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          imovel.status === "DISPONIVEL"
                            ? "text-green-700 bg-green-100"
                            : imovel.status === "VENDIDO"
                              ? "text-blue-700 bg-blue-100"
                              : imovel.status === "ALUGADO"
                                ? "text-orange-700 bg-orange-100"
                                : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {imovel.status === "DISPONIVEL"
                          ? "Disponível"
                          : imovel.status === "VENDIDO"
                            ? "Vendido"
                            : imovel.status === "ALUGADO"
                              ? "Alugado"
                              : "Inativo"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum imóvel cadastrado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </CorretorLayout>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactElement;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:scale-105 transition-transform">
        {value}
      </p>
    </div>
  );
}
