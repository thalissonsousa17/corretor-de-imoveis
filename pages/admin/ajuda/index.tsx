import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { Plus, Pencil, Trash2, BookOpen, Video, RefreshCw, X, Eye, EyeOff } from "lucide-react";

interface AjudaItem {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string | null;
  videoUrl: string | null;
  tipo: "DOCUMENTACAO" | "VIDEO";
  ordem: number;
  ativo: boolean;
}

const emptyForm = {
  titulo: "",
  descricao: "",
  conteudo: "",
  videoUrl: "",
  tipo: "DOCUMENTACAO" as "DOCUMENTACAO" | "VIDEO",
  ordem: 0,
  ativo: true,
};

export default function AdminAjuda() {
  const [items, setItems] = useState<AjudaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AjudaItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.get("/admin/ajuda");
      setItems(res.data);
    } catch {
      toast.error("Erro ao carregar itens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = (tipo: "DOCUMENTACAO" | "VIDEO") => {
    setEditing(null);
    setForm({ ...emptyForm, tipo, ordem: items.filter((i) => i.tipo === tipo).length });
    setShowModal(true);
  };

  const openEdit = (item: AjudaItem) => {
    setEditing(item);
    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      conteudo: item.conteudo ?? "",
      videoUrl: item.videoUrl ?? "",
      tipo: item.tipo,
      ordem: item.ordem,
      ativo: item.ativo,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) return toast.error("Título é obrigatório.");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/ajuda/${editing.id}`, form);
        toast.success("Item atualizado.");
      } else {
        await api.post("/admin/ajuda", form);
        toast.success("Item criado.");
      }
      setShowModal(false);
      fetchItems();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      message: "Excluir este item de ajuda?",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/ajuda/${id}`);
          setItems((prev) => prev.filter((i) => i.id !== id));
          toast.success("Item excluído.");
        } catch {
          toast.error("Erro ao excluir.");
        }
      },
    });
  };

  const toggleAtivo = async (item: AjudaItem) => {
    try {
      await api.put(`/admin/ajuda/${item.id}`, { ...item, ativo: !item.ativo });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, ativo: !i.ativo } : i));
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  const docs = items.filter((i) => i.tipo === "DOCUMENTACAO");
  const videos = items.filter((i) => i.tipo === "VIDEO");

  return (
    <AdminLayout>
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gerenciar Ajuda</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie a documentação e os vídeo-aulas exibidos no botão de ajuda (?) dos professores.</p>
        </div>
        <button
          onClick={fetchItems}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          title="Atualizar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AC3A]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Documentação */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" />
                <h2 className="font-semibold text-gray-700 text-sm">Documentação</h2>
                <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{docs.length}</span>
              </div>
              <button
                onClick={() => openCreate("DOCUMENTACAO")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus size={13} />
                Adicionar documentação
              </button>
            </div>

            {docs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-xl">Nenhuma documentação cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {docs.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 bg-white border rounded-xl ${!item.ativo ? "opacity-50" : ""}`}>
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={13} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.titulo}</p>
                      <p className="text-xs text-gray-400 truncate">{item.descricao}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.ativo ? "Ativo" : "Oculto"}
                    </span>
                    <button onClick={() => toggleAtivo(item)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer" title={item.ativo ? "Ocultar" : "Ativar"}>
                      {item.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Vídeos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-purple-600" />
                <h2 className="font-semibold text-gray-700 text-sm">Tutoriais em Vídeo</h2>
                <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{videos.length}</span>
              </div>
              <button
                onClick={() => openCreate("VIDEO")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition cursor-pointer"
              >
                <Plus size={13} />
                Adicionar vídeo
              </button>
            </div>

            {videos.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-xl">Nenhum vídeo cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {videos.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 bg-white border rounded-xl ${!item.ativo ? "opacity-50" : ""}`}>
                    <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video size={13} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.titulo}</p>
                      <p className="text-xs text-gray-400 truncate">{item.videoUrl}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.ativo ? "Ativo" : "Oculto"}
                    </span>
                    <button onClick={() => toggleAtivo(item)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer" title={item.ativo ? "Ocultar" : "Ativar"}>
                      {item.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">
                {editing ? "Editar" : "Adicionar"} {form.tipo === "VIDEO" ? "Vídeo" : "Documentação"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Como cadastrar um imóvel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição curta</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Resumo exibido no card"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {form.tipo === "VIDEO" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Link do Vídeo (YouTube ou outro)</label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Conteúdo (HTML ou texto)</label>
                  <textarea
                    rows={6}
                    value={form.conteudo}
                    onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                    placeholder="Conteúdo detalhado do artigo..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ordem</label>
                  <input
                    type="number"
                    min={0}
                    value={form.ordem}
                    onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={form.ativo}
                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="ativo" className="text-sm text-gray-600">Ativo</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold bg-[#1A2A4F] text-white rounded-lg hover:bg-[#243a6a] transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
