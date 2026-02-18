import { useEffect, useState, useCallback } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  StickyNote,
  Home,
  Filter,
} from "lucide-react";

// ===== Types =====

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  telefone: string | null;
  mensagem: string | null;
  observacoes: string | null;
  imovelInteresse: string | null;
  origem: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type LeadStatus = "NOVO" | "EM_ATENDIMENTO" | "CONVERTIDO" | "PERDIDO";
type FilterStatus = "TODOS" | LeadStatus;

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; icon: typeof Users }> = {
  NOVO: { label: "Novo", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Users },
  EM_ATENDIMENTO: { label: "Em Atendimento", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  CONVERTIDO: { label: "Convertido", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: UserCheck },
  PERDIDO: { label: "Perdido", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: UserX },
};

const origemLabels: Record<string, string> = {
  SITE: "Site",
  MANUAL: "Manual",
  INDICACAO: "Indicacao",
  WHATSAPP: "WhatsApp",
  PORTAL: "Portal",
};

// ===== Component =====

export default function CorretorLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("TODOS");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formMensagem, setFormMensagem] = useState("");
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formImovelInteresse, setFormImovelInteresse] = useState("");
  const [formOrigem, setFormOrigem] = useState("MANUAL");

  const fetchLeads = useCallback(async () => {
    try {
      const res = await api.get("/corretor/leads");
      setLeads(res.data);
    } catch {
      toast.error("Erro ao carregar leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const resetForm = () => {
    setFormNome("");
    setFormEmail("");
    setFormWhatsapp("");
    setFormTelefone("");
    setFormMensagem("");
    setFormObservacoes("");
    setFormImovelInteresse("");
    setFormOrigem("MANUAL");
    setEditingLead(null);
  };

  const openForm = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormNome(lead.nome);
      setFormEmail(lead.email);
      setFormWhatsapp(lead.whatsapp || "");
      setFormTelefone(lead.telefone || "");
      setFormMensagem(lead.mensagem || "");
      setFormObservacoes(lead.observacoes || "");
      setFormImovelInteresse(lead.imovelInteresse || "");
      setFormOrigem(lead.origem);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formNome.trim()) {
      toast.error("Nome e obrigatorio.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome: formNome,
        email: formEmail,
        whatsapp: formWhatsapp || null,
        telefone: formTelefone || null,
        mensagem: formMensagem || null,
        observacoes: formObservacoes || null,
        imovelInteresse: formImovelInteresse || null,
        origem: formOrigem,
      };

      if (editingLead) {
        await api.patch(`/corretor/leads/${editingLead.id}`, payload);
        toast.success("Lead atualizado!");
      } else {
        await api.post("/corretor/leads", payload);
        toast.success("Lead adicionado!");
      }
      setShowForm(false);
      resetForm();
      fetchLeads();
    } catch {
      toast.error("Erro ao salvar lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await api.patch(`/corretor/leads/${leadId}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Remover este lead?")) return;
    try {
      await api.delete(`/corretor/leads/${leadId}`);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      toast.success("Lead removido.");
    } catch {
      toast.error("Erro ao remover lead.");
    }
  };

  const handleSaveObservacoes = async (leadId: string, obs: string) => {
    try {
      await api.patch(`/corretor/leads/${leadId}`, { observacoes: obs });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, observacoes: obs } : l)));
      toast.success("Observacao salva!");
    } catch {
      toast.error("Erro ao salvar.");
    }
  };

  // Filters
  const filtered = leads
    .filter((l) => filter === "TODOS" || l.status === filter)
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.nome.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.whatsapp?.toLowerCase().includes(q) ||
        l.imovelInteresse?.toLowerCase().includes(q)
      );
    });

  const counts = {
    TODOS: leads.length,
    NOVO: leads.filter((l) => l.status === "NOVO").length,
    EM_ATENDIMENTO: leads.filter((l) => l.status === "EM_ATENDIMENTO").length,
    CONVERTIDO: leads.filter((l) => l.status === "CONVERTIDO").length,
    PERDIDO: leads.filter((l) => l.status === "PERDIDO").length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <CorretorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Meus Leads</h2>
            <p className="text-sm text-gray-500 mt-1">Gerencie seus contatos e oportunidades</p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-[#1A2A4F] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#243662] transition text-sm"
          >
            <UserPlus size={16} />
            Novo Lead
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["NOVO", "EM_ATENDIMENTO", "CONVERTIDO", "PERDIDO"] as LeadStatus[]).map((s) => {
            const cfg = statusConfig[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "TODOS" : s)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  filter === s ? `${cfg.bg} border-current shadow-sm` : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-lg ${filter === s ? cfg.bg : "bg-gray-50"}`}>
                  <Icon size={18} className={filter === s ? cfg.color : "text-gray-400"} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">{counts[s]}</p>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search + Filter bar */}
        <div className=" flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, whatsapp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-black rounded-xl text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["TODOS", "NOVO", "EM_ATENDIMENTO", "CONVERTIDO", "PERDIDO"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                  filter === s
                    ? "bg-[#1A2A4F] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter size={12} />
                {s === "TODOS" ? "Todos" : statusConfig[s as LeadStatus].label}
                <span className="ml-1 opacity-70">({counts[s]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lead List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1A2A4F]" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((lead) => {
              const sc = statusConfig[lead.status as LeadStatus] || statusConfig.NOVO;
              const isExpanded = expandedId === lead.id;

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all overflow-hidden"
                >
                  {/* Main row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Lead info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{lead.nome}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sc.color} ${sc.bg}`}>
                            {sc.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {origemLabels[lead.origem] || lead.origem}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-[#1A2A4F] transition">
                              <Mail size={13} /> {lead.email}
                            </a>
                          )}
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black flex items-center gap-1 hover:text-green-600 transition"
                            >
                              <MessageCircle size={13} /> {lead.whatsapp}
                            </a>
                          )}
                          {lead.telefone && (
                            <a href={`tel:${lead.telefone}`} className="flex items-center gap-1 hover:text-[#1A2A4F] transition">
                              <Phone size={13} /> {lead.telefone}
                            </a>
                          )}
                          {lead.imovelInteresse && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Home size={13} /> {lead.imovelInteresse}
                            </span>
                          )}
                        </div>

                        {lead.mensagem && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            {lead.mensagem}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block mr-2">{formatDate(lead.createdAt)}</span>

                        {/* Status dropdown */}
                        <div className="relative">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg pl-2 pr-7 py-1.5 outline-none cursor-pointer hover:bg-gray-100 transition"
                          >
                            <option value="NOVO">Novo</option>
                            <option value="EM_ATENDIMENTO">Atendimento</option>
                            <option value="CONVERTIDO">Convertido</option>
                            <option value="PERDIDO">Perdido</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                            title="WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                          title="Notas"
                        >
                          <StickyNote size={14} />
                        </button>

                        <button
                          onClick={() => openForm(lead)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: observacoes */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50/50">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Observacoes / Anotacoes
                      </label>
                      <textarea
                        defaultValue={lead.observacoes || ""}
                        rows={3}
                        placeholder="Adicione notas sobre este lead..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                        onBlur={(e) => {
                          if (e.target.value !== (lead.observacoes || "")) {
                            handleSaveObservacoes(lead.id, e.target.value);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">
              {leads.length === 0 ? "Nenhum lead cadastrado" : "Nenhum lead encontrado"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {leads.length === 0
                ? "Clique em &ldquo;Novo Lead&rdquo; para adicionar seu primeiro contato"
                : "Tente ajustar os filtros ou a busca"}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => openForm()}
                className="mt-4 inline-flex items-center gap-2 bg-[#1A2A4F] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#243662] transition text-sm"
              >
                <UserPlus size={16} />
                Adicionar Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="text-black fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingLead ? "Editar Lead" : "Novo Lead"}
              </h3>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="(11) 3333-3333"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                  <select
                    value={formOrigem}
                    onChange={(e) => setFormOrigem(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none bg-white"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="SITE">Site</option>
                    <option value="INDICACAO">Indicacao</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PORTAL">Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imovel de Interesse</label>
                <input
                  type="text"
                  value={formImovelInteresse}
                  onChange={(e) => setFormImovelInteresse(e.target.value)}
                  placeholder="Ex: Apartamento 2 quartos no Centro"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={formMensagem}
                  onChange={(e) => setFormMensagem(e.target.value)}
                  rows={2}
                  placeholder="Mensagem inicial do lead..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Notas internas sobre este lead..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A2A4F] rounded-xl hover:bg-[#243662] transition disabled:opacity-50"
              >
                {saving ? "Salvando..." : editingLead ? "Salvar Alteracoes" : "Adicionar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CorretorLayout>
  );
}
