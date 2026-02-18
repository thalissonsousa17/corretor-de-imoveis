import { useEffect, useState, useCallback } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  MessageCircle,
} from "lucide-react";

// ===== Types =====

interface Imovel {
  id: string;
  titulo: string;
  localizacao: string;
  cidade: string;
}

interface Visita {
  id: string;
  dataHora: string;
  nomeVisitante: string;
  telefoneVisitante: string | null;
  emailVisitante: string | null;
  observacoes: string | null;
  status: string;
  imovelId: string | null;
  imovel: Imovel | null;
  createdAt: string;
}

type VisitaStatus = "AGENDADA" | "CONFIRMADA" | "REALIZADA" | "CANCELADA" | "NAO_COMPARECEU";

const statusConfig: Record<VisitaStatus, { label: string; color: string; bg: string; dot: string }> = {
  AGENDADA: { label: "Agendada", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  CONFIRMADA: { label: "Confirmada", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  REALIZADA: { label: "Realizada", color: "text-green-700", bg: "bg-green-50 border-green-200", dot: "bg-green-500" },
  CANCELADA: { label: "Cancelada", color: "text-red-700", bg: "bg-red-50 border-red-200", dot: "bg-red-400" },
  NAO_COMPARECEU: { label: "Nao Compareceu", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
};

const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

// ===== Component =====

export default function CorretorVisitas() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formData, setFormData] = useState("");
  const [formHora, setFormHora] = useState("10:00");
  const [formNome, setFormNome] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formObs, setFormObs] = useState("");
  const [formImovelId, setFormImovelId] = useState("");

  const fetchVisitas = useCallback(async () => {
    try {
      const res = await api.get(`/corretor/visitas?mes=${mes + 1}&ano=${ano}`);
      setVisitas(res.data);
    } catch {
      toast.error("Erro ao carregar visitas.");
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const fetchImoveis = useCallback(async () => {
    try {
      const res = await api.get("/imoveis");
      setImoveis(res.data.imoveis || res.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  useEffect(() => {
    fetchImoveis();
  }, [fetchImoveis]);

  // Calendar helpers
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const visitasPorDia = (dia: number) => {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return visitas.filter((v) => v.dataHora.startsWith(dateStr));
  };

  const visitasDoSelected = selectedDate
    ? visitas.filter((v) => v.dataHora.startsWith(selectedDate)).sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    : [];

  const isHoje = (dia: number) => {
    return dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
  };

  const navMes = (dir: number) => {
    let m = mes + dir;
    let a = ano;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMes(m);
    setAno(a);
    setSelectedDate(null);
    setLoading(true);
  };

  const resetForm = () => {
    setFormData("");
    setFormHora("10:00");
    setFormNome("");
    setFormTelefone("");
    setFormEmail("");
    setFormObs("");
    setFormImovelId("");
    setEditingVisita(null);
  };

  const openForm = (visita?: Visita, dateStr?: string) => {
    if (visita) {
      setEditingVisita(visita);
      const dt = new Date(visita.dataHora);
      setFormData(visita.dataHora.slice(0, 10));
      setFormHora(`${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
      setFormNome(visita.nomeVisitante);
      setFormTelefone(visita.telefoneVisitante || "");
      setFormEmail(visita.emailVisitante || "");
      setFormObs(visita.observacoes || "");
      setFormImovelId(visita.imovelId || "");
    } else {
      resetForm();
      if (dateStr) setFormData(dateStr);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formNome.trim() || !formData || !formHora) {
      toast.error("Preencha nome, data e horario.");
      return;
    }
    setSaving(true);
    try {
      const dataHora = new Date(`${formData}T${formHora}:00`).toISOString();
      const payload = {
        dataHora,
        nomeVisitante: formNome,
        telefoneVisitante: formTelefone || null,
        emailVisitante: formEmail || null,
        observacoes: formObs || null,
        imovelId: formImovelId || null,
      };

      if (editingVisita) {
        await api.patch(`/corretor/visitas/${editingVisita.id}`, payload);
        toast.success("Visita atualizada!");
      } else {
        await api.post("/corretor/visitas", payload);
        toast.success("Visita agendada!");
      }
      setShowForm(false);
      resetForm();
      fetchVisitas();
    } catch {
      toast.error("Erro ao salvar visita.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/corretor/visitas/${id}`, { status });
      setVisitas((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta visita?")) return;
    try {
      await api.delete(`/corretor/visitas/${id}`);
      setVisitas((prev) => prev.filter((v) => v.id !== id));
      toast.success("Visita removida.");
    } catch {
      toast.error("Erro ao remover.");
    }
  };

  const formatHora = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  };

  // Stats
  const stats = {
    agendadas: visitas.filter((v) => v.status === "AGENDADA" || v.status === "CONFIRMADA").length,
    realizadas: visitas.filter((v) => v.status === "REALIZADA").length,
    canceladas: visitas.filter((v) => v.status === "CANCELADA" || v.status === "NAO_COMPARECEU").length,
  };

  return (
    <CorretorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Agendamento de Visitas</h2>
            <p className="text-sm text-gray-500 mt-1">Organize seus tours e visitas a imoveis</p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-[#1A2A4F] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#243662] transition text-sm"
          >
            <Plus size={16} />
            Nova Visita
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><CalendarDays size={18} className="text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.agendadas}</p>
              <p className="text-xs text-gray-500">Agendadas</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50"><CheckCircle size={18} className="text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.realizadas}</p>
              <p className="text-xs text-gray-500">Realizadas</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50"><XCircle size={18} className="text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.canceladas}</p>
              <p className="text-xs text-gray-500">Canceladas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            {/* Nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => navMes(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <h3 className="text-lg font-bold text-gray-800">
                {MESES[mes]} {ano}
              </h3>
              <button onClick={() => navMes(1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16" />
              ))}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1;
                const dateStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                const visitasDoDia = visitasPorDia(dia);
                const isSelected = selectedDate === dateStr;
                const hj = isHoje(dia);

                return (
                  <button
                    key={dia}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative h-16 rounded-xl text-sm transition-all flex flex-col items-center justify-start pt-1.5 ${
                      isSelected
                        ? "bg-[#1A2A4F] text-white shadow-lg"
                        : hj
                          ? "bg-blue-50 border-2 border-blue-300 text-blue-800 font-bold"
                          : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className={`text-sm ${hj && !isSelected ? "font-bold" : ""}`}>{dia}</span>
                    {visitasDoDia.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {visitasDoDia.slice(0, 3).map((v) => {
                          const sc = statusConfig[v.status as VisitaStatus] || statusConfig.AGENDADA;
                          return (
                            <span
                              key={v.id}
                              className={`w-2 h-2 rounded-full ${isSelected ? "bg-white/70" : sc.dot}`}
                            />
                          );
                        })}
                        {visitasDoDia.length > 3 && (
                          <span className={`text-[9px] ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                            +{visitasDoDia.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Panel — visitas do dia selecionado */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                {selectedDate
                  ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })
                  : "Proximas Visitas"}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => openForm(undefined, selectedDate)}
                  className="p-1.5 rounded-lg bg-[#1A2A4F] text-white hover:bg-[#243662] transition"
                  title="Agendar neste dia"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1A2A4F]" />
              </div>
            ) : (selectedDate ? visitasDoSelected : visitas.filter((v) => v.status === "AGENDADA" || v.status === "CONFIRMADA").slice(0, 8)).length > 0 ? (
              <div className="space-y-3">
                {(selectedDate
                  ? visitasDoSelected
                  : visitas.filter((v) => v.status === "AGENDADA" || v.status === "CONFIRMADA").slice(0, 8)
                ).map((v) => {
                  const sc = statusConfig[v.status as VisitaStatus] || statusConfig.AGENDADA;
                  return (
                    <div key={v.id} className={`rounded-xl border p-3 ${sc.bg} transition-all`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className={sc.color} />
                            <span className={`text-sm font-bold ${sc.color}`}>{formatHora(v.dataHora)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sc.color} ${sc.bg}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 mt-1 flex items-center gap-1">
                            <User size={13} className="text-gray-400" /> {v.nomeVisitante}
                          </p>
                          {v.imovel && (
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Home size={11} /> {v.imovel.titulo}
                            </p>
                          )}
                          {v.telefoneVisitante && (
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Phone size={11} /> {v.telefoneVisitante}
                            </p>
                          )}
                          {v.observacoes && (
                            <p className="text-xs text-gray-400 mt-1 italic">{v.observacoes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {v.telefoneVisitante && (
                            <a
                              href={`https://wa.me/55${v.telefoneVisitante.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition"
                              title="WhatsApp"
                            >
                              <MessageCircle size={12} />
                            </a>
                          )}
                          <button
                            onClick={() => openForm(v)}
                            className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                            title="Editar"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1 rounded bg-red-100 text-red-500 hover:bg-red-200 transition"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Quick status */}
                      {(v.status === "AGENDADA" || v.status === "CONFIRMADA") && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200/50">
                          {v.status === "AGENDADA" && (
                            <button
                              onClick={() => handleStatusChange(v.id, "CONFIRMADA")}
                              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                            >
                              <CheckCircle size={10} /> Confirmar
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(v.id, "REALIZADA")}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            <CheckCircle size={10} /> Realizada
                          </button>
                          <button
                            onClick={() => handleStatusChange(v.id, "NAO_COMPARECEU")}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                          >
                            <AlertCircle size={10} /> Faltou
                          </button>
                          <button
                            onClick={() => handleStatusChange(v.id, "CANCELADA")}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                          >
                            <XCircle size={10} /> Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <CalendarDays size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {selectedDate ? "Nenhuma visita neste dia" : "Nenhuma visita agendada"}
                </p>
                <button
                  onClick={() => openForm(undefined, selectedDate || undefined)}
                  className="mt-3 text-sm text-[#1A2A4F] font-medium hover:underline"
                >
                  + Agendar visita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="text-[#1A2A4F] fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingVisita ? "Editar Visita" : "Agendar Visita"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Data + Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input
                    type="date"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario *</label>
                  <input
                    type="time"
                    value={formHora}
                    onChange={(e) => setFormHora(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
              </div>

              {/* Visitante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Visitante *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
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
              </div>

              {/* Imovel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imovel</label>
                <select
                  value={formImovelId}
                  onChange={(e) => setFormImovelId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none bg-white"
                >
                  <option value="">Selecionar imovel (opcional)</option>
                  {imoveis.map((im) => (
                    <option key={im.id} value={im.id}>
                      {im.titulo} — {im.cidade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observacoes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  rows={2}
                  placeholder="Notas sobre a visita..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>
            </div>

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
                {saving ? "Salvando..." : editingVisita ? "Salvar" : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CorretorLayout>
  );
}
