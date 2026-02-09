import { useEffect, useState } from "react";
import axios from "axios";
import DominioForm from "./DominioForm";
import DominioStatus from "./DominioStatus";

type DominioData = {
  dominioPersonalizado: string | null;
  dominioStatus: "PENDENTE" | "ATIVO" | "ERRO" | null;
};

export default function DominioCard() {
  const [data, setData] = useState<DominioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      const res = await axios.get<DominioData>("/api/profile/dominio", {
        withCredentials: true,
      });
      setData(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setErro("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setErro("Erro ao carregar informações do domínio.");
        console.error(err);
      }
    }
  }

  async function salvarDominio(dominio: string) {
    setLoading(true);
    setErro(null);
    setMensagem(null);

    try {
      const res = await axios.post<{ mensagem: string }>(
        "/api/profile/dominio", // URL ajustada para bater com o arquivo corrigido
        { dominio },
        { withCredentials: true }
      );

      setMensagem(res.data.mensagem);
      await carregar();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string })?.error || "Erro ao salvar"
        : "Erro ao salvar";
      setErro(message);
    } finally {
      setLoading(false);
    }
  }

  async function verificarDominio() {
    setLoading(true);
    setErro(null);
    setMensagem(null);

    try {
      const res = await axios.post<{ mensagem?: string; ok?: boolean }>(
        "/api/dominio/verificar",
        {},
        { withCredentials: true }
      );

      // Se a API retornar que não está ok, mas sem dar erro de status (ex: DNS ainda não propagou)
      if (res.data.ok === false) {
        setErro("DNS ainda não propagado. Tente novamente em alguns minutos.");
      } else {
        setMensagem(res.data.mensagem ?? "Verificação realizada");
        await carregar();
      }
    } catch (err: unknown) {
      // Tipagem correta para satisfazer o ESLint
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { error?: string };

        if (status === 401) {
          setErro("Sessão inválida. Por favor, faça login novamente.");
        } else if (status === 403) {
          setErro(data.error || "Seu plano não permite domínios personalizados.");
        } else {
          setErro(data.error || "Erro ao verificar domínio.");
        }
      } else {
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4">
      <h2 className="text-lg font-semibold text-[#1A2A4F]">Domínio Personalizado</h2>

      {data?.dominioPersonalizado && (
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#1A2A4F]">{data.dominioPersonalizado}</span>
          <DominioStatus status={data.dominioStatus} />
        </div>
      )}

      <DominioForm
        dominioAtual={data?.dominioPersonalizado ?? null}
        loading={loading}
        onSalvar={salvarDominio}
        onVerificar={verificarDominio}
      />

      {mensagem && <p className="text-green-600 text-sm font-medium">{mensagem}</p>}
      {erro && <p className="text-red-600 text-sm font-medium">{erro}</p>}
    </div>
  );
}
