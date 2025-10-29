"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SegurancaPage() {
  const [emailAtual, setEmailAtual] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAtualizar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaAtual || !senhaNova) {
      toast.error("Preencha a senha atual e a nova senha.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put("/api/corretor/credenciais", {
        emailAtual,
        emailNovo,
        senhaAtual,
        senhaNova,
      });

      toast.success(res.data.message || "Credenciais atualizadas com sucesso!");
      setSenhaAtual("");
      setSenhaNova("");
      setEmailNovo("");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Erro ao atualizar credenciais.");
      } else {
        toast.error("Erro inesperado ao atualizar credenciais.");
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            Segurança da Conta
          </h1>

          <form onSubmit={handleAtualizar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">E-mail atual</label>
              <input
                type="email"
                value={emailAtual}
                onChange={(e) => setEmailAtual(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seuemail@atual.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Novo e-mail (opcional)
              </label>
              <input
                type="email"
                value={emailNovo}
                onChange={(e) => setEmailNovo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="novoe-mail@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Senha atual</label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nova senha</label>
              <input
                type="password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 mt-4 text-white font-semibold rounded-lg transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Atualizando..." : "Atualizar Credenciais"}
            </button>
          </form>
        </div>
      </div>
    );
  };
}
