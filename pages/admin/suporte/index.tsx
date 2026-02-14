import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { MessageSquare, Clock, AlertTriangle, CheckCircle, X, User, ExternalLink, RefreshCw, type LucideIcon } from "lucide-react";

interface Ticket {
  id: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  createdAt: string;
  updatedAt: string;
  naoLidas: number;
  user: { name: string; email: string };
  _count: { mensagens: number };
}

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  mensagem: string | null;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ABERTO: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: Clock },
  EM_ANDAMENTO: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  RESOLVIDO: { label: "Resolvido", color: "bg-green-100 text-green-700", icon: CheckCircle },
  FECHADO: { label: "Fechado", color: "bg-gray-100 text-gray-500", icon: X },
};

const leadStatusConfig: Record<string, { label: string; color: string }> = {
  NOVO: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  EM_ATENDIMENTO: { label: "Em Atendimento", color: "bg-yellow-100 text-yellow-700" },
  CONVERTIDO: { label: "Convertido", color: "bg-green-100 text-green-700" },
  PERDIDO: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

const prioridadeConfig: Record<string, { label: string; color: string }> = {
  BAIXA: { label: "Baixa", color: "text-gray-500" },
  MEDIA: { label: "Média", color: "text-yellow-600" },
  ALTA: { label: "Alta", color: "text-orange-600" },
  URGENTE: { label: "Urgente", color: "text-red-600 font-bold" },
};

const filterLabels: Record<string, string> = {
  TODOS: "Todos",
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em Andamento",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export default function AdminSuporte() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"TICKETS" | "LEADS">("TICKETS");
  const [leads, setLeads] = useState<Lead[]>([]);

  const [filter, setFilter] = useState("TODOS");
  const [reopening, setReopening] = useState<string | null>(null);
  const [updatingLead, setUpdatingLead] = useState<string | null>(null);
  const router = useRouter();

  const fetchTickets = async () => {
    try {
      const res = await api.get("/suporte");
      setTickets(res.data);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTickets(), fetchLeads()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLeadStatus = async (leadId: string, newStatus: string) => {
    if (updatingLead) return;
    setUpdatingLead(leadId);
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      await fetchLeads();
    } catch (error) {
      alert("Erro ao atualizar status do lead");
    } finally {
      setUpdatingLead(null);
    }
  };

  const handleReopen = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    setReopening(ticketId);
    try {
      await api.patch(`/suporte/${ticketId}`, { status: "ABERTO" });
      fetchTickets();
    } catch (error) {
      console.error("Erro ao reabrir ticket:", error);
    } finally {
      setReopening(null);
    }
  };

  const filteredTickets =
    filter === "TODOS" ? tickets : tickets.filter((t) => t.status === filter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const statusCounts = {
    TODOS: tickets.length,
    ABERTO: tickets.filter((t) => t.status === "ABERTO").length,
    EM_ANDAMENTO: tickets.filter((t) => t.status === "EM_ANDAMENTO").length,
    RESOLVIDO: tickets.filter((t) => t.status === "RESOLVIDO").length,
    FECHADO: tickets.filter((t) => t.status === "FECHADO").length,
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Tickets de Suporte</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as solicitações de suporte dos corretores</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("TICKETS")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
              activeTab === "TICKETS"
                ? "border-[#1A2A4F] text-[#1A2A4F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tickets de Suporte
          </button>
          <button
            onClick={() => setActiveTab("LEADS")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
              activeTab === "LEADS"
                ? "border-[#1A2A4F] text-[#1A2A4F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Leads do Site ({leads.filter(l => l.status === "NOVO").length} novos)
          </button>
        </div>

        {/* Conteúdo da Aba */}
        {activeTab === "TICKETS" ? (
          <>
            {/* Filtros Tickets */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["TODOS", "ABERTO", "EM_ANDAMENTO", "RESOLVIDO", "FECHADO"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                filter === status
                  ? "bg-[#1A2A4F] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filterLabels[status]}{" "}
              <span className="ml-1 opacity-70">({statusCounts[status]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1A2A4F]"></div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const sc = statusConfig[ticket.status] || statusConfig.ABERTO;
              const pc = prioridadeConfig[ticket.prioridade] || prioridadeConfig.MEDIA;
              const StatusIcon = sc.icon;
              const isFechado = ticket.status === "FECHADO";

              return (
                <div
                  key={ticket.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{ticket.assunto}</h3>
                        {ticket.naoLidas > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {ticket.naoLidas} nova{ticket.naoLidas > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{ticket.descricao}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                          <StatusIcon size={12} />
                          {sc.label}
                        </span>
                        <span className={`text-xs font-medium ${pc.color}`}>{pc.label}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MessageSquare size={12} /> {ticket._count.mensagens}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User size={12} /> {ticket.user.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(ticket.updatedAt)}</span>
                      <div className="flex items-center gap-2">
                        {isFechado && (
                          <button
                            onClick={(e) => handleReopen(e, ticket.id)}
                            disabled={reopening === ticket.id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-medium disabled:opacity-50"
                          >
                            <RefreshCw size={12} className={reopening === ticket.id ? "animate-spin" : ""} />
                            Reabrir
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/suporte/${ticket.id}`)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#1A2A4F]/10 text-[#1A2A4F] hover:bg-[#1A2A4F]/20 transition font-medium"
                        >
                          <ExternalLink size={12} />
                          Abrir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {filter === "TODOS" ? "Nenhum ticket de suporte" : `Nenhum ticket ${filterLabels[filter].toLowerCase()}`}
            </p>
          </div>
        )}
          </>
        ) : (
          /* Lista de Leads */
          <div className="space-y-3">
            {leads.length > 0 ? (
              leads.map((lead) => {
                const sc = leadStatusConfig[lead.status] || leadStatusConfig.NOVO;
                return (
                  <div key={lead.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-800">{lead.nome}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="flex items-center gap-1">📧 {lead.email}</span>
                          {lead.whatsapp && <span className="flex items-center gap-1">📱 {lead.whatsapp}</span>}
                          <span className="flex items-center gap-1">📅 {formatDate(lead.createdAt)}</span>
                        </div>
                        {lead.mensagem && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                            &ldquo;{lead.mensagem}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatus(lead.id, e.target.value)}
                          disabled={updatingLead === lead.id}
                          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                        >
                          <option value="NOVO">Novo</option>
                          <option value="EM_ATENDIMENTO">Em Atendimento</option>
                          <option value="CONVERTIDO">Convertido</option>
                          <option value="PERDIDO">Perdido</option>
                        </select>
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-100 text-green-700 p-2.5 rounded-lg hover:bg-green-200 transition"
                            title="Conversar no WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.575 2.012.895 3.125.895 3.178 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.778-5.766-5.778zm0 0M12.061 17.5c-1.125 0-2.071-.345-2.909-.908l-.208-.139-1.921.503.513-1.872-.138-.218c-.463-.733-.705-1.488-.705-2.296-.001-2.43 1.975-4.406 4.406-4.406s4.406 1.975 4.406 4.406c0 2.43-1.975 4.406-4.406 4.406zm0 0m2.384-3.328c-.131-.066-.777-.384-.897-.428-.121-.044-.209-.066-.297.066-.087.132-.339.428-.416.517-.076.088-.153.099-.284.033-.131-.066-.554-.204-1.055-.65-.393-.35-.658-.783-.735-.914-.076-.132-.008-.203.057-.269.06-.059.132-.154.198-.231.066-.077.087-.132.131-.22.044-.088.022-.165-.011-.232-.033-.066-.297-.715-.407-.98-.107-.257-.215-.222-.297-.226l-.253-.005c-.087 0-.23.033-.351.165-.121.132-.462.451-.462 1.1s.473 1.276.539 1.365c.065.088 1.848 3.012 4.478 4.148 2.63 1.136 2.63.758 3.113.714.484-.044 1.034-.428 1.177-.841.143-.413.143-.768.1-.841-.043-.073-.164-.117-.295-.183zm0 0" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <User size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum lead encontrado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
