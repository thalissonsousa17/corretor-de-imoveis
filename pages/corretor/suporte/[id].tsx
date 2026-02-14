import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import CorretorLayout from "@/components/CorretorLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Send } from "lucide-react";

interface Mensagem {
  id: string;
  conteudo: string;
  createdAt: string;
  autor: { name: string; role: string };
  autorId: string;
}

interface TicketInfo {
  id: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function TicketChat() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/suporte/${id}`);
      setTicket(res.data.ticket);
      setMensagens(res.data.mensagens);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Polling para novas mensagens a cada 5s
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/suporte/${id}`, { conteudo: novaMensagem });
      setMensagens([...mensagens, res.data]);
      setNovaMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const isClosed = ticket?.status === "FECHADO";

  return (
    <CorretorLayout>
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
        {/* Header */}
        <div className="bg-white rounded-t-2xl border border-gray-100 p-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/corretor/suporte")}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 truncate">{ticket?.assunto || "Carregando..."}</h2>
            <p className="text-xs text-gray-400">
              {ticket && `Ticket #${ticket.id.slice(-6).toUpperCase()} • ${ticket.status.replace("_", " ")}`}
            </p>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-100 p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {mensagens.map((msg, index) => {
                const isMe = msg.autorId === user?.id;
                const showDate =
                  index === 0 ||
                  formatDate(msg.createdAt) !== formatDate(mensagens[index - 1].createdAt);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[10px] font-semibold text-blue-600 mb-0.5">
                            {msg.autor.name} {msg.autor.role === "ADMIN" && "• Admin"}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 p-3">
          {isClosed ? (
            <p className="text-center text-sm text-gray-400 py-2">Este ticket está fechado.</p>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!novaMensagem.trim() || sending}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </CorretorLayout>
  );
}
