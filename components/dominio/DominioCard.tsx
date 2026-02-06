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
    const res = await axios.get<DominioData>("/api/profile/dominio");
    setData(res.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvarDominio(dominio: string) {
    setLoading(true);
    setErro(null);
    setMensagem(null);

    try {
      const res = await axios.post<{ mensagem: string }>("/api/dominio/salvar", { dominio });

      setMensagem(res.data.mensagem);
      await carregar();
    } catch (error: unknown) {
      setErro(
        axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ?? "Erro ao salvar domínio")
          : "Erro ao salvar domínio"
      );
    } finally {
      setLoading(false);
    }
  }

  async function verificarDominio() {
    setLoading(true);
    setErro(null);
    setMensagem(null);

    try {
      const res = await axios.post<{ mensagem?: string }>("/api/dominio/verificar");

      setMensagem(res.data.mensagem ?? "Verificação realizada");
      await carregar();
    } catch (error: unknown) {
      setErro(
        axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ?? "Erro ao verificar domínio")
          : "Erro ao verificar domínio"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4">
      <h2 className="text-lg font-semibold">Domínio Personalizado</h2>

      {data?.dominioPersonalizado && (
        <div className="flex items-center gap-3">
          <span className="font-medium">{data.dominioPersonalizado}</span>
          <DominioStatus status={data.dominioStatus} />
        </div>
      )}

      <DominioForm
        dominioAtual={data?.dominioPersonalizado ?? null}
        loading={loading}
        onSalvar={salvarDominio}
        onVerificar={verificarDominio}
      />

      {mensagem && <p className="text-green-600 text-sm">{mensagem}</p>}
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
    </div>
  );
}
