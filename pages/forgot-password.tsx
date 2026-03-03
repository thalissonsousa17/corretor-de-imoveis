import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded shadow">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h1 className="text-xl font-bold text-gray-700">Verifique seu email</h1>
            <p className="text-gray-500 text-sm">
              Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá
              um link para redefinir sua senha em breve.
            </p>
            <p className="text-gray-400 text-xs">O link expira em 1 hora.</p>
            <Link href="/login" className="block text-blue-600 hover:underline text-sm">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-center text-gray-700">Esqueceu a senha?</h1>
              <p className="text-center text-gray-500 text-sm mt-1">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300
                             rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 rounded shadow-sm text-sm font-medium
                           text-white bg-blue-600 hover:bg-blue-700
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:underline">
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
