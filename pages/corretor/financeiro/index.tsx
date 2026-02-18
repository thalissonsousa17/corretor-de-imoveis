import { useState, useEffect } from "react";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { DollarSign, TrendingUp, Clock, Plus, X, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Comissao {
  id: string;
  descricao: string;
  valorImovel: number | null;
  percentual: number | null;
  valorComissao: number;
  tipo: string;
  status: string;
  dataVenda: string | null;
  dataRecebimento: string | null;
  observacoes: string | null;
  imovelId: string | null;
  imovel: { id: string; titulo: string; cidade: string } | null;
  createdAt: string;
}

interface Resumo {
  totalRecebido: number;
  totalPendente: number;
  recebidoMes: number;
}

interface ImovelOption {
  id: string;
  titulo: string;
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDENTE: { label: "Pendente", bg: "bg-amber-100", text: "text-amber-700" },
  RECEBIDA: { label: "Recebida", bg: "bg-green-100", text: "text-green-700" },
  CANCELADA: { label: "Cancelada", bg: "bg-red-100", text: "text-red-700" },
};

const tipoLabel: Record<string, string> = {
  VENDA: "Venda",
  ALUGUEL: "Aluguel",
  INTERMEDIACAO: "Intermediação",
};

export default function FinanceiroPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [resumo, setResumo] = useState<Resumo>({ totalRecebido: 0, totalPendente: 0, recebidoMes: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imoveis, setImoveis] = useState<ImovelOption[]>([]);

  // Form
  const [descricao, setDescricao] = useState("");
  const [valorImovel, setValorImovel] = useState("");
  const [percentual, setPercentual] = useState("");
  const [valorComissao, setValorComissao] = useState("");
  const [tipo, setTipo] = useState("VENDA");
  const [dataVenda, setDataVenda] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [imovelId, setImovelId] = useState("");

  const fetchData = async () => {
    try {
      const [comRes, imovRes] = await Promise.all([
        api.get(`/corretor/financeiro${filter !== "TODOS" ? `?status=${filter}` : ""}`),
        api.get("/corretor/dashboard").catch(() => null),
      ]);
      setComissoes(comRes.data.comissoes);
      setResumo(comRes.data.resumo);
      if (imovRes) {
        setImoveis(imovRes.data.recentes || []);
      }
    } catch {
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Calcula valor da comissão quando muda valor do imóvel ou percentual
  useEffect(() => {
    if (valorImovel && percentual) {
      const calc = (parseFloat(valorImovel) * parseFloat(percentual)) / 100;
      if (!isNaN(calc)) setValorComissao(calc.toFixed(2));
    }
  }, [valorImovel, percentual]);

  const resetForm = () => {
    setDescricao("");
    setValorImovel("");
    setPercentual("");
    setValorComissao("");
    setTipo("VENDA");
    setDataVenda("");
    setObservacoes("");
    setImovelId("");
    setEditingId(null);
  };

  const openEdit = (c: Comissao) => {
    setDescricao(c.descricao);
    setValorImovel(c.valorImovel?.toString() || "");
    setPercentual(c.percentual?.toString() || "");
    setValorComissao(c.valorComissao.toString());
    setTipo(c.tipo);
    setDataVenda(c.dataVenda ? c.dataVenda.slice(0, 10) : "");
    setObservacoes(c.observacoes || "");
    setImovelId(c.imovelId || "");
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!descricao.trim() || !valorComissao) {
      return toast.error("Descrição e valor da comissão são obrigatórios.");
    }

    try {
      const payload = {
        descricao,
        valorImovel: valorImovel || null,
        percentual: percentual || null,
        valorComissao,
        tipo,
        dataVenda: dataVenda || null,
        observacoes,
        imovelId: imovelId || null,
      };

      if (editingId) {
        const res = await api.patch(`/corretor/financeiro/${editingId}`, payload);
        setComissoes((prev) => prev.map((c) => (c.id === editingId ? res.data : c)));
        toast.success("Comissão atualizada!");
      } else {
        const res = await api.post("/corretor/financeiro", payload);
        setComissoes((prev) => [res.data, ...prev]);
        toast.success("Comissão registrada!");
      }

      setShowForm(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("Erro ao salvar comissão.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta comissão?")) return;
    try {
      await api.delete(`/corretor/financeiro/${id}`);
      setComissoes((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comissão removida.");
      fetchData();
    } catch {
      toast.error("Erro ao remover.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const data: { status: string; dataRecebimento?: string | null } = { status: newStatus };
      if (newStatus === "RECEBIDA") data.dataRecebimento = new Date().toISOString();
      if (newStatus === "CANCELADA") data.dataRecebimento = null;

      const res = await api.patch(`/corretor/financeiro/${id}`, data);
      setComissoes((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      toast.success(`Status alterado para ${statusConfig[newStatus]?.label || newStatus}`);
      fetchData();
    } catch {
      toast.error("Erro ao alterar status.");
    }
  };

  return (
    <CorretorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
            <p className="text-sm text-gray-500 mt-0.5">Controle de comissões e receitas</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#1A2A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#243562] transition-colors"
          >
            <Plus size={16} /> Nova Comissão
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Recebido</p>
              <DollarSign size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.totalRecebido)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pendente</p>
              <Clock size={18} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(resumo.totalPendente)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recebido este mês</p>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(resumo.recebidoMes)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-5">
          {["TODOS", "PENDENTE", "RECEBIDA", "CANCELADA"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === s
                  ? "bg-[#1A2A4F] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "TODOS" ? "Todas" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Lista de Comissões */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
          ) : comissoes.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Nenhuma comissão registrada.</p>
              <p className="text-gray-400 text-xs mt-1">Clique em &ldquo;Nova Comissão&rdquo; para começar.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {comissoes.map((c) => {
                const cfg = statusConfig[c.status] || statusConfig.PENDENTE;
                return (
                  <div key={c.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{c.descricao}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {tipoLabel[c.tipo] || c.tipo}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          {c.imovel && <span>Imóvel: {c.imovel.titulo}</span>}
                          {c.valorImovel && <span>Valor imóvel: {formatCurrency(c.valorImovel)}</span>}
                          {c.percentual && <span>Comissão: {c.percentual}%</span>}
                          {c.dataVenda && (
                            <span>Venda: {new Date(c.dataVenda).toLocaleDateString("pt-BR")}</span>
                          )}
                          {c.dataRecebimento && (
                            <span>Recebido: {new Date(c.dataRecebimento).toLocaleDateString("pt-BR")}</span>
                          )}
                        </div>
                        {c.observacoes && (
                          <p className="text-xs text-gray-400 mt-1 italic">{c.observacoes}</p>
                        )}
                      </div>

                      {/* Valor + Ações */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(c.valorComissao)}</p>
                        <div className="flex items-center gap-1">
                          {c.status === "PENDENTE" && (
                            <button
                              onClick={() => handleStatusChange(c.id, "RECEBIDA")}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 hover:text-green-600 transition"
                              title="Marcar como recebida"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {c.status === "PENDENTE" && (
                            <button
                              onClick={() => handleStatusChange(c.id, "CANCELADA")}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition"
                              title="Cancelar"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition"
                            title="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="text-black fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingId ? "Editar Comissão" : "Nova Comissão"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Comissão venda Apt 301 - Ed. Solar"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  >
                    <option value="VENDA">Venda</option>
                    <option value="ALUGUEL">Aluguel</option>
                    <option value="INTERMEDIACAO">Intermediação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imóvel</label>
                  <select
                    value={imovelId}
                    onChange={(e) => setImovelId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  >
                    <option value="">Nenhum (manual)</option>
                    {imoveis.map((im) => (
                      <option key={im.id} value={im.id}>{im.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do imóvel</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorImovel}
                    onChange={(e) => setValorImovel(e.target.value)}
                    placeholder="500000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Comissão</label>
                  <input
                    type="number"
                    step="0.1"
                    value={percentual}
                    onChange={(e) => setPercentual(e.target.value)}
                    placeholder="6"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor comissão *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorComissao}
                    onChange={(e) => setValorComissao(e.target.value)}
                    placeholder="30000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da venda</label>
                <input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Notas sobre a comissão..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#1A2A4F] text-white rounded-xl text-sm font-medium hover:bg-[#243562] transition-colors"
              >
                {editingId ? "Salvar" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CorretorLayout>
  );
}
