import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.status === 201) {
        setMessage("Registro bem-sucedido! Redirecionando para login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errData = await response.json();
        setError(errData.message || "Erro ao registrar.");
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
