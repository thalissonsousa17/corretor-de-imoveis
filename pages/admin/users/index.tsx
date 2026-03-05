import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { Search, ExternalLink, ChevronDown, ChevronRight, Clock, Cpu } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  creci: string;
  whatsapp: string;
  slug: string;
  plano: string;
  status: string;
  imoveisCount: number;
  createdAt: string;
  ultimoLogin: string | null;
  tempoTotalMinutos: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  custoTotal: number;
}

type SortKey = keyof AdminUser;

function formatMinutes(mins: number): string {
  if (mins <= 0) return "–";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatTokens(n: number): string {
  if (n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const PLANO_COLOR: Record<string, string> = {
  EXPERT: "bg-indigo-100 text-indigo-700",
  PRO: "bg-purple-100 text-purple-700",
  START: "bg-blue-100 text-blue-700",
};

const STATUS_COLOR: Record<string, string> = {
  ATIVO: "text-green-600",
  CANCELADO: "text-red-500",
  EXPIRADO: "text-orange-500",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/users")
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.creci.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

  const totalInputTokens = users.reduce((s, u) => s + u.inputTokens, 0);
  const totalOutputTokens = users.reduce((s, u) => s + u.outputTokens, 0);
  const totalCusto = users.reduce((s, u) => s + u.custoTotal, 0);

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-gray-700"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === k ? (sortAsc ? " ↑" : " ↓") : ""}
      </span>
    </th>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Corretores</h2>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} corretor{users.length !== 1 ? "es" : ""} cadastrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CRECI..."
            className="text-black w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D4AC3A]/50 focus:border-[#D4AC3A] transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Resumo de tokens */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Cpu size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tokens Input</p>
              <p className="font-bold text-gray-800">{formatTokens(totalInputTokens)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Cpu size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tokens Output</p>
              <p className="font-bold text-gray-800">{formatTokens(totalOutputTokens)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Custo Total IA</p>
              <p className="font-bold text-gray-800">${totalCusto.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-3 w-6" />
                <Th label="Corretor" k="name" />
                <Th label="Plano" k="plano" />
                <Th label="Cadastro" k="createdAt" />
                <Th label="Último Login" k="ultimoLogin" />
                <Th label="Tempo Total" k="tempoTotalMinutos" />
                <Th label="Tokens In" k="inputTokens" />
                <Th label="Tokens Out" k="outputTokens" />
                <Th label="Total" k="totalTokens" />
                <Th label="Custo" k="custoTotal" />
                <Th label="Imóveis" k="imoveisCount" />
                <th className="py-3 px-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1A2A4F] mx-auto" />
                    <p className="mt-3">Carregando...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-400">Nenhum corretor encontrado.</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <>
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                    >
                      {/* expand icon */}
                      <td className="py-3 pl-4 pr-1 text-gray-400">
                        {expanded === user.id
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />
                        }
                      </td>

                      {/* Corretor */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 bg-[#1A2A4F] rounded-full flex items-center justify-center text-[#D4AC3A] font-bold text-xs flex-shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[140px]">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plano */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${PLANO_COLOR[user.plano] ?? "bg-gray-100 text-gray-600"}`}>
                          {user.plano}
                        </span>
                        <p className={`text-xs mt-0.5 ${STATUS_COLOR[user.status] ?? "text-gray-500"}`}>
                          {user.status}
                        </p>
                      </td>

                      {/* Cadastro */}
                      <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Último Login */}
                      <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                        {user.ultimoLogin ? formatDate(user.ultimoLogin) : <span className="text-gray-300">–</span>}
                      </td>

                      {/* Tempo Total */}
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                          <Clock size={11} className="text-gray-400" />
                          {formatMinutes(user.tempoTotalMinutos)}
                        </span>
                      </td>

                      {/* Tokens In */}
                      <td className="py-3 px-3 text-xs text-blue-600 font-mono">
                        {formatTokens(user.inputTokens)}
                      </td>

                      {/* Tokens Out */}
                      <td className="py-3 px-3 text-xs text-purple-600 font-mono">
                        {formatTokens(user.outputTokens)}
                      </td>

                      {/* Total tokens */}
                      <td className="py-3 px-3 text-xs text-gray-700 font-mono font-semibold">
                        {formatTokens(user.totalTokens)}
                      </td>

                      {/* Custo */}
                      <td className="py-3 px-3 text-xs font-mono text-amber-700">
                        ${user.custoTotal.toFixed(4)}
                      </td>

                      {/* Imóveis */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-gray-100 px-2.5 py-0.5 rounded-lg font-bold text-gray-700 text-xs">
                          {user.imoveisCount}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-center">
                        {user.slug && (
                          <a
                            href={`/${user.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:text-blue-700"
                            title="Ver página pública"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </tr>

                    {/* Linha expandida com detalhes */}
                    {expanded === user.id && (
                      <tr key={`${user.id}-detail`} className="bg-gray-50/70">
                        <td colSpan={12} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-1">Contato</p>
                              <p className="text-gray-700">CRECI: {user.creci}</p>
                              <p className="text-gray-700">Tel: {user.whatsapp}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-1">Sessões</p>
                              <p className="text-gray-700">Tempo total: <strong>{formatMinutes(user.tempoTotalMinutos)}</strong></p>
                              <p className="text-gray-700">Último login: {user.ultimoLogin ? formatDate(user.ultimoLogin) : "–"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-1">Tokens IA</p>
                              <p className="text-gray-700">Input: <strong className="text-blue-600">{formatTokens(user.inputTokens)}</strong></p>
                              <p className="text-gray-700">Output: <strong className="text-purple-600">{formatTokens(user.outputTokens)}</strong></p>
                              <p className="text-gray-700">Total: <strong>{formatTokens(user.totalTokens)}</strong></p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider font-semibold mb-1">Custo IA</p>
                              <p className="text-2xl font-bold text-amber-600">${user.custoTotal.toFixed(4)}</p>
                              <p className="text-gray-400">gpt-4o-mini</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
