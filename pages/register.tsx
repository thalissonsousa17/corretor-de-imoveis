import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [adminExists, setAdminExists] = useState(true); // assume que existe até verificar
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Verifica se já existe um admin no sistema
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setAdminExists(data.adminExists);
      } catch {
        setAdminExists(true); // em caso de erro, esconde o campo por segurança
      }
    };
    checkAdmin();
  }, []);

  // Verifica se veio email pela URL (do Hero da home)
  useEffect(() => {
    if (router.query.email) {
      setEmail(String(router.query.email));
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: { name: string; email: string; password: string; adminCode?: string } = { name, email, password };
      if (showAdminField && adminCode) {
        payload.adminCode = adminCode;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.status === 201) {
        setMessage(resData.message || "Registro bem-sucedido!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(resData.message || "Erro ao registrar.");
      }
    } catch (err) {
      setError("Erro ao registrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center text-gray-700">Criar Conta</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* nome */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* e-mail */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* senha */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Código Admin - só aparece se NÃO existe admin */}
          {!adminExists && (
            <div className="border-t pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAdminField(!showAdminField)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Shield size={16} />
                <span>{showAdminField ? "Esconder" : "Tenho um código de administrador"}</span>
              </button>

              {showAdminField && (
                <div className="mt-3">
                  <label htmlFor="adminCode" className="text-sm font-medium text-gray-700">
                    Código de Administrador
                  </label>
                  <input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Digite o código secreto"
                    className="text-gray-500 mt-1 block w-full px-3 py-2 border border-amber-300 
                               rounded shadow-sm focus:ring-amber-500 focus:border-amber-500
                               bg-amber-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Insira o código fornecido pelo sistema para criar uma conta de administrador.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* mensagens */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 rounded shadow-sm text-sm font-medium 
                         text-white bg-blue-600 hover:bg-blue-700 
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>

        <p className="text-center">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

