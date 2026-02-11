import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

interface DominioData {
  dominio: string;
  status: "PENDENTE" | "ATIVO" | "ERRO";
}

export default function DominioCard() {
  const [dominio, setDominio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);

  const api = axios.create({
    withCredentials: true,
  });

  useEffect(() => {
    const fetchDominio = async () => {
      try {
        const res = await api.get<DominioData>("/api/profile/dominio");
        if (res.data) {
          setDominio(res.data.dominio);
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error("Erro ao buscar domínio", err);
      }
    };
    fetchDominio();
  }, []);

  const handleSalvar = async () => {
    if (!dominio) return alert("Por favor, digite um domínio.");

    setLoading(true);
    try {
      const res = await api.post("/api/profile/dominio", { dominio });
      alert(res.data.mensagem || "Domínio salvo com sucesso!");
      setStatus(res.data.status || "PENDENTE");
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;

      if (err.response?.status === 401) {
        alert("Sessão expirada ou não autenticada. Tente fazer login novamente.");
      } else {
        alert(err.response?.data?.error || "Erro ao salvar domínio");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Seu Domínio Personalizado</label>
        <input
          type="text"
          value={dominio}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDominio(e.target.value)}
          placeholder="exemplo.com.br"
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
        />
        {status && (
          <span
            className={`text-xs font-bold ${
              status === "ATIVO"
                ? "text-green-600"
                : status === "PENDENTE"
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            Status: {status}
          </span>
        )}
      </div>

      <button
        onClick={handleSalvar}
        disabled={loading}
        className="w-full bg-[#1A2A4F] text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:bg-gray-400 font-medium"
      >
        {loading ? "Salvando..." : "Salvar Configuração"}
      </button>

      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <p className="text-[11px] text-blue-800 leading-relaxed">
          <strong>Configuração de DNS:</strong>
          <br />
          Para ativar, aponte um registro do tipo <strong>A</strong> para o IP do seu servidor.
        </p>
      </div>
    </div>
  );
}
