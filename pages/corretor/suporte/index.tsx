import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import { Plus, MessageSquare, Clock, AlertTriangle, CheckCircle, X, ExternalLink, RefreshCw } from "lucide-react";

interface Ticket {
  id: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  createdAt: string;
  updatedAt: string;
  naoLidas: number;
  _count: { mensagens: number };
  mensagens: { conteudo: string; createdAt: string }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ABERTO: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: Clock },
  EM_ANDAMENTO: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  RESOLVIDO: { label: "Resolvido", color: "bg-green-100 text-green-700", icon: CheckCircle },
  FECHADO: { label: "Fechado", color: "bg-gray-100 text-gray-500", icon: X },
};

const prioridadeConfig: Record<string, { label: string; color: string }> = {
  BAIXA: { label: "Baixa", color: "text-gray-500" },
  MEDIA: { label: "Média", color: "text-yellow-600" },
  ALTA: { label: "Alta", color: "text-orange-600" },
  URGENTE: { label: "Urgente", color: "text-red-600" },
};

const filterLabels: Record<string, string> = {
  TODOS: "Todos",
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em Andamento",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export default function SuporteCorretor() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ assunto: "", descricao: "", prioridade: "MEDIA" });
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("TODOS");
  const [reopening, setReopening] = useState<string | null>(null);
  const router = useRouter();

  const fetchTickets = async () => {
    try {
      const res = await api.get("/suporte");
      setTickets(res.data);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/suporte", form);
      setShowModal(false);
      setForm({ assunto: "", descricao: "", prioridade: "MEDIA" });
      fetchTickets();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
    } finally {
      setSending(false);
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const statusCounts = {
    TODOS: tickets.length,
    ABERTO: tickets.filter((t) => t.status === "ABERTO").length,
    EM_ANDAMENTO: tickets.filter((t) => t.status === "EM_ANDAMENTO").length,
    RESOLVIDO: tickets.filter((t) => t.status === "RESOLVIDO").length,
    FECHADO: tickets.filter((t) => t.status === "FECHADO").length,
  };

  const filteredTickets = filter === "TODOS" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <CorretorLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Suporte</h1>
            <p className="text-sm text-gray-500 mt-1">Envie dúvidas ou problemas para o administrador</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Novo Ticket
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["TODOS", "ABERTO", "EM_ANDAMENTO", "RESOLVIDO", "FECHADO"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                filter === status
                  ? "bg-blue-600 text-white shadow-sm"
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
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
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {ticket.naoLidas}
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
                          onClick={() => router.push(`/corretor/suporte/${ticket.id}`)}
                          className=" flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium"
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
            {filter === "TODOS" && (
              <p className="text-sm text-gray-400 mt-1">Clique em "Novo Ticket" para solicitar ajuda</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Criar Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Novo Ticket de Suporte</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Assunto</label>
                <input
                  type="text"
                  required
                  value={form.assunto}
                  onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                  placeholder="Resumo do problema"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  required
                  rows={4}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva detalhadamente seu problema ou dúvida..."
                  className="text-black mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  value={form.prioridade}
                  onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                  className="text-black mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="text-blue-600 cursor-pointer flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending ? "Enviando..." : "Criar Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CorretorLayout>
  );
}
