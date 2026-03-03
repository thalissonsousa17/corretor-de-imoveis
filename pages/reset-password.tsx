import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query as { token?: string };

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Erro ao redefinir a senha.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded shadow text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-700">Link inválido</h1>
          <p className="text-gray-500 text-sm">
            Este link de redefinição é inválido ou já expirou.
          </p>
          <Link href="/forgot-password" className="block text-blue-600 hover:underline text-sm">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded shadow">
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-xl font-bold text-gray-700">Senha alterada!</h1>
            <p className="text-gray-500 text-sm">
              Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
            </p>
            <Link href="/login" className="block text-blue-600 hover:underline text-sm">
              Ir para o login agora
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-center text-gray-700">Nova senha</h1>
              <p className="text-center text-gray-500 text-sm mt-1">
                Digite e confirme sua nova senha abaixo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300
                             rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300
                             rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                  {error.includes("expirado") && (
                    <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm block mt-1">
                      Solicitar novo link
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 rounded shadow-sm text-sm font-medium
                           text-white bg-blue-600 hover:bg-blue-700
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
