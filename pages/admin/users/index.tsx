import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { Search, MoreVertical, ExternalLink } from "lucide-react";

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
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.creci.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "EXPERT": return "bg-indigo-100 text-indigo-700";
      case "PRO": return "bg-purple-100 text-purple-700";
      case "START": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO": return "text-green-600";
      case "CANCELADO": return "text-red-500";
      case "EXPIRADO": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  return (
    <AdminLayout>
      {/* Header da página */}
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

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Corretor</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Imóveis</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadastro</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1A2A4F] mx-auto"></div>
                    <p className="mt-3">Carregando...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-[#1A2A4F] rounded-full flex items-center justify-center text-[#D4AC3A] font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-xs">
                        <span className="text-gray-400">CRECI:</span> {user.creci}
                      </p>
                      <p className="text-gray-600 text-xs">
                        <span className="text-gray-400">Tel:</span> {user.whatsapp}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getPlanoColor(user.plano)}`}>
                        {user.plano}
                      </span>
                      <p className={`text-xs font-medium mt-0.5 ${getStatusColor(user.status)}`}>
                        {user.status}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-700 text-sm">
                        {user.imoveisCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.slug && (
                        <a
                          href={`/${user.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                          title="Ver página pública"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Nenhum corretor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
