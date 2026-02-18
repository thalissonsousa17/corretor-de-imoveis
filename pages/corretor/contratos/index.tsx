import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import { CONTRATOS_TEMPLATES, ContratoTemplate, TipoContrato } from "@/lib/contratos-templates";
import toast from "react-hot-toast";
import SignaturePad from "@/components/SignaturePad";
import { PenTool, Trash2, X } from "lucide-react";

// Importação dinâmica (sem SSR) do editor TipTap
const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-xl bg-gray-50 min-h-[600px] flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Carregando editor...</p>
      </div>
    </div>
  ),
});

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Contrato {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: TipoContrato;
  createdAt: string;
  updatedAt: string;
}

interface MensagemIA {
  role: "user" | "assistant";
  conteudo: string;
  contratoPreenchido?: string;
  loading?: boolean;
}

interface Assinatura {
  id: string;
  nome: string;
  email: string;
  documento: string | null;
  assinatura: string;
  ip: string | null;
  assinadoEm: string;
}

// ─── Cores dos templates ───────────────────────────────────────────────────────
const corMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-600" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-600" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-600" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   badge: "bg-teal-600" },
};

// ─── Utilitários de exportação ─────────────────────────────────────────────────
function printContrato(titulo: string, conteudo: string) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    @page { margin: 2.5cm; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #111;
      background: #fff;
    }
    h1 { font-size: 14pt; font-weight: bold; text-align: center; margin: 0 0 6pt; }
    h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 16pt 0 6pt; border-bottom: 1pt solid #ccc; padding-bottom: 2pt; }
    h3 { font-size: 12pt; font-weight: bold; margin: 12pt 0 4pt; }
    p  { margin: 0 0 8pt; text-align: justify; }
    ol, ul { margin: 4pt 0 8pt 20pt; }
    li { margin-bottom: 4pt; }
    hr { border: none; border-top: 1pt solid #ccc; margin: 12pt 0; }
    strong { font-weight: bold; }
    em { font-style: italic; }
    img { max-width: 100%; height: auto; }
    blockquote { border-left: 3pt solid #666; padding-left: 10pt; color: #444; font-style: italic; margin: 8pt 0; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>${conteudo}</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 600);
}

async function exportToPDF(titulo: string, conteudo: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 794px; padding: 60px;
    font-family: 'Times New Roman', Times, serif;
    font-size: 13px; line-height: 1.8; color: #111; background: #fff;
  `;
  container.innerHTML = `
    <style>
      h1 { font-size: 16px; font-weight: bold; text-align: center; margin: 0 0 10px; }
      h2 { font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 20px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
      h3 { font-size: 13px; font-weight: bold; margin: 14px 0 4px; }
      p  { margin: 0 0 8px; text-align: justify; }
      ol, ul { margin: 4px 0 8px 22px; }
      li { margin-bottom: 4px; }
      strong { font-weight: bold; }
      em { font-style: italic; }
      img { max-width: 100%; height: auto; }
    </style>
    ${conteudo}
  `;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    let y = margin;
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
    let heightLeft = imgH - (pageH - margin * 2);

    while (heightLeft > 0) {
      y = -(imgH - heightLeft) - margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
      heightLeft -= pageH - margin * 2;
    }

    pdf.save(`${titulo}.pdf`);
  } catch {
    document.body.removeChild(container);
    throw new Error("Erro ao gerar PDF");
  }
}

function exportToDoc(titulo: string, conteudo: string) {
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
  <style>
    @page { margin: 2.5cm; size: A4; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.8; color: #000; }
    h1 { font-size: 14pt; font-weight: bold; text-align: center; }
    h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1pt solid #ccc; padding-bottom: 2pt; margin-top: 16pt; }
    h3 { font-size: 12pt; font-weight: bold; }
    p  { text-align: justify; margin-bottom: 8pt; }
    ol, ul { margin-left: 20pt; }
    li { margin-bottom: 4pt; }
  </style>
</head>
<body>${conteudo}</body>
</html>`;

  const blob = new Blob(["\uFEFF", html], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${titulo}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function ContratosPage() {
  // Estado dos contratos
  const [salvos, setSalvos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor
  const [editorConteudo, setEditorConteudo] = useState("");
  const [editorTitulo, setEditorTitulo] = useState("");
  const [editorTipo, setEditorTipo] = useState<TipoContrato>("PERSONALIZADO");
  const [contratoEditandoId, setContratoEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  // key para forçar remontagem do editor ao trocar contrato ou aplicar preenchimento da IA
  const [editorKey, setEditorKey] = useState(0);

  // IA
  const [painelIA, setPainelIA] = useState(false);
  const [mensagensIA, setMensagensIA] = useState<MensagemIA[]>([]);
  const [inputIA, setInputIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Exportação
  const [exportando, setExportando] = useState<"pdf" | "doc" | null>(null);

  // Assinaturas
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [showAssinatura, setShowAssinatura] = useState(false);
  const [sigNome, setSigNome] = useState("");
  const [sigEmail, setSigEmail] = useState("");
  const [sigDocumento, setSigDocumento] = useState("");
  const [showSigPad, setShowSigPad] = useState(false);

  // ── Carregar dados ────────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/corretor/contratos", { withCredentials: true })
      .then((r) => setSalvos(r.data.salvos ?? []))
      .catch(() => toast.error("Erro ao carregar contratos"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagensIA]);

  // ── Assinaturas — funções ─────────────────────────────────────────────────────
  const fetchAssinaturas = useCallback(async (cId: string) => {
    try {
      const res = await api.get(`/corretor/contratos/${cId}/assinaturas`);
      setAssinaturas(res.data);
    } catch {
      setAssinaturas([]);
    }
  }, []);

  const salvarAssinatura = async (dataUrl: string) => {
    if (!contratoEditandoId) return toast.error("Salve o contrato antes de assinar.");
    if (!sigNome.trim() || !sigEmail.trim()) return toast.error("Nome e email são obrigatórios.");

    try {
      const res = await api.post(`/corretor/contratos/${contratoEditandoId}/assinaturas`, {
        nome: sigNome,
        email: sigEmail,
        documento: sigDocumento || null,
        assinatura: dataUrl,
      });
      setAssinaturas((prev) => [res.data, ...prev]);
      setShowSigPad(false);
      setSigNome("");
      setSigEmail("");
      setSigDocumento("");
      toast.success("Assinatura registrada!");
    } catch {
      toast.error("Erro ao salvar assinatura.");
    }
  };

  const excluirAssinatura = async (id: string) => {
    if (!confirm("Remover esta assinatura?")) return;
    try {
      await api.delete(`/corretor/contratos/${contratoEditandoId}/assinaturas`, { data: { id } });
      setAssinaturas((prev) => prev.filter((a) => a.id !== id));
      toast.success("Assinatura removida.");
    } catch {
      toast.error("Erro ao remover assinatura.");
    }
  };

  // ── Carregar template no editor ───────────────────────────────────────────────
  const carregarTemplate = useCallback((tmpl: ContratoTemplate) => {
    setEditorTitulo(tmpl.titulo);
    setEditorConteudo(tmpl.conteudo);
    setEditorTipo(tmpl.tipo);
    setContratoEditandoId(null);
    setEditorKey((k) => k + 1);
    window.scrollTo({ top: 600, behavior: "smooth" });
  }, []);

  const carregarSalvo = useCallback((c: Contrato) => {
    setEditorTitulo(c.titulo);
    setEditorConteudo(c.conteudo);
    setEditorTipo(c.tipo);
    setContratoEditandoId(c.id);
    setEditorKey((k) => k + 1);
    setShowAssinatura(false);
    fetchAssinaturas(c.id);
    window.scrollTo({ top: 600, behavior: "smooth" });
  }, [fetchAssinaturas]);

  const novoPersonalizado = () => {
    setEditorTitulo("Novo Contrato");
    setEditorConteudo("<p>Escreva seu contrato aqui...</p>");
    setEditorTipo("PERSONALIZADO");
    setContratoEditandoId(null);
    setEditorKey((k) => k + 1);
    setAssinaturas([]);
    setShowAssinatura(false);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  // ── Aplicar contrato preenchido pela IA ───────────────────────────────────────
  const aplicarContratoPreenchido = useCallback((html: string) => {
    setEditorConteudo(html);
    setEditorKey((k) => k + 1);
    toast.success("✅ Contrato preenchido aplicado ao editor!");
    window.scrollTo({ top: 600, behavior: "smooth" });
  }, []);

  // ── Salvar contrato ───────────────────────────────────────────────────────────
  const salvar = async () => {
    if (!editorTitulo.trim() || !editorConteudo.trim()) {
      toast.error("Preencha o título e o conteúdo antes de salvar.");
      return;
    }
    setSalvando(true);
    try {
      if (contratoEditandoId) {
        const r = await api.put(
          `/corretor/contratos/${contratoEditandoId}`,
          { titulo: editorTitulo, conteudo: editorConteudo },
          { withCredentials: true }
        );
        setSalvos((prev) =>
          prev.map((c) => (c.id === contratoEditandoId ? r.data : c))
        );
        toast.success("Contrato atualizado!");
      } else {
        const r = await api.post(
          "/corretor/contratos",
          { titulo: editorTitulo, conteudo: editorConteudo, tipo: editorTipo },
          { withCredentials: true }
        );
        setSalvos((prev) => [r.data, ...prev]);
        setContratoEditandoId(r.data.id);
        toast.success("Contrato salvo!");
      }
    } catch {
      toast.error("Erro ao salvar contrato.");
    } finally {
      setSalvando(false);
    }
  };

  // ── Excluir contrato ──────────────────────────────────────────────────────────
  const excluir = async (id: string) => {
    if (!confirm("Excluir este contrato? Essa ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/corretor/contratos/${id}`, { withCredentials: true });
      setSalvos((prev) => prev.filter((c) => c.id !== id));
      if (contratoEditandoId === id) {
        setContratoEditandoId(null);
        setEditorConteudo("");
        setEditorTitulo("");
      }
      toast.success("Contrato excluído.");
    } catch {
      toast.error("Erro ao excluir contrato.");
    }
  };

  // ── PDF ───────────────────────────────────────────────────────────────────────
  const handlePDF = async () => {
    if (!editorConteudo) return toast.error("Nenhum conteúdo para exportar.");
    setExportando("pdf");
    try {
      await exportToPDF(editorTitulo || "Contrato", editorConteudo);
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setExportando(null);
    }
  };

  // ── DOC ───────────────────────────────────────────────────────────────────────
  const handleDoc = () => {
    if (!editorConteudo) return toast.error("Nenhum conteúdo para exportar.");
    try {
      exportToDoc(editorTitulo || "Contrato", editorConteudo);
      toast.success("Arquivo Word gerado!");
    } catch {
      toast.error("Erro ao gerar arquivo Word.");
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!editorConteudo) return toast.error("Nenhum conteúdo para imprimir.");
    printContrato(editorTitulo || "Contrato", editorConteudo);
  };

  // ── Chat IA ───────────────────────────────────────────────────────────────────
  const enviarIA = async () => {
    const msg = inputIA.trim();
    if (!msg || carregandoIA) return;

    setMensagensIA((prev) => [...prev, { role: "user", conteudo: msg }]);
    setInputIA("");
    setCarregandoIA(true);
    setMensagensIA((prev) => [...prev, { role: "assistant", conteudo: "", loading: true }]);

    try {
      const r = await api.post(
        "/corretor/contratos/ia",
        {
          mensagem: msg,
          // Envia o HTML completo para que a IA possa preencher os [CAMPOS]
          contratoHtml: editorConteudo || undefined,
        },
        { withCredentials: true }
      );

      const { resposta, contratoPreenchido } = r.data as {
        resposta: string;
        contratoPreenchido?: string;
      };

      setMensagensIA((prev) => {
        const updated = [...prev];
        const lastIdx = updated.findLastIndex((m) => m.loading);
        if (lastIdx !== -1)
          updated[lastIdx] = {
            role: "assistant",
            conteudo: resposta,
            contratoPreenchido,
          };
        return updated;
      });
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Erro ao consultar a IA.";
      setMensagensIA((prev) => {
        const updated = [...prev];
        const lastIdx = updated.findLastIndex((m) => m.loading);
        if (lastIdx !== -1) updated[lastIdx] = { role: "assistant", conteudo: `❌ ${errMsg}` };
        return updated;
      });
    } finally {
      setCarregandoIA(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <CorretorLayout>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* ── Templates ─────────────────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                📄 Modelos de Contratos
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Clique em um modelo para abrir no editor e personalizar
              </p>
            </div>
            <button
              onClick={novoPersonalizado}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Novo Contrato
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {CONTRATOS_TEMPLATES.map((tmpl) => {
              const cores = corMap[tmpl.cor] ?? corMap.blue;
              return (
                <button
                  key={tmpl.tipo}
                  onClick={() => carregarTemplate(tmpl)}
                  className={`
                    group text-left p-4 rounded-xl border-2 transition-all duration-200
                    hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
                    ${cores.bg} ${cores.border}
                  `}
                >
                  <div className="text-3xl mb-3">{tmpl.icone}</div>
                  <h3 className={`font-semibold text-sm leading-tight mb-1 ${cores.text}`}>
                    {tmpl.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                    {tmpl.descricao}
                  </p>
                  <div className={`mt-3 inline-block text-white text-[10px] px-2 py-0.5 rounded-full ${cores.badge}`}>
                    Usar modelo
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Meus contratos salvos ──────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            💾 Meus Contratos Salvos
            <span className="text-sm font-normal text-gray-400">({salvos.length})</span>
          </h2>

          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-48 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : salvos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              Nenhum contrato salvo ainda. Escolha um modelo acima para começar.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {salvos.map((c) => (
                <div
                  key={c.id}
                  className={`
                    flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border
                    transition-all bg-white text-sm
                    ${contratoEditandoId === c.id
                      ? "border-blue-400 shadow-md ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }
                  `}
                >
                  <button
                    onClick={() => carregarSalvo(c)}
                    className="font-medium text-gray-700 hover:text-blue-600 max-w-[180px] truncate"
                  >
                    {c.titulo}
                  </button>
                  <button
                    onClick={() => excluir(c.id)}
                    className="text-red-300 hover:text-red-600 ml-1 text-xs transition-colors"
                    title="Excluir"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Editor + painel IA ─────────────────────────────────────────────────── */}
        <div className={`flex gap-6 transition-all duration-300 ${painelIA ? "pr-0" : ""}`}>
          {/* Editor */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cabeçalho do editor */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-gray-400 text-sm font-medium">Título:</span>
                  <input
                    type="text"
                    value={editorTitulo}
                    onChange={(e) => setEditorTitulo(e.target.value)}
                    placeholder="Nome do contrato..."
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {contratoEditandoId && (
                  <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Editando salvo
                  </span>
                )}
              </div>

              {/* TipTap Editor */}
              <div id="print-area" className="bg-white">
                {editorConteudo !== undefined && (
                  <RichTextEditor
                    key={editorKey}
                    content={editorConteudo}
                    onChange={setEditorConteudo}
                    editable
                  />
                )}

                {!editorConteudo && (
                  <div className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhum contrato selecionado
                    </h3>
                    <p className="text-sm max-w-sm">
                      Selecione um modelo acima ou crie um novo contrato para começar a editar.
                    </p>
                    <button
                      onClick={novoPersonalizado}
                      className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      + Criar Contrato em Branco
                    </button>
                  </div>
                )}
              </div>

              {/* Barra de ações */}
              {editorConteudo && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Salvar */}
                    <button
                      onClick={salvar}
                      disabled={salvando}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {salvando ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                      ) : (
                        <>💾 Salvar</>
                      )}
                    </button>

                    {/* PDF */}
                    <button
                      onClick={handlePDF}
                      disabled={exportando !== null}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {exportando === "pdf" ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gerando...</>
                      ) : (
                        <>📄 Download PDF</>
                      )}
                    </button>

                    {/* Word */}
                    <button
                      onClick={handleDoc}
                      disabled={exportando !== null}
                      className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors disabled:opacity-60 shadow-sm"
                    >
                      📝 Download Word
                    </button>

                    {/* Imprimir */}
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>

                  {/* Assinatura */}
                  {contratoEditandoId && (
                    <button
                      onClick={() => setShowAssinatura((v) => !v)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
                        ${showAssinatura
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }
                      `}
                    >
                      <PenTool size={14} /> {showAssinatura ? "Fechar Assinaturas" : "Assinaturas"}
                      {assinaturas.length > 0 && (
                        <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {assinaturas.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Assistente IA */}
                  <button
                    onClick={() => setPainelIA((v) => !v)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
                      ${painelIA
                        ? "bg-violet-700 text-white"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                      }
                    `}
                  >
                    🤖 {painelIA ? "Fechar IA" : "Assistente IA"}
                  </button>
                </div>
              )}

              {/* ── Painel de Assinaturas ─────────────────────────────────────── */}
              {showAssinatura && contratoEditandoId && (
                <div className="text-black border-t border-gray-100 p-6 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <PenTool size={16} className="text-emerald-600" /> Assinaturas Digitais
                  </h3>

                  {/* Assinaturas existentes */}
                  {assinaturas.length > 0 && (
                    <div className="text-black space-y-3 mb-5">
                      {assinaturas.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3">
                          <img src={a.assinatura} alt={`Assinatura de ${a.nome}`} className="w-32 h-16 object-contain border border-gray-200 rounded-lg bg-white" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{a.nome}</p>
                            <p className="text-xs text-gray-500">{a.email}</p>
                            {a.documento && <p className="text-xs text-gray-400">Doc: {a.documento}</p>}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(a.assinadoEm).toLocaleString("pt-BR")}
                              {a.ip && ` · IP: ${a.ip}`}
                            </p>
                          </div>
                          <button
                            onClick={() => excluirAssinatura(a.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                            title="Remover assinatura"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário para nova assinatura */}
                  {!showSigPad ? (
                    <button
                      onClick={() => setShowSigPad(true)}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                    >
                      <PenTool size={14} /> + Adicionar assinatura
                    </button>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Nova Assinatura</h4>
                        <button onClick={() => { setShowSigPad(false); setSigNome(""); setSigEmail(""); setSigDocumento(""); }} className="p-1 rounded hover:bg-gray-100">
                          <X size={16} className="text-gray-400" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={sigNome}
                          onChange={(e) => setSigNome(e.target.value)}
                          placeholder="Nome completo *"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="email"
                          value={sigEmail}
                          onChange={(e) => setSigEmail(e.target.value)}
                          placeholder="Email *"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          value={sigDocumento}
                          onChange={(e) => setSigDocumento(e.target.value)}
                          placeholder="CPF/CNPJ (opcional)"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <SignaturePad
                        onSave={salvarAssinatura}
                        onCancel={() => setShowSigPad(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Painel IA ──────────────────────────────────────────────────────────── */}
          {painelIA && (
            <div className="w-[340px] shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sticky top-20" style={{ height: "calc(100vh - 120px)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <div>
                      <p className="font-semibold text-sm">Assistente IA</p>
                      <p className="text-xs text-violet-200">ChatGPT – Contratos Imobiliários</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPainelIA(false)}
                    className="text-violet-200 hover:text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Contexto badge */}
                {editorConteudo && (
                  <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 text-xs text-violet-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block animate-pulse" />
                    Usando o contrato atual como contexto
                  </div>
                )}

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mensagensIA.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      <p className="text-2xl mb-2">💬</p>
                      <p className="font-medium text-gray-600">Como posso ajudar?</p>
                      <p className="text-xs mt-1 text-gray-400">Pergunte sobre cláusulas, leis ou peça sugestões de melhorias para seu contrato.</p>
                      <div className="mt-4 space-y-2 text-left">
                        {[
                          "Revise as cláusulas de rescisão",
                          "Adicione uma cláusula de vistoria",
                          "Quais são os direitos do locatário?",
                          "Melhore o texto da cláusula de multa",
                        ].map((sug) => (
                          <button
                            key={sug}
                            onClick={() => setInputIA(sug)}
                            className="w-full text-left text-xs bg-violet-50 text-violet-700 px-3 py-2 rounded-lg hover:bg-violet-100 transition-colors border border-violet-100"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {mensagensIA.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`
                          max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                          ${m.role === "user"
                            ? "bg-violet-600 text-white rounded-tr-none"
                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                          }
                        `}
                      >
                        {m.loading ? (
                          <div className="flex items-center gap-1.5 py-0.5">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        ) : (
                          <>
                            <p style={{ whiteSpace: "pre-wrap" }}>{m.conteudo}</p>
                            {m.contratoPreenchido && (
                              <button
                                onClick={() => aplicarContratoPreenchido(m.contratoPreenchido!)}
                                className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm"
                              >
                                ✅ Aplicar ao Contrato
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="text-black p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={inputIA}
                      onChange={(e) => setInputIA(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          enviarIA();
                        }
                      }}
                      placeholder="Faça uma pergunta sobre o contrato..."
                      rows={2}
                      className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    <button
                      onClick={enviarIA}
                      disabled={!inputIA.trim() || carregandoIA}
                      className="bg-violet-600 text-white p-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {carregandoIA ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                    Enter para enviar · Shift+Enter para nova linha
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CorretorLayout>
  );
}
